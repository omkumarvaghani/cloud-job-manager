const express = require("express");
const router = express.Router();
const moment = require("moment");
const Payment = require("./model");
const NmiKey = require("../../Superadmin/NMIKeys/model");
const { cardPayment, achPayment } = require("../../NMI/NmiAPi");
const Activities = require("../ActivitiesModel");
const { verifyLoginToken } = require("../../../authentication");

const chargePayment = async (req) => {
  try {
    const {
      entryData,
      CompanyId,
      customer_vault_id,
      CustomerId,
      PaymentId,
      recurringId,
    } = req;

    if (!entryData || !Array.isArray(entryData) || entryData.length === 0) {
      return {
        statusCode: 400,
        message: "Invalid or missing entryData.",
      };
    }

    const NmisecretKey = await NmiKey.findOne({ CompanyId });

    if (!NmisecretKey) {
      return {
        statusCode: 404,
        message: "Security key not found",
      };
    }

    const results = [];

    for (const paymentDetails of entryData) {
      try {
        paymentDetails.CompanyId = CompanyId;
        paymentDetails.customer_vault_id = customer_vault_id;
        paymentDetails.CustomerId = CustomerId;
        paymentDetails.PaymentId = PaymentId;

        let nmiResponse;
        if (paymentDetails.method === "card") {
          nmiResponse = await cardPayment(
            paymentDetails,
            NmisecretKey.SecurityKey
          );
        } else if (paymentDetails.method === "ach") {
          nmiResponse = await achPayment(
            paymentDetails,
            NmisecretKey.SecurityKey
          );
        } else if (
          paymentDetails.method === "cash" ||
          paymentDetails.method === "check"
        ) {
          nmiResponse.transactionid = Date.now();
          nmiResponse.response_code = "100";
          // await Payment.create({
          //   ...paymentDetails,
          //   transactionid: nmiResponse.transactionid,
          //   responsetext: nmiResponse.responsetext,
          // });
        } else {
          results.push({
            paymentDetails,
            status: "failed",
            message: `Unsupported payment type: ${paymentDetails.type}`,
          });
          continue;
        }

        await Activities.create({
          ActivityId: `${Date.now()}`,
          CompanyId,
          Action: "Add",
          Entity:
            paymentDetails.type === "card" ? "Card Payment" : "ACH Payment",
          Entity_id: paymentDetails.payment_id,
          ActivityBy: req.Role,
          ActivityByUsername: req.userName,
          Activity: {
            description:
              nmiResponse.response_code === "100"
                ? `Added new payment of $${paymentDetails.amount}`
                : `Failed new payment of $${paymentDetails.amount}`,
          },
          Reason: nmiResponse.responsetext,
          createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        });


        if (nmiResponse.response_code) {
          // const successMessage = `Payment done successfully! Transaction ID: ${nmiResponse.transactionid}`;

          const isSuccess = nmiResponse.response_code === "100";
          const successMessage = isSuccess
            ? `Payment done successfully! Transaction ID: ${nmiResponse.transactionid}`
            : `Failed to process payment: ${nmiResponse.responsetext}`;

          await Payment.create({
            ...paymentDetails,
            // transactionid: nmiResponse.transactionid,
            responsetext: successMessage,
            IsPaymentSuccess: isSuccess,
            recurringId: recurringId ?? null,
            transactionid : nmiResponse.transactionid ?? null,
          });

          results.push({
            paymentDetails,
            status: "success",
            message: successMessage,
            data: nmiResponse,
          });
        } else {
          results.push({
            paymentDetails,
            status: "failed",
            message: `Failed to process payment: ${nmiResponse.responsetext}`,
            data: nmiResponse,
          });
        }
      } catch (error) {
        console.error(
          `Error processing payment for payment_id ${paymentDetails.payment_id}:`,
          error.message
        );
        results.push({
          paymentDetails,
          status: "error",
          message: "Error occurred while processing this payment.",
          error: error.message,
        });
      }
    }

    return {
      statusCode: 200,
      message: "Payments processed.",
      results,
    };
  } catch (error) {
    console.error("Error in chargePayment:", error.message);
    return {
      statusCode: 500,
      message: "Something went wrong, please try later!",
    };
  }
};

router.post("/charge-payment", verifyLoginToken, chargePayment);

module.exports = { router, chargePayment };

var express = require("express");
var router = express.Router();
const moment = require("moment");
var Charge = require("./model");
const Activities = require("../ActivitiesModel");
const { verifyLoginToken } = require("../../../authentication");
const { createInvoice, getMaxInvoiceNumber } = require("../Invoice/route");
const { validateChargeBody, chargeValidationSchema } = require("../Charge/validation");

const createCharge = async (data, req) => {
  try {
    const timestamp = Date.now();
    data["charge_id"] = `${timestamp}`;
    data["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    data["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

    if (data.recurring_charge_id) {
      data["IsRecurring"] = true;
    } else {
      data["IsRecurring"] = false;
    }
    data["description"] = data.recurring_charge_id
      ? "Recurring charge"
      : "One-time charge";
    const newCharge = await Charge.create(data);

    const maxInvoiceData = await getMaxInvoiceNumber(req.CompanyId);
    const invoiceNumber = maxInvoiceData.InvoiceNumber + 1;

    data["InvoiceNumber"] = invoiceNumber;

    const invoiceData = await createInvoice(
      {
        ...data,
        Total: newCharge.amount,
        subTotal: newCharge.amount,
        account_id: newCharge.account_id,
        InvoiceNumber: invoiceNumber,
        description: newCharge.description,
      },
      req
    );

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: newCharge.CompanyId,
      Action: "ADD",
      Entity: "Charge",
      EntityId: newCharge.account_id,
      ActivityBy: req.tokenData.role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Created a new Charge`,
      },
      Reason: "Charge creation",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      message: "Add Charge Successfully",
      data: newCharge,
      invoiceData,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: error.message,
    };
  }
};

router.post("/", verifyLoginToken,validateChargeBody(chargeValidationSchema), async (req, res) => {
  try {
    const response = await createCharge(req.body, req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

router.get("/recurring/:CustomerId", async (req, res) => {
  try {
    const CustomerId = req.params.CustomerId;

    const charges = await Charge.find({
      CustomerId: CustomerId,
      IsRecurring: true,
    });

    const totalAmount = charges.reduce(
      (total, charge) => total + parseFloat(charge.amount),
      0
    );

    return res.status(200).json({
      statusCode: 200,
      message: "Recurring charges fetched successfully",
      data: charges,
      totalAmount: totalAmount.toFixed(2),
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later!",
    });
  }
});

module.exports = { router, createCharge };

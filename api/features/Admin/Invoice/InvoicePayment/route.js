const express = require("express");
const router = express.Router();
const moment = require("moment");

const InvoicePayment = require("./model");
const Invoice = require("../model");
const NmiKey = require("../../../Superadmin/NMIKeys/model");
var PlanPurchase = require("../../PlanPurchase/model");
var Plan = require("../../../Superadmin/Plan/model");

const { achPayment, cardPayment } = require("../../../NMI/NmiAPi");
const { invoiceReciept } = require("../../../htmlFormates/htmlContent");
const { generateAndSavePdf } = require("../../../generatePdf");
const Activities = require("../../ActivitiesModel");
const { verifyLoginToken } = require("../../../../authentication");
const { handleTemplate } = require("../../Template/route");

const addPayment = async (body) => {
  await InvoicePayment.create(body);
};

router.post("/ach-payment", verifyLoginToken, async (req, res) => {
  try {
    const { paymentDetails } = req.body;
    const NmisecretKey = await NmiKey.findOne({
      CompanyId: paymentDetails.CompanyId,
    });

    if (!NmisecretKey) {
      sendResponse(res, { status: 404, error: `Security key not found` }, 404);
      return;
    }

    const nmiResponse = await achPayment(
      paymentDetails,
      NmisecretKey.SecurityKey
    );

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: paymentDetails.CompanyId,
      Action: "Add",
      Entity: "ACH Payment",
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

    if (nmiResponse.response_code === "100") {
      const successMessage = `Payment done successfully! Transaction ID: ${nmiResponse.transactionid}`;

      await addPayment({
        ...paymentDetails,
        transactionid: nmiResponse.transactionid,
      });
      console.log(res,"res")
      return res.status(200).json({
        statusCode: 100,
        message: successMessage,
        data: nmiResponse,
      });
    } else {
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

router.post("/card-payment", verifyLoginToken, async (req, res) => {
  try {
    const { paymentDetails } = req.body;
    const NmisecretKey = await NmiKey.findOne({
      CompanyId: paymentDetails.CompanyId,
    });

    if (!NmisecretKey) {
      sendResponse(res, { status: 404, error: `Security key not found` }, 404);
      return;
    }

    const nmiResponse = await cardPayment(
      paymentDetails,
      NmisecretKey.SecurityKey
    );

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: paymentDetails.CompanyId,
      Action: "Add",
      Entity: "Card Payment",
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

    if (nmiResponse.response_code === "100") {
      const successMessage = `Payment done successfully! `;

      await addPayment({
        ...paymentDetails,
        transactionid: nmiResponse.transactionid,
      });

      return res.status(200).json({
        statusCode: 100,
        message: successMessage,
        data: nmiResponse,
      });
    } else {
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

router.post("/payment", verifyLoginToken, async (req, res) => {
  try {
    const { paymentDetails } = req.body;

    await addPayment(paymentDetails);

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: paymentDetails.CompanyId,
      Action: "Add",
      Entity: "Cash Or Check Payment",
      Entity_id: paymentDetails.payment_id,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Added new payment of $${paymentDetails.amount}`,
      },
      Reason: `${paymentDetails.method} Payment`,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return res.status(200).json({
      statusCode: 100,
      message: "Payment done successfully!",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

const getInvoice = async (InvoiceId) => {
  try {
    const invoiceData = await Invoice.aggregate([
      {
        $match: { InvoiceId, IsDelete: false },
      },
      {
        $lookup: {
          from: "customers",
          localField: "CustomerId",
          foreignField: "CustomerId",
          as: "customerData",
        },
      },
      { $unwind: "$customerData" },
      {
        $set: {
          customer: {
            FirstName: "$customerData.FirstName",
            LastName: "$customerData.LastName",
            PhoneNumber: "$customerData.PhoneNumber",
            EmailAddress: "$customerData.EmailAddress",
          },
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "companyId",
          foreignField: "CompanyId",
          as: "Company",
        },
      },
      { $unwind: "$Company" },
      {
        $set: {
          CompanyData: {
            CompanyName: "$Company.companyName",
            PhoneNumber: "$Company.phoneNumber",
            EmailAddress: "$Company.EmailAddress",
            IsPlanActive: "$Company.IsPlanActive",
            location: {
              Address: "$Company.Address",
              City: "$Company.City",
              State: "$Company.State",
              Country: "$Company.Country",
              Zip: "$Company.Zip",
            },
          },
        },
      },
      {
        $lookup: {
          from: "locations",
          localField: "LocationId",
          foreignField: "LocationId",
          as: "locationData",
        },
      },
      { $unwind: "$locationData" },
      {
        $set: {
          location: {
            Address: "$locationData.Address",
            City: "$locationData.City",
            State: "$locationData.State",
            Country: "$locationData.Country",
            Zip: "$locationData.Zip",
          },
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "account_id",
          foreignField: "account_id",
          as: "accountData",
        },
      },
      { $unwind: { path: "$accountData", preserveNullAndEmptyArrays: true } },
      {
        $set: {
          account_name: "$accountData.account_name",
        },
      },
      {
        $project: {
          CompanyId: 1,
          InvoiceId: 1,
          CustomerId: 1,
          LocationId: 1,
          Subject: 1,
          InvoiceNumber: 1,
          DueDate: 1,
          Discount: 1,
          Tax: 1,
          subTotal: 1,
          Total: 1,
          customer: 1,
          location: 1,
          CompanyData: 1,
          account_id: 1,
          account_name: 1,
        },
      },
    ]);

    if (!invoiceData[0]) {
      return { error: "Invoice not found", statusCode: 404 };
    }

    const customerInvoices = await Invoice.find({
      CustomerId: invoiceData[0].CustomerId,
      IsDelete: false,
    });

    const customerTotalAmount = customerInvoices.reduce(
      (acc, item) => acc + Number(item.Total),
      0
    );

    const invoicePaymentData = await InvoicePayment.find({
      InvoiceId,
      IsDelete: false,
    });

    const customerInvoicePayments = await InvoicePayment.find({
      CustomerId: invoiceData[0].CustomerId,
      IsDelete: false,
    });

    const customerPaidAmount = customerInvoicePayments.reduce(
      (acc, item) => acc + Number(item.amount),
      0
    );

    const totalPaidAmount = invoicePaymentData.reduce(
      (acc, elem) => acc + Number(elem.amount),
      0
    );

    const planPurchase = await PlanPurchase.findOne({
      CompanyId: invoiceData[0].CompanyId,
      IsDelete: false,
    });

    // let planName = null;
    let planName = null;

    if (planPurchase) {
      const planData = await Plan.findOne({
        PlanId: planPurchase?.PlanId,
        IsDelete: false,
      });
      if (planData) {
        // Check if the company has an active plan
        if (invoiceData[0]?.CompanyData?.IsPlanActive === true) {
          planName = planData.PlanName;
        } else if (invoiceData[0]?.CompanyData?.IsPlanActive === false) {
          planName = "no active plan";
        }
      }
    }

    if (!planName) {
      planName = "Trial Plan";
    }

    return {
      invoiceData: {
        ...invoiceData[0],
        invoiceAccount: (
          Number(invoiceData[0].Total) - Number(totalPaidAmount) || 0
        ).toFixed(2),
        customerAccount: (
          Number(customerTotalAmount) - Number(customerPaidAmount) || 0
        ).toFixed(2),
        totalPaidAmount: Number(totalPaidAmount || 0).toFixed(2),
        paymentHistory: invoicePaymentData,
        Date: moment(new Date()).format("YYYY-MM-DD"),
        Total: Number(invoiceData[0].Total || 0).toFixed(2),
        planData: planName,
      },
      statusCode: 200,
    };
  } catch (error) {
    console.error(`Error fetching invoice: ${error.message}`);
    return {
      error: "Something went wrong, please try later!",
      statusCode: 500,
    };
  }
};

router.get("/:InvoiceId", async (req, res) => {
  try {
    const { InvoiceId } = req.params;
    const response = await getInvoice(InvoiceId);

    if (response.statusCode !== 200) {
      return res.status(response.statusCode).json({
        statusCode: response.statusCode,
        message: response.error,
      });
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

router.post("/send_mail/:InvoiceId", async (req, res) => {
  try {
    const { InvoiceId } = req.params;

    const response = await getInvoice(InvoiceId);
    const invoiceData = response.invoiceData;
    // Generate HTML and PDF for the invoice
    const html = await invoiceReciept(invoiceData);
    const fileName = await generateAndSavePdf(html);

    // const recentPayment = invoiceData?.paymentHistory.reduce(
    //   (latest, current) =>
    //     new Date(current.createdAt) > new Date(latest.createdAt)
    //       ? current
    //       : latest
    // );

    const recentPayment = invoiceData?.paymentHistory.length
      ? invoiceData?.paymentHistory.reduce((latest, current) =>
          new Date(current.createdAt) > new Date(latest.createdAt)
            ? current
            : latest
        )
      : {};

    // Construct email content with enhanced design
    //     const emailBody = `
    //   <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    //     <h2 style="color:#063164;">Hello ${invoiceData.customer?.FirstName || ""} ${
    //       invoiceData.customer?.LastName || ""
    //     },</h2>

    //    <p>Payment Method: <strong>${recentPayment.method || "N/A"}</strong></p>
    //     <p>Amount Paid: <strong>$${recentPayment.amount || "0.00"}</strong></p>

    //     <p>Thank you for your payment of <strong>$${
    //       recentPayment.Total || "0.00"
    //     }</strong>.</p>

    //     <p>Your receipt is attached to this email. Please keep it for your records. If you have any questions or need assistance, feel free to reach out to us at
    //       <a href="mailto:${invoiceData.CompanyData?.EmailAddress || ""}"
    //          style="color:#063164; font-size:18px; text-decoration: none;">
    //         ${invoiceData.CompanyData?.EmailAddress || "support@example.com"}
    //       </a>.
    //     </p>

    //     <p>Best regards,</p>
    //     <p><strong>${
    //       invoiceData.CompanyData?.CompanyName || "Your Company Name"
    //     }</strong></p>
    //     <p>Contact us: ${invoiceData.CompanyData?.PhoneNumber || "N/A"}</p>
    //   </div>
    // `;

    const emailBody = `
   <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); border: 1px solid #e88c44;">
  <!-- Header Section (Logo at the Top) -->
  <tr>
    <td style="padding: 30px 0; text-align: center; background-color: #063164; border-top-left-radius: 12px; border-top-right-radius: 12px;">
      <div style="display: inline-block; padding: 15px; background-color: white; border-radius: 8px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);">
        <img src="https://app.cloudjobmanager.com/cdn/upload/20250213103016_site-logo2.png" alt="CloudJobManager Logo" style="width: 180px; max-width: 100%; display: block; margin: auto;" />
      </div>
    </td>
  </tr>
  
  <tr>
    <td style="padding: 40px;font-family: 'Arial', sans-serif; color: #555;text-align:center;">
      <h2 style="font-size: 24px; color: #003366; text-align: center;  font-weight: 700;">Your Invoice Payment is Ready!</h2>
      <h2 style="color:#063164;">Hello ${
        invoiceData.customer?.FirstName || ""
      } ${invoiceData.customer?.LastName || ""},</h2>
     <p>Payment Method: <strong>${recentPayment.method || "N/A"}</strong></p>
     <p>Amount Paid: <strong>$${recentPayment.amount || "0.00"}</strong></p>

     <p>Thank you for your payment of <strong>$${
       recentPayment.Total || "0.00"
     }</strong>.</p>

      

     <p>Your receipt is attached to this email. Please keep it for your records. If you have any questions or need assistance, feel free to reach out to us at 
      <a href="mailto:${invoiceData.CompanyData?.EmailAddress || ""}" 
        style="color:#063164; font-size:18px; text-decoration: none;">
        ${invoiceData.CompanyData?.EmailAddress || "support@example.com"}
      </a>.
    </p>

    <p>Best regards,</p>
     <p><strong>${
       invoiceData.CompanyData?.CompanyName || "Your Company Name"
     }</strong></p>
    <p>Contact us: ${invoiceData.CompanyData?.PhoneNumber || "N/A"}</p>
    </td>
  </tr>

  <!-- Footer Section -->
  <tr>
    <td style="padding: 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f4f4f7; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; font-family: 'Arial', sans-serif;">
      CloudJobManager, Inc. | All rights reserved.<br>
      <a href="#" style="color: #e88c44; text-decoration: none; font-weight: 600;">Unsubscribe</a> if you no longer wish to receive these emails.
    </td>
  </tr>
</table>
`;

    // Prepare email payload
    const emailPayload = [
      {
        FirstName: invoiceData.customer.FirstName || "",
        LastName: invoiceData.customer.LastName || "",
        EmailAddress: invoiceData.customer.EmailAddress || "",
        PhoneNumber: invoiceData.customer.PhoneNumber || "",
        Total: invoiceData.Total || "",
        Method: recentPayment.method || "",
        Amount: recentPayment.amount || "",
        EmailAddress: invoiceData.CompanyData.EmailAddress || "",
        companyName: invoiceData.CompanyData.CompanyName || "",
        companyPhoneNumber: invoiceData.CompanyData.phoneNumber || "",
      },
    ];

    // Send email with the invoice attachment
    const emailStatus = await handleTemplate(
      "Invoice Payment", // Template Name
      invoiceData.CompanyId, // Company ID
      emailPayload, // Email Payload
      [fileName], // Attachments
      "Invoice Payment", // Email Subject
      emailBody, // Email Body
      invoiceData.CustomerId // Customer ID
    );

    // Respond with appropriate status
    return res.status(200).json({
      statusCode: emailStatus ? 200 : 203,
      message: emailStatus.message,
    });
  } catch (error) {
    console.error("Error in /send_mail/:InvoiceId route:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later!",
    });
  }
});

module.exports = { router };

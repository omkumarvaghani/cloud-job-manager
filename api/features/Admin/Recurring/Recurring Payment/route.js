var express = require("express");
var router = express.Router();
const moment = require("moment");
var Recurring = require("./model");
const Payment = require("../../Payment/model");
const Activities = require("../../ActivitiesModel");
const { verifyLoginToken } = require("../../../../authentication");
const { getNextDueDate } = require("../Recurring Charge/route");
const { v4: uuidv4 } = require("uuid");
const { addNotification } = require("../../../Notification/notification");

const {
  paymentReportPdf,
} = require("../../../htmlFormates/PaymentReportFunction");
const { validateRecurringPaymentBody, recurringPaymentValidationSchema } = require("./validation");

// const addRecurring = async (data, req) => {
//   try {
//     let query = {
//       CustomerId: data.CustomerId,
//     };

//     if (!data.recurrings || data.recurrings.length === 0) {
//       throw new Error("No recurring data provided");
//     }

//     const today = moment().format("YYYY-MM-DD");

//     const updatedRecurrings = await Promise.all(
//       data.recurrings.map(async (recurring) => {
//         const {
//           frequency,
//           frequency_interval,
//           day_of_month,
//           weekday,
//           month,
//           day_of_year,
//           days_after_quarter,
//         } = recurring;

//         const n = parseInt(frequency_interval, 10) || 0;

//         const nextDueDate = getNextDueDate(
//           today,
//           frequency,
//           n,
//           day_of_month,
//           weekday,
//           month,
//           day_of_year,
//           days_after_quarter
//         );

//         recurring["nextDueDate"] = nextDueDate;
//         return recurring;
//       })
//     );

//     const recurringData = await Recurring.findOne(query);

//     if (recurringData) {
//       await Recurring.findOneAndUpdate(
//         { recurringId: recurringData.recurringId },
//         {
//           $set: {
//             ...data,
//             IsDelete: false,
//             recurrings: updatedRecurrings,
//           },
//         },
//         { new: true }
//       );

//       await Activities.create({
//         ActivityId: `${Date.now()}`,
//         CompanyId: req.tokenData.companyId,
//         Action: "UPDATE",
//         Entity: "RecurringPayment",
//         EntityId: recurringData.recurringId,
//         ActivityBy: req.tokenData.role,
//         ActivityByUsername: req.userName,
//         Activity: {
//           description: `Updated a Recurring Payment data for property`,
//         },
//         Reason: "Recurring creation",
//         createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//         updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//       });
//     } else {
//       await Recurring.create({
//         ...data,
//         recurringId: Date.now(),
//         recurrings: updatedRecurrings,
//       });

//       await Activities.create({
//         ActivityId: `${Date.now()}`,
//         CompanyId: req.tokenData.companyId,
//         Action: "ADD",
//         Entity: "RecurringPayment",
//         EntityId: Date.now(),
//         ActivityBy: req.tokenData.role,
//         ActivityByUsername: req.userName,
//         Activity: {
//           description: `Enabled a Recurring Payment data for property`,
//         },
//         Reason: "Recurring creation",
//         createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//         updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//       });
//     }

//     return {
//       statusCode: 201,
//       message: "Recurring cards added.",
//     };
//   } catch (error) {
//     console.log(error);
//     return {
//       statusCode: 500,
//       message: "Something went wrong, please try after some time.",
//     };
//   }
// };

// router.post("/add-cards", verifyLoginToken, async (req, res) => {
//   try {
//     if (req.body && req.body?.length > 0) {
//       for (const element of req.body) {
//         var response = await addRecurring(element, req);
//         if (response.statusCode !== 201) {
//           return res.status(200).json(response);
//         }
//       }
//       return res.status(200).json(response);
//     }
//   } catch (error) {
//     return res.status(500).json({
//       error,
//       message: "Something went wrong, please try again after sometime.",
//     });
//   }
// });

const addRecurring = async (data, req) => {
  try {
    data["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    if (!data) {
      throw new Error("No recurring data provided");
    }

    const today = moment().format("YYYY-MM-DD");

    const {
      frequency,
      frequency_interval,
      day_of_month,
      weekday,
      month,
      day_of_year,
      days_after_quarter,
    } = data;

    const n = parseInt(frequency_interval, 10) || 0;
    const nextDueDate = getNextDueDate(
      today,
      frequency,
      n,
      day_of_month,
      weekday,
      month,
      day_of_year,
      days_after_quarter
    );

    data.nextDueDate = nextDueDate;

    data.IsRecurring = true;

    // Always create a new record without checking existing ones
    const newRecurring = await Recurring.create({
      ...data,
      recurringId: uuidv4(),
    });

    await Activities.create({
      ActivityId: `${Date.now()}`,
      Action: "ADD",
      Entity: "RecurringPayment",
      EntityId: newRecurring.recurringId,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Enabled a Recurring Payment data for property`,
      },
      Reason: "Recurring creation",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    await addNotification({
      CompanyId: data.CompanyId,
      recurringId: newRecurring.recurringId,
      CustomerId: data.CustomerId,
      AddedAt: data.createdAt,
      CreatedBy: "RecurringPayment",
    });
    return {
      statusCode: 200,
      message: "Recurring card added.",
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      message: "Something went wrong, please try after some time.",
    };
  }
};

router.post("/add-cards",validateRecurringPaymentBody(recurringPaymentValidationSchema), async (req, res) => {
  try {
    if (req.body) {
      var response = await addRecurring(req.body, req);
      return res.status(200).json(response);
    }
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Something went wrong, please try again after sometime.",
    });
  }
});

const getRecurring = async (CustomerId) => {
  try {
    let query = {
      IsDelete: false,
      CustomerId,
    };

    const data = await Recurring.aggregate([{ $match: query }]);

    if (data.length > 0) {
      data[0].recurrings = data[0].recurrings.map((recurring) => {
        return Object.fromEntries(
          Object.entries(recurring).filter(
            ([, value]) => value !== null && value !== undefined && value !== ""
          )
        );
      });

      return {
        statusCode: 200,
        data: data[0],
      };
    } else {
      return {
        statusCode: 204,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      message: "Something went wrong, please try after sometime.",
    };
  }
};

router.post("/get-cards", verifyLoginToken, async (req, res) => {
  try {
    const { CustomerId } = req.body;
    const response = await getRecurring(CustomerId);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong, please try after sometime.",
    });
  }
});

const disableReccuringPayment = async (CustomerId, req) => {
  try {
    const updateRecurring = await Recurring.findOneAndUpdate(
      { CustomerId: CustomerId },
      { $set: { IsDelete: true } },
      { new: true }
    );

    if (!updateRecurring) {
      return {
        statusCode: 404,
        message: "Recurring payment not found.",
      };
    }

    // Create activity log
    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: req.tokenData.companyId,
      Action: "Delete",
      Entity: "RecurringPayment",
      EntityId: updateRecurring._id,
      ActivityBy: req.tokenData.role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Disabled a Recurring`,
      },
      Reason: "Recurring Delete",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });
    return {
      statusCode: 200,
      message: "Recurring payment updated successfully.",
    };
  } catch (error) {
    console.error("Error in disableReccuringPayment:", error);
    return {
      statusCode: 500,
      message: "Something went wrong, please try again later.",
    };
  }
};

router.put("/disable-cards/:CustomerId", verifyLoginToken, async (req, res) => {
  try {
    const { CustomerId } = req.params;
    const response = await disableReccuringPayment(CustomerId, req);

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Error in disable-cards route:", error);
    return res.status(500).json({
      message: "Something went wrong, please try again later.",
    });
  }
});

const getRecurringPayment = async (query, CustomerId, req) => {
  const sortOrder = query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;

  const pageSize = parseInt(query.pageSize) || 10;
  const pageNumber = parseInt(query.pageNumber) || 0;
  const search = query.search;

  const allowedSortFields = [
    "frequency",
    "account_name",
    "amount",
    "description",
    "nextDueDate",
    "updatedAt",
    "createdAt",
  ];

  const sortField = allowedSortFields.includes(query.sortField)
    ? query.sortField
    : "updatedAt";

  const sortOptions = {
    [sortField]: sortOrder,
  };

  let accountQuery = { CustomerId, IsDelete: false };
  const collation = { locale: "en", strength: 2 };

  const skip = pageNumber * pageSize;

  try {
    const chargesWithAccountName = await Recurring.aggregate([
      { $match: accountQuery },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: pageSize },
      {
        $lookup: {
          from: "accounts",
          localField: "account_id",
          foreignField: "account_id",
          as: "accountDetails",
        },
      },
      {
        $unwind: {
          path: "$accountDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            { frequency: { $regex: search, $options: "i" } },
            {
              "accountDetails.account_name": { $regex: search, $options: "i" },
            },
            { description: { $regex: search, $options: "i" } },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          recurringId: 1,
          createdAt: 1,
          updatedAt: 1,
          description: 1,
          day_of_month: 1,
          amount: 1,
          account_name: "$accountDetails.account_name",
          frequency: 1,
          frequency_interval: 1,
          nextDueDate: 1,
          recurring_charge_id: 1,
          recurringId: 1,
          month: 1,
          weekday: 1,
          day_of_year: 1,
          days_after_quarter: 1,
        },
      },
    ]).collation(collation);

    const totalCount = await Recurring.countDocuments(accountQuery);

    const totalAmount = await Recurring.aggregate([
      { $match: accountQuery },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalAmountValue =
      totalAmount.length > 0 ? totalAmount[0].totalAmount : 0;

    return {
      statusCode: chargesWithAccountName.length > 0 ? 200 : 201,
      data: chargesWithAccountName,
      totalCount,
      totalAmount: totalAmountValue,
      pageSize,
      pageNumber,
      message:
        chargesWithAccountName.length > 0
          ? "Charges retrieved successfully"
          : "No charges found for the given CustomerId",
    };
  } catch (error) {
    console.error("Error fetching charges:", error);
    return {
      statusCode: 500,
      message: "An error occurred while retrieving charges",
      error: error.message,
    };
  }
};

router.get("/:CustomerId", verifyLoginToken, async (req, res, next) => {
  const CustomerId = req.params.CustomerId;
  const query = req.query;
  query.sortField = query.sortField || "updatedAt";
  query.sortOrder = query.sortOrder || "desc";
  try {
    const response = await getRecurringPayment(query, CustomerId, req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
});

const updateRecurring = async (
  recurringId,
  updateData,
  tokenData,
  userName
) => {
  try {
    const updatedRecurring = await Recurring.findOneAndUpdate(
      { recurringId: recurringId, IsDelete: false },
      {
        $set: updateData,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        recurringId: recurringId,
      },
      { new: true }
    );

    if (!updatedRecurring) {
      return {
        statusCode: 404,
        message: "Recurring not found",
      };
    }

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: updatedRecurring.CompanyId,
      Action: "UPDATE",
      Entity: "Recurring",
      EntityId: updatedRecurring.recurringId,
      ActivityBy: tokenData.role,
      ActivityByUsername: userName,
      Activity: {
        description: `Updated an Account: ${updatedRecurring.frequency} (${updatedRecurring.amount})`,
      },
      Reason: "Recurring updating",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      data: updatedRecurring,
      message: "Account updated successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
};

router.put("/:recurringId", verifyLoginToken, async (req, res) => {
  try {
    const { recurringId } = req.params;
    const updateData = req.body;
    const { tokenData, userName } = req;

    const result = await updateRecurring(
      recurringId,
      updateData,
      tokenData,
      userName
    );

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

const deleteRecurringPayment = async (recurringId, DeleteReason, req) => {
  try {
    const deletedPayment = await Recurring.findOneAndUpdate(
      { recurringId: recurringId },
      { $set: { IsDelete: true, DeleteReason } },
      { new: true }
    );

    if (!deletedPayment) {
      return { statusCode: 404, message: "Account not found" };
    }

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: deletedPayment.CompanyId,
      Action: "DELETE",
      Entity: "Reccuring Charge",
      EntityId: deletedPayment.recurringId,
      ActivityBy: req.tokenData.role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Deleted Recurring Payment : ${deletedPayment.frequency} (${deletedPayment.amount})`,
      },
      Reason: DeleteReason,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      data: deletedPayment,
      message: "Reccuring Payment deleted successfully",
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

router.delete(
  "/deleterecpayment/:recurringId",
  verifyLoginToken,
  async (req, res) => {
    const recurringId = req.params.recurringId;
    const DeleteReason = req.body.reason || "No Reason Provided";

    try {
      const response = await deleteRecurringPayment(
        recurringId,
        DeleteReason,
        req
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

const getRecuPayment = async (recurringId) => {
  try {
    const payment = await Recurring.aggregate([
      {
        $match: { recurringId },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "account_id",
          foreignField: "account_id",
          as: "account_details",
        },
      },
      {
        $unwind: { path: "$account_details", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          account_name: "$account_details.account_name",
        },
      },
      {
        $project: {
          recurringId: 1,
          CompanyId: 1,
          CustomerId: 1,
          customer_vault_id: 1,
          card_type: 1,
          billing_id: 1,
          amount: 1,
          account_id: 1,
          frequency_interval: 1,
          frequency: 1,
          day_of_month: 1,
          weekday: 1,
          day_of_year: 1,
          month: 1,
          days_after_quarter: 1,
          account_details: 1,
          cc_number: 1,
          description: 1,
        },
      },
    ]);

    if (!payment || payment.length === 0) {
      return {
        statusCode: 404,
        message: "Recurring payment not found",
      };
    }

    return {
      statusCode: 200,
      message: "Recurring payment fetched successfully",
      data: payment[0],
    };
  } catch (error) {
    console.error(error.message);
    return {
      statusCode: 500,
      message: "Something went wrong, please try again later!",
    };
  }
};

router.get(
  "/recurring-payments/:recurringId",
  verifyLoginToken,
  async (req, res) => {
    const { recurringId } = req.params;

    try {
      const response = await getRecuPayment(recurringId);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try again later!",
      });
    }
  }
);

const getRecurringStatus = async (recurringId) => {
  try {
    const paymentData = await Payment.aggregate([
      {
        $match: { recurringId: recurringId },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          recurringId: 1,
          transactionid: 1,
          createdAt: 1,
          amount: 1,
          method: 1,
          IsPaymentSuccess: 1,
          responsetext: 1,
        },
      },
    ]);

    if (paymentData.length === 0) {
      return {
        statusCode: 404,
        message: "No payment data found for this recurring ID.",
      };
    }

    const formattedPaymentData = paymentData.map((payment) => ({
      ...payment,
      createdAt: moment(payment.createdAt).format("YYYY-MM-DD"),
      amount: `$${new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(payment.amount || 0.0)}`,
    }));
    return {
      statusCode: 200,
      data: formattedPaymentData,
      message: "Data retrieved successfully.",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Something went wrong, please try again later!",
    };
  }
};

router.get(
  "/recurring-status/:recurringId",
  verifyLoginToken,
  async (req, res) => {
    const { recurringId } = req.params;

    try {
      const response = await getRecurringStatus(recurringId);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try again later!",
      });
    }
  }
);

module.exports = router;

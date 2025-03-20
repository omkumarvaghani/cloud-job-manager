var express = require("express");
var router = express.Router();
const moment = require("moment");
var RecurringCharge = require("./model");
var Account = require("../../Account/model");
var Charge = require("../../Charge/model");
const Activities = require("../../ActivitiesModel");
const { verifyLoginToken } = require("../../../../authentication");
const { v4: uuidv4 } = require("uuid");
const { addNotification } = require("../../../Notification/notification");
const {
  validateChargeBody,
  chargeValidationSchema,
  validateRecurringChargeBody,
  recurringChargeValidationSchema,
} = require("./validation");

const getNextDueDate = (
  today,
  cycle,
  n = 0,
  day_of_month = null,
  weekday = null,
  month = null,
  day_of_year = null,
  days_after_quarter = null
) => {
  const startDate = moment(today, "YYYY-MM-DD");
  let nextDueDate = startDate.clone();
  const weekdayMapping = {
    Sunday: 7,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  try {
    switch (cycle) {
      case "Weekly":
        if (weekday !== null) {
          const targetWeekday = weekdayMapping[weekday];
          const todayWeekday = startDate.isoWeekday();

          if (todayWeekday === targetWeekday) {
            nextDueDate.add(7, "days");
          } else {
            while (nextDueDate.isoWeekday() !== targetWeekday) {
              nextDueDate.add(1, "days");
            }
          }
        } else {
          nextDueDate.add(7, "days");
        }
        break;

      case "Monthly":
        if (day_of_month !== null) {
          if (day_of_month > startDate.date()) {
            nextDueDate.date(day_of_month);
          } else {
            nextDueDate.add(1, "month").date(day_of_month);
          }
        } else {
          nextDueDate.add(1, "month");
        }
        break;

      case "Quarterly":
        const quarterStartMonth = Math.floor(startDate.month() / 3) * 3;
        nextDueDate.month(quarterStartMonth + 3);
        if (days_after_quarter !== null) {
          nextDueDate.date(1);
          nextDueDate.add(days_after_quarter - 1, "days");
        }
        break;

      case "Yearly":
        if (month !== null && day_of_year !== null) {
          if (startDate.month() + 1 < month) {
            nextDueDate.month(month - 1).date(day_of_year);
          } else if (startDate.month() + 1 > month) {
            nextDueDate
              .add(1, "year")
              .month(month - 1)
              .date(day_of_year);
          } else {
            if (startDate.date() < day_of_year) {
              nextDueDate.date(day_of_year);
            } else {
              nextDueDate.add(1, "year").date(day_of_year);
            }
          }
        } else if (month !== null) {
          if (startDate.month() + 1 < month) {
            nextDueDate.month(month - 1).date(1);
          } else {
            nextDueDate
              .add(1, "year")
              .month(month - 1)
              .date(1);
          }
        } else if (day_of_year !== null) {
          if (startDate.date() < day_of_year) {
            nextDueDate.date(day_of_year);
          } else {
            nextDueDate.add(1, "year").date(day_of_year);
          }
        } else {
          nextDueDate.add(1, "year");
        }
        break;

      case "Every n Weeks":
        if (n <= 0) throw new Error("Invalid value for 'n' in 'Every N weeks'");
        nextDueDate.add((n - 1) * 7, "days");
        if (weekday !== null) {
          const targetWeekday = weekdayMapping[weekday];
          while (nextDueDate.isoWeekday() !== targetWeekday) {
            nextDueDate.add(1, "days");
          }
        }
        break;

      case "Every n Months":
        if (n <= 0)
          throw new Error("Invalid value for 'n' in 'Every N months'");

        nextDueDate = startDate.clone().add(n - 1, "months");

        if (day_of_month !== null) {
          nextDueDate.date(day_of_month);
        }
        break;

      // case "Every n Weeks":
      //   if (n <= 0) throw new Error("Invalid value for 'n' in 'Every N weeks'");
      //   if (weekday !== null) {
      //     const targetWeekday = weekdayMapping[weekday];
      //     const todayWeekday = nextDueDate.isoWeekday();

      //     if (todayWeekday === targetWeekday) {
      //       nextDueDate.add(n * 7, "days");
      //     } else if (todayWeekday < targetWeekday) {
      //       while (nextDueDate.isoWeekday() !== targetWeekday) {
      //         nextDueDate.add(1, "days");
      //       }
      //     } else {
      //       while (nextDueDate.isoWeekday() !== targetWeekday) {
      //         nextDueDate.add(1, "days");
      //       }
      //       nextDueDate.add((n - 1) * 7, "days");
      //     }
      //   }
      //   break;

      // case "Every n Months":
      //   if (n <= 0)
      //     throw new Error("Invalid value for 'n' in 'Every N months'");

      //   if (day_of_month !== null) {
      //     if (startDate.date() < day_of_month) {
      //       nextDueDate.date(day_of_month);
      //     } else {
      //       nextDueDate.add(n, "months").date(day_of_month);
      //     }
      //   } else {
      //     nextDueDate.add(n, "months");
      //   }
      //   break;

      default:
        throw new Error(`Invalid rent cycle: ${cycle}`);
    }

    return nextDueDate.format("YYYY-MM-DD");
  } catch (error) {
    console.error("Error in getNextDueDate:", error.message);
    throw error;
  }
};

const createCharge = async (data, req) => {
  try {
    data["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

    const {
      frequency,
      frequency_interval,
      day_of_month,
      weekday,
      month,
      day_of_year,
      days_after_quarter,
    } = data;

    const today = moment().format("YYYY-MM-DD");
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

    data["nextDueDate"] = nextDueDate;
    data["recurring_charge_id"] = uuidv4();

    const userToSave = await RecurringCharge.create(data);

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: userToSave.CompanyId,
      Action: "CREATE",
      Entity: "Charge",
      EntityId: userToSave.recurring_charge_id,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: { description: `Created a new Charge` },
      Reason: "Charge creation",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    await addNotification({
      CompanyId: data.CompanyId,
      recurring_charge_id: data.recurring_charge_id,
      CustomerId: data.CustomerId,
      AddedAt: data.createdAt,
      CreatedBy: "Recurringcharge",
    });

    return {
      statusCode: 200,
      message: "Charge Created Successfully",
      data: userToSave,
    };
  } catch (error) {
    console.error("Error in createCharge:", error.message);
    return {
      statusCode: 400,
      message: "Failed to create Charge.",
      error: error.message,
    };
  }
};

router.post(
  "/",
  verifyLoginToken,
  validateRecurringChargeBody(recurringChargeValidationSchema),
  async (req, res) => {
    try {
      const response = await createCharge(req.body, req);
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error in POST /api/charge:", error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
        error: error.message,
      });
    }
  }
);

// const getChargeWithAccountName = async (query, CustomerId, req) => {
//   // const sortField = query.sortField || "createdAt";
//   const sortOrder = query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;
//   const pageSize = parseInt(query.pageSize) || 10;
//   const pageNumber = parseInt(query.pageNumber) || 0;
//   const search = query.search;

//   const allowedSortFields = [
//     "frequency",
//     "account_name",
//     "amount",
//     "description",
//     "nextDueDate",
//     "updatedAt",
//     "createdAt",
//   ];

//   const sortField = allowedSortFields.includes(query.sortField)
//     ? query.sortField
//     : "updatedAt";

//   const sortOptions = {
//     [sortField]: sortOrder,
//   };

//   let accountQuery = { CustomerId, IsDelete: false };

//   const skip = pageNumber * pageSize;

//   try {
//     const chargesWithAccountName = await RecurringCharge.aggregate([
//       { $match: accountQuery },
//       { $sort: sortOptions },
//       { $skip: skip },
//       { $limit: pageSize },
//       {
//         $lookup: {
//           from: "accounts",
//           localField: "account_id",
//           foreignField: "account_id",
//           as: "accountDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$accountDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $match: {
//           $or: [
//             { frequency: { $regex: search, $options: "i" } },
//             {
//               "accountDetails.account_name": { $regex: search, $options: "i" },
//             },
//             { description: { $regex: search, $options: "i" } },
//           ],
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           description: 1,
//           day_of_month: 1,
//           amount: 1,
//           account_name: "$accountDetails.account_name",
//           frequency: 1,
//           frequency_interval: 1,
//           nextDueDate: 1,
//           recurring_charge_id: 1,
//           month: 1,
//           weekday: 1,
//           day_of_year: 1,
//           days_after_quarter: 1,
//         },
//       },
//     ]).collation(collation);

//     const totalCount = await RecurringCharge.countDocuments(accountQuery);
//     let sortOptions = {};
//     if (sortField) {
//       sortOptions[sortField] = sortOrder;
//     }

//     const collation = { locale: "en", strength: 2 };
//     const totalAmount = await RecurringCharge.aggregate([
//       { $match: accountQuery },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: "$amount" },
//         },
//       },
//     ]);

//     const totalAmountValue =
//       totalAmount.length > 0 ? totalAmount[0].totalAmount : 0;

//     return {
//       statusCode: chargesWithAccountName.length > 0 ? 200 : 201,
//       data: chargesWithAccountName,
//       totalCount,
//       totalAmount: totalAmountValue,
//       pageSize,
//       pageNumber,
//       message:
//         chargesWithAccountName.length > 0
//           ? "Charges retrieved successfully"
//           : "No charges found for the given CustomerId",
//     };
//   } catch (error) {
//     console.error("Error fetching charges:", error);
//     return {
//       statusCode: 500,
//       message: "An error occurred while retrieving charges",
//       error: error.message,
//     };
//   }
// };

const getChargeWithAccountName = async (query, CustomerId, req) => {
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
  const skip = pageNumber * pageSize;

  // Define collation at the top
  const collation = { locale: "en", strength: 2 };

  try {
    const chargesWithAccountName = await RecurringCharge.aggregate([
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
          month: 1,
          weekday: 1,
          day_of_year: 1,
          days_after_quarter: 1,
        },
      },
    ]).collation(collation);

    const totalCount = await RecurringCharge.countDocuments(accountQuery);

    const totalAmount = await RecurringCharge.aggregate([
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
    const response = await getChargeWithAccountName(query, CustomerId, req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    next(error);
  }
});

const deleteCharge = async (CustomerId, DeleteReason, req) => {
  try {
    const deletedCharge = await RecurringCharge.findOneAndUpdate(
      { CustomerId: CustomerId },
      { $set: { IsDelete: true, DeleteReason } },
      { new: true }
    );

    if (!deletedCharge) {
      return { statusCode: 404, message: "Account not found" };
    }

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: deletedCharge.CompanyId,
      Action: "DELETE",
      Entity: "Account",
      EntityId: deletedCharge.CustomerId,
      ActivityBy: req.tokenData.role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Deleted an Account: ${deletedCharge.description} (${deletedCharge.amount})`,
      },
      Reason: DeleteReason,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      data: deletedCharge,
      message: "Account deleted successfully",
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

router.delete("/:CustomerId", verifyLoginToken, async (req, res) => {
  const CustomerId = req.params.CustomerId;
  const DeleteReason = req.body.reason || "No Reason Provided";

  try {
    const response = await deleteCharge(CustomerId, DeleteReason, req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

const updateRecurringCharge = async (
  recurring_charge_id,
  updateData,
  DeleteReason,
  req
) => {
  try {
    const updatedCharge = await RecurringCharge.findOneAndUpdate(
      { recurring_charge_id: recurring_charge_id },
      { $set: { ...updateData, DeleteReason } },
      { new: true }
    );

    if (!updatedCharge) {
      return { statusCode: 404, message: "Account not found" };
    }

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: req.tokenData?.companyId,
      Action: "UPDATE",
      Entity: "Recurring Charge",
      EntityId: updatedCharge.recurring_charge_id,
      ActivityBy: req.tokenData?.role || "Unknown",
      ActivityByUsername: req.userName || "Unknown",
      Activity: {
        description: `Updated Recurring Charge: ${updatedCharge.description} (${updatedCharge.amount})`,
      },
      Reason: DeleteReason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      statusCode: 200,
      data: updatedCharge,
      message: "Recurring Charge updated successfully",
    };
  } catch (error) {
    console.error("Error updating recurring charge:", error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

router.put(
  "/updatereccharge/:recurring_charge_id",
  verifyLoginToken,
  async (req, res) => {
    const { recurring_charge_id } = req.params;
    const updateData = req.body;
    const DeleteReason = req.body.reason || "No Reason Provided";

    const {
      frequency,
      frequency_interval,
      day_of_month,
      weekday,
      month,
      day_of_year,
      days_after_quarter,
    } = req.body;

    const today = moment().format("YYYY-MM-DD");
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

    updateData["nextDueDate"] = nextDueDate;

    try {
      const response = await updateRecurringCharge(
        recurring_charge_id,
        updateData,
        DeleteReason,
        req
      );
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error("Error in PUT request:", error);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

const deleteRecurringCharge = async (
  recurring_charge_id,
  DeleteReason,
  req
) => {
  try {
    const deletedCharge = await RecurringCharge.findOneAndUpdate(
      { recurring_charge_id: recurring_charge_id },
      { $set: { IsDelete: true, DeleteReason } },
      { new: true }
    );

    if (!deletedCharge) {
      return { statusCode: 404, message: "Account not found" };
    }

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: deletedCharge.CompanyId,
      Action: "DELETE",
      Entity: "Reccuring Charge",
      EntityId: deletedCharge.recurring_charge_id,
      ActivityBy: req.tokenData.role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Deleted Recurring Charge : ${deletedCharge.description} (${deletedCharge.amount})`,
      },
      Reason: DeleteReason,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      data: deletedCharge,
      message: "Reccuring Charge deleted successfully",
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

router.delete(
  "/deletereccharge/:recurring_charge_id",
  verifyLoginToken,
  async (req, res) => {
    const recurring_charge_id = req.params.recurring_charge_id;
    const DeleteReason = req.body.reason || "No Reason Provided";

    try {
      const response = await deleteRecurringCharge(
        recurring_charge_id,
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

const getRecurringCharge = async (recurring_charge_id) => {
  try {
    const charge = await RecurringCharge.aggregate([
      {
        $match: { recurring_charge_id },
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
          account_details: 1,
          description: 1,
          amount: 1,
          frequency_interval: 1,
          frequency: 1,
          nextDueDate: 1,
          weekday: 1,
          day_of_year: 1,
          days_after_quarter: 1,
          month: 1,
          day_of_month: 1,
          recurring_charge_id: 1,
        },
      },
    ]);

    if (!charge || charge.length === 0) {
      return {
        statusCode: 404,
        message: "Recurring charge not found",
      };
    }

    return {
      statusCode: 200,
      message: "Recurring charge fetched successfully",
      data: charge[0],
    };
  } catch (error) {
    console.error(error.message);
    return {
      statusCode: 500,
      message: "Something went wrong, please try again later!",
    };
  }
};

router.get("/recurring/:recurring_charge_id", async (req, res) => {
  const { recurring_charge_id } = req.params;

  try {
    const response = await getRecurringCharge(recurring_charge_id);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later!",
    });
  }
});

module.exports = { router, getNextDueDate };

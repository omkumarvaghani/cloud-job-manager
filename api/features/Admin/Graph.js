const express = require("express");
const router = express.Router();
const Quote = require("./Quote/model");
const Contract = require("./Contract/model");
const Invoice = require("./Invoice/model");
const Appointment = require("./Contract/Visits/model");

//admin staffmember quote function
const getQuoteSummary = async (CompanyId) => {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  return await Quote.aggregate([
    {
      $match: {
        IsDelete: false,
        createdAt: { $exists: true, $ne: null },
        CompanyId,
      },
    },
    {
      $addFields: {
        createdAtDate: { $toDate: "$createdAt" },
        yearGroup: { $year: { $toDate: "$createdAt" } },
        monthGroup: { $month: { $toDate: "$createdAt" } },
      },
    },
    {
      $match: {
        yearGroup: { $in: [currentYear, previousYear] }, // Filter for current and previous year
      },
    },
    {
      $group: {
        _id: { year: "$yearGroup", month: "$monthGroup" },
        totalQuotes: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.year", // Group by year
        months: {
          $push: {
            month: "$_id.month",
            totalQuotes: "$totalQuotes",
          },
        },
      },
    },
    {
      $sort: {
        _id: -1, // Sort by year descending (current year first)
      },
    },
  ]);
};

const getContractSummary = async (CompanyId) => {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  return await Contract.aggregate([
    {
      $match: {
        IsDelete: false,
        createdAt: { $exists: true, $ne: null },
        CompanyId,
      },
    },
    {
      $addFields: { createdAtDate: { $toDate: "$createdAt" } },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAtDate" },
          month: { $month: "$createdAtDate" },
        },
        totalContracts: { $sum: 1 },
      },
    },
    {
      $match: {
        "_id.year": { $in: [currentYear, previousYear] }, // Filter for current and previous year
      },
    },
    {
      $group: {
        _id: "$_id.year", // Group by year
        months: {
          $push: {
            month: "$_id.month",
            totalContracts: "$totalContracts",
          },
        },
      },
    },
    {
      $sort: { _id: -1 }, // Sort by year descending (current year first)
    },
  ]);
};

// Admin staff member graph API
router.get("/:CompanyId", async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const [quoteSummary, contractSummary] = await Promise.all([
      getQuoteSummary(CompanyId),
      getContractSummary(CompanyId),
    ]);

    // Return combined data in the correct structure
    res.status(200).json({
      statusCode: 200,
      message: "Summary fetched successfully",
      data: {
        quoteSummary,
        contractSummary,
      },
    });
  } catch (error) {
    console.error("Error fetching summaries:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later!",
    });
  }
});

//admin staffmember invoice function
const getInvoiceSummary = async (CompanyId) => {
  try {
    const currentYear = new Date().getFullYear(); // Get the current year (e.g., 2025)
    const previousYear = currentYear - 1; // Get the previous year (e.g., 2024)

    const result = await Invoice.aggregate([
      {
        $match: {
          IsDelete: false,
          createdAt: { $exists: true, $ne: null },
          CompanyId,
        },
      },
      {
        $addFields: { createdAtDate: { $toDate: "$createdAt" } },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAtDate" },
            month: { $month: "$createdAtDate" },
          },
          totalInvoice: { $sum: 1 },
        },
      },
      {
        $match: {
          "_id.year": { $in: [currentYear, previousYear] }, // Filter for current and previous year
        },
      },
      {
        $group: {
          _id: "$_id.year", // Group by year
          months: {
            $push: {
              month: "$_id.month",
              totalInvoice: "$totalInvoice",
            },
          },
        },
      },
      {
        $sort: { _id: -1 }, // Sort by year descending
      },
    ]);

    return result;
  } catch (error) {
    console.error("Error in getInvoiceSummary:", error);
    throw error; // Ensure errors are propagated to the caller
  }
};

//admin staffmember appointment function
const getAppointmentSummary = async (CompanyId, WorkerId) => {
  try {
    const currentYear = new Date().getFullYear(); // Get the current year (e.g., 2025)
    const previousYear = currentYear - 1; // Get the previous year (e.g., 2024)

    const matchCondition = {
      IsDelete: false,
      createdAt: { $exists: true, $ne: null },
      CompanyId,
    };

    if (WorkerId) {
      matchCondition.WorkerId = WorkerId;
    }

    const result = await Appointment.aggregate([
      {
        $match: matchCondition,
      },
      {
        $addFields: { createdAtDate: { $toDate: "$createdAt" } }, // Convert 'createdAt' to a date
      },
      {
        $match: {
          createdAtDate: {
            // Filter by current and previous year
            $gte: new Date(`${previousYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAtDate" }, // Extract the year
            month: { $month: "$createdAtDate" }, // Extract the month
          },
          totalAppointments: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.year", // Group by year
          months: {
            $push: {
              month: "$_id.month",
              totalAppointments: "$totalAppointments",
            },
          },
        },
      },
      {
        $sort: { _id: -1 }, // Sort by year descending
      },
    ]);

    return result;
  } catch (error) {
    console.error("Error in getAppointmentSummary:", error);
    throw error; // Ensure errors are propagated to the caller
  }
};

//admin staffmember grapg get api
router.get("/graphss/:CompanyId", async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const { WorkerId } = req.query;

    const [invoiceSummary, appointmentSummary] = await Promise.all([
      getInvoiceSummary(CompanyId),
      getAppointmentSummary(CompanyId, WorkerId),
    ]);

    res.status(200).json({
      statusCode: 200,
      message: "Summary fetched successfully",
      data: {
        invoiceSummary,
        appointmentSummary,
      },
    });
  } catch (error) {
    console.error("Error fetching summaries:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later!",
    });
  }
});

//customer invoice function
const getInvoiceSummaryCustomer = async (CompanyId, CustomerId) => {
  try {
    const currentYear = new Date().getFullYear(); // Get the current year (e.g., 2025)
    const previousYear = currentYear - 1; // Get the previous year (e.g., 2024)

    const result = await Invoice.aggregate([
      {
        $match: {
          IsDelete: false,
          createdAt: { $exists: true, $ne: null },
          CompanyId,
          CustomerId,
        },
      },
      {
        $addFields: { createdAtDate: { $toDate: "$createdAt" } },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAtDate" },
            month: { $month: "$createdAtDate" },
          },
          totalInvoice: { $sum: 1 },
        },
      },
      {
        $match: {
          "_id.year": { $in: [currentYear, previousYear] }, // Filter for current and previous year
        },
      },
      {
        $group: {
          _id: "$_id.year", // Group by year
          months: {
            $push: {
              month: "$_id.month",
              totalInvoice: "$totalInvoice",
            },
          },
        },
      },
      {
        $sort: { _id: -1 }, // Sort by year descending
      },
    ]);

    return result;
  } catch (error) {
    console.error("Error in getInvoiceSummaryCustomer:", error);
    throw error; // Ensure errors are propagated to the caller
  }
};

//customer appointment function

const getAppointmentSummaryCustomer = async (CompanyId, CustomerId) => {
  try {
    const currentYear = new Date().getFullYear(); // Get the current year
    const previousYear = currentYear - 1; // Get the previous year

    const result = await Appointment.aggregate([
      {
        $match: {
          IsDelete: false,
          createdAt: { $exists: true, $ne: null },
          CompanyId,
          CustomerId,
        },
      },
      {
        $addFields: { createdAtDate: { $toDate: "$createdAt" } },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAtDate" },
            month: { $month: "$createdAtDate" },
          },
          totalAppointments: { $sum: 1 },
        },
      },
      {
        $match: {
          "_id.year": { $in: [currentYear, previousYear] }, // Filter for current and previous years
        },
      },
      {
        $group: {
          _id: "$_id.year", // Group by year
          months: {
            $push: {
              month: "$_id.month",
              totalAppointments: "$totalAppointments",
            },
          },
        },
      },
      {
        $sort: { _id: -1 }, // Sort by year descending
      },
    ]);

    return result;
  } catch (error) {
    console.error("Error in getAppointmentSummaryCustomer:", error);
    throw error; // Ensure errors are propagated to the caller
  }
};

//customer get graph api

router.get("/customergraph/:CompanyId/:CustomerId", async (req, res) => {
  try {
    const { CompanyId, CustomerId } = req.params;

    const [invoiceSummary, appointmentSummary] = await Promise.all([
      getInvoiceSummaryCustomer(CompanyId, CustomerId),
      getAppointmentSummaryCustomer(CompanyId, CustomerId),
    ]);

    res.status(200).json({
      statusCode: 200,
      message: "Summary fetched successfully",
      data: {
        invoiceSummary,
        appointmentSummary,
      },
    });
  } catch (error) {
    console.error("Error fetching summaries:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later!",
    });
  }
});

//customer quote function

const getQuoteSummaryCustomer = async (CompanyId, CustomerId) => {
  try {
    const currentYear = new Date().getFullYear(); // Get the current year
    const previousYear = currentYear - 1; // Get the previous year

    const result = await Quote.aggregate([
      {
        $match: {
          IsDelete: false,
          createdAt: { $exists: true, $ne: null },
          CompanyId, // Filter by CompanyId
          CustomerId, // Filter by CustomerId
          status: { $ne: "Draft" }, // Correct way to use $ne for status 
        },
      },
      {
        $addFields: { createdAtDate: { $toDate: "$createdAt" } },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAtDate" },
            month: { $month: "$createdAtDate" },
          },
          totalQuotes: { $sum: 1 },
        },
      },
      {
        $match: {
          "_id.year": { $in: [currentYear, previousYear] }, // Filter for current and previous years
        },
      },
      {
        $group: {
          _id: "$_id.year", // Group by year
          months: {
            $push: {
              month: "$_id.month",
              totalQuotes: "$totalQuotes",
            },
          },
        },
      },
      {
        $sort: { _id: -1 }, // Sort by year descending
      },
    ]);

    return result;
  } catch (error) {
    console.error("Error in getQuoteSummaryCustomer:", error);
    throw error; // Ensure errors are propagated to the caller
  }
};

//customer contract function

const getContractSummaryCustomer = async (CompanyId, CustomerId) => {
  try {
    const currentYear = new Date().getFullYear(); // Get the current year
    const previousYear = currentYear - 1; // Get the previous year

    const result = await Contract.aggregate([
      {
        $match: {
          IsDelete: false,
          createdAt: { $exists: true, $ne: null },
          CompanyId,
          CustomerId,
          $expr: {
            $and: [{ $ne: ["$Status", "Unscheduled"] }],
          },
        },
      },
      {
        $addFields: { createdAtDate: { $toDate: "$createdAt" } },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAtDate" },
            month: { $month: "$createdAtDate" },
          },
          totalContracts: { $sum: 1 },
        },
      },
      {
        $match: {
          "_id.year": { $in: [currentYear, previousYear] }, // Filter for current and previous years
        },
      },
      {
        $group: {
          _id: "$_id.year", // Group by year
          months: {
            $push: {
              month: "$_id.month",
              totalContracts: "$totalContracts",
            },
          },
        },
      },
      {
        $sort: { _id: -1 }, // Sort by year descending
      },
    ]);

    return result;
  } catch (error) {
    console.error("Error in getContractSummaryCustomer:", error);
    throw error;
  }
};

//customer get graph api

router.get("/:CompanyId/:CustomerId", async (req, res) => {
  try {
    const { CompanyId, CustomerId } = req.params;

    const [quoteSummary, contractSummary] = await Promise.all([
      getQuoteSummaryCustomer(CompanyId, CustomerId),
      getContractSummaryCustomer(CompanyId, CustomerId),
    ]);

    res.status(200).json({
      statusCode: 200,
      message: "Summary fetched successfully",
      data: {
        quoteSummary,
        contractSummary,
      },
    });
  } catch (error) {
    console.error("Error fetching summaries:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later!",
    });
  }
});

module.exports = router;

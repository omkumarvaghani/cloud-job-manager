var express = require("express");
var router = express.Router();
const InvoicePayment = require("../Invoice/InvoicePayment/model");
const InvoiceCharge = require("../Invoice/model");
const Payment = require("../Payment/model");
const Customer = require("../Customer/model");
var Charge = require("../Charge/model");
const moment = require("moment");
const { parse } = require("json2csv");
const fs = require("fs");
const path = require("path");

const { verifyLoginToken } = require("../../../authentication");
const {
  makeExcel,
  makeCSV,
  generateAndSaveReportPdf,
} = require("../../generatePdf");
const { GeneralLedger } = require("../../htmlFormates/genledger");
const {
  paymentReportPdf,
} = require("../../htmlFormates/PaymentReportFunction");

// Nwe Final change============================================
// const CalculateBalance = async (CustomerId, query) => {
//   const pageSize = parseInt(query.pageSize) || 10;
//   const pageNumber = parseInt(query.pageNumber) || 0;
//   const search = query.search ? query.search.trim() : null;
//   const selectedStartDate = query.selectedStartDate
//     ? new Date(query.selectedStartDate)
//     : null;
//   const selectedEndDate = query.selectedEndDate
//     ? new Date(query.selectedEndDate)
//     : null;

//   try {
//     let invoicePayments = await InvoicePayment.aggregate([
//       { $match: { CustomerId: CustomerId } },
//       {
//         $lookup: {
//           from: "accounts",
//           let: { account_id: "$account_id" },
//           pipeline: [
//             { $match: { $expr: { $eq: ["$account_id", "$$account_id"] } } },
//             { $project: { _id: 0, account_name: 1 } },
//           ],
//           as: "accountDetails",
//         },
//       },
//       {
//         $addFields: {
//           account_name: { $arrayElemAt: ["$accountDetails.account_name", 0] },
//         },
//       },
//       {
//         $project: { accountDetails: 0 },
//       },
//       { $sort: { createdAt: 1 } },
//     ]);

//     let invoiceCharges = await InvoiceCharge.aggregate([
//       { $match: { CustomerId: CustomerId } },
//       {
//         $project: {
//           InvoiceId: 1,
//           InvoiceNumber: 1,
//           CustomerId: 1,
//           CompanyId: 1,
//           amount: { $toDouble: "$Total" },
//           createdAt: 1,
//           account_id: 1,
//           description: 1,
//           ContractId: 1,
//         },
//       },
//       {
//         $lookup: {
//           from: "accounts",
//           let: { account_id: "$account_id" },
//           pipeline: [
//             { $match: { $expr: { $eq: ["$account_id", "$$account_id"] } } },
//             { $project: { _id: 0, account_name: 1 } },
//           ],
//           as: "accountDetails",
//         },
//       },
//       {
//         $addFields: {
//           account_name: { $arrayElemAt: ["$accountDetails.account_name", 0] },
//         },
//       },
//       {
//         $lookup: {
//           from: "contracts",
//           let: { contractId: "$ContractId" },
//           pipeline: [
//             { $match: { $expr: { $eq: ["$ContractId", "$$contractId"] } } },
//             { $project: { _id: 0, ContractNumber: 1 } },
//           ],
//           as: "contractDetails",
//         },
//       },
//       {
//         $addFields: {
//           ContractNumber: {
//             $arrayElemAt: ["$contractDetails.ContractNumber", 0],
//           },
//         },
//       },
//       {
//         $project: { accountDetails: 0, contractDetails: 0 },
//       },
//       { $sort: { createdAt: 1 } },
//     ]);

//     let payments = await Payment.aggregate([
//       { $match: { CustomerId: CustomerId } },
//       { $sort: { createdAt: 1 } },
//       {
//         $lookup: {
//           from: "accounts",
//           let: { account_id: "$account_id" },
//           pipeline: [
//             { $match: { $expr: { $eq: ["$account_id", "$$account_id"] } } },
//             { $project: { _id: 0, account_name: 1 } },
//           ],
//           as: "accountDetails",
//         },
//       },
//       {
//         $addFields: {
//           account_name: { $arrayElemAt: ["$accountDetails.account_name", 0] },
//         },
//       },
//       {
//         $project: { accountDetails: 0 },
//       },
//     ]);

//     let data = [...invoicePayments, ...payments, ...invoiceCharges];

//     if (selectedStartDate && selectedEndDate) {
//       data = data.filter((item) => {
//         const createdAtDate = new Date(item.createdAt);
//         return (
//           createdAtDate >= selectedStartDate && createdAtDate <= selectedEndDate
//         );
//       });
//     }

//     if (search) {
//       const searchRegex = new RegExp(search, "i");
//       data = data.filter((item) => {
//         return (
//           (item?.transactionid && searchRegex.test(item.transactionid)) ||
//           (item?.account_name && searchRegex.test(item.account_name)) ||
//           (item?.amount && searchRegex.test(item.amount))
//         );
//       });
//     }

//     data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

//     let balance = 0;
//     for (const item of data) {
//       let type = "";
//       let amount = Number(item.amount) || 0;

//       if (item?.method) {
//         type = "payment";
//         balance -= amount;
//       } else {
//         type = "charge";
//         balance += amount;
//       }

//       item.type = type;
//       item.balance = parseFloat(balance.toFixed(2));
//     }

//     data.reverse();

//     const totalCount = data.length;
//     const paginatedData = data.slice(
//       pageNumber * pageSize,
//       (pageNumber + 1) * pageSize
//     );

//     return {
//       paginatedData,
//       totalBalance: parseFloat(balance.toFixed(2)),
//       totalPages: Math.ceil(totalCount / pageSize),
//       currentPage: pageNumber,
//       totalCount,
//     };
//   } catch (error) {
//     return { error };
//   }
// };

// router.get(
//   "/charges_payments/:CustomerId",
//   verifyLoginToken,
//   async (req, res) => {
//     try {
//       const CustomerId = req.params.CustomerId;
//       const query = req.query;

//       const {
//         paginatedData,
//         totalBalance,
//         totalPages,
//         currentPage,
//         totalCount,
//         error,
//       } = await CalculateBalance(CustomerId, query);

//       if (error) {
//         return res.status(500).json({
//           statusCode: 500,
//           message: error.message,
//         });
//       } else {
//         return res.json({
//           statusCode: 200,
//           data: paginatedData,
//           totalBalance,
//           totalPages,
//           currentPage,
//           totalCount,
//           message: "Read All Charges & Payments",
//         });
//       }
//     } catch (error) {
//       return res.status(500).json({
//         statusCode: 500,
//         message: error.message,
//       });
//     }
//   }
// );

const CalculateBalance = async (CustomerId, query) => {
  const pageSize = parseInt(query.pageSize) || 10;
  const pageNumber = parseInt(query.pageNumber) || 0;
  const search = query.search ? query.search.trim() : null;
  const sortOrder = query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;
  const allowedSortFields = [
    "amount",
    "account_name",
    "transactionid",
    "type",
    "description",
    "balance",
    "createdAt",
  ];

  const sortField = allowedSortFields.includes(query.sortField)
    ? query.sortField
    : "updatedAt";

  const selectedStartDate = query.selectedStartDate
    ? new Date(query.selectedStartDate)
    : null;
  const selectedEndDate = query.selectedEndDate
    ? new Date(query.selectedEndDate)
    : null;
  const collation = { locale: "en", strength: 2 };

  try {
    let invoicePayments = await InvoicePayment.aggregate([
      { $match: { CustomerId: CustomerId } },
      {
        $lookup: {
          from: "accounts",
          let: { account_id: "$account_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$account_id", "$$account_id"] } } },
            { $project: { _id: 0, account_name: 1 } },
          ],
          as: "accountDetails",
        },
      },
      {
        $addFields: {
          account_name: { $arrayElemAt: ["$accountDetails.account_name", 0] },
        },
      },
      {
        $project: { accountDetails: 0 },
      },
      { $sort: { createdAt: 1 } },
    ]);

    let invoiceCharges = await InvoiceCharge.aggregate([
      { $match: { CustomerId: CustomerId } },
      {
        $project: {
          InvoiceId: 1,
          InvoiceNumber: 1,
          CustomerId: 1,
          CompanyId: 1,
          amount: { $toDouble: "$Total" },
          createdAt: 1,
          account_id: 1,
          description: 1,
          ContractId: 1,
        },
      },
      {
        $lookup: {
          from: "accounts",
          let: { account_id: "$account_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$account_id", "$$account_id"] } } },
            { $project: { _id: 0, account_name: 1 } },
          ],
          as: "accountDetails",
        },
      },
      {
        $addFields: {
          account_name: { $arrayElemAt: ["$accountDetails.account_name", 0] },
        },
      },
      {
        $lookup: {
          from: "contracts",
          let: { contractId: "$ContractId" },
          pipeline: [
            { $match: { $expr: { $eq: ["$ContractId", "$$contractId"] } } },
            { $project: { _id: 0, ContractNumber: 1 } },
          ],
          as: "contractDetails",
        },
      },
      {
        $addFields: {
          ContractNumber: {
            $arrayElemAt: ["$contractDetails.ContractNumber", 0],
          },
        },
      },
      {
        $project: { accountDetails: 0, contractDetails: 0 },
      },
      { $sort: { createdAt: 1 } },
    ]).collation(collation);

    let payments = await Payment.aggregate([
      { $match: { CustomerId: CustomerId } },
      { $sort: { createdAt: 1 } },
      {
        $lookup: {
          from: "accounts",
          let: { account_id: "$account_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$account_id", "$$account_id"] } } },
            { $project: { _id: 0, account_name: 1 } },
          ],
          as: "accountDetails",
        },
      },
      {
        $addFields: {
          account_name: { $arrayElemAt: ["$accountDetails.account_name", 0] },
        },
      },
      {
        $project: { accountDetails: 0 },
      },
    ]);

    let data = [...invoicePayments, ...payments, ...invoiceCharges];

    if (selectedStartDate && selectedEndDate) {
      selectedEndDate.setHours(23, 59, 59, 999);
      data = data.filter((item) => {
        const createdAtDate = new Date(item.createdAt);
        return (
          createdAtDate >= selectedStartDate && createdAtDate <= selectedEndDate
        );
      });
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      data = data.filter((item) => {
        return (
          (item?.transactionid && searchRegex.test(item.transactionid)) ||
          (item?.account_name && searchRegex.test(item.account_name)) ||
          (item?.amount && searchRegex.test(item.amount))
        );
      });
    }

    let sortOptions = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder;
    }

    data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let balance = 0;
    for (const item of data) {
      let type = "";
      let amount = Number(item.amount) || 0;

      if (item?.method) {
        type = "payment";
        balance -= amount;
      } else {
        type = "charge";
        balance += amount;
      }

      item.type = type;
      item.balance = parseFloat(balance.toFixed(2));
    }

    data.reverse();

    const totalCount = data.length;
    const paginatedData = data.slice(
      pageNumber * pageSize,
      (pageNumber + 1) * pageSize
    );

    return {
      paginatedData,
      totalBalance: parseFloat(balance.toFixed(2)),
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: pageNumber,
      totalCount,
    };
  } catch (error) {
    return { error };
  }
};

router.get(
  "/charges_payments/:CustomerId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const CustomerId = req.params.CustomerId;
      const query = req.query;
      query.sortField = query.sortField || "updatedAt";
      query.sortOrder = query.sortOrder || "desc";

      const {
        paginatedData,
        totalBalance,
        totalPages,
        currentPage,
        totalCount,
        error,
      } = await CalculateBalance(CustomerId, query);

      if (error) {
        return res.status(500).json({
          statusCode: 500,
          message: error.message,
        });
      } else {
        return res.json({
          statusCode: 200,
          data: paginatedData,
          totalBalance,
          totalPages,
          currentPage,
          totalCount,
          message: "Read All Charges & Payments",
        });
      }
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: error.message,
      });
    }
  }
);

// Nwe Final change============================================

const generateExcel = async (
  data,
  totalBalance,
  outputFilePath,
  options = {}
) => {
  const {
    columns,
    startDate,
    endDate,
    method,
    dateFormat = "YYYY-MM-DD",
    inputDateFormat = "DD-MM-YYYY",
  } = options;

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Invalid data format");
  }

  let start, end;
  if (startDate && endDate) {
    start = moment(startDate, inputDateFormat).startOf("day");
    end = moment(endDate, inputDateFormat).endOf("day");
  }

  const validMethods = ["Cash", "Card", "ACH", "Cheque"];

  const filteredData = data
    .map((item) => {
      const formattedDate =
        item.date && moment(item.date, inputDateFormat).isValid()
          ? moment(item.date, inputDateFormat).format(dateFormat)
          : item.createdAt && moment(item.createdAt).isValid()
          ? moment(item.createdAt).format(dateFormat)
          : moment().format(dateFormat); // Fallback to current date if invalid

      if (!moment(formattedDate, dateFormat).isValid()) {
        console.warn("Invalid date found:", item);
      }

      return {
        date: formattedDate,
        account_name: item.account_name ? `${item.account_name}` : "Invoice",
        type: item.type,
        amount: item.amount
          ? `${item.type === "payment" ? "-$" : "+$"}${item.amount.toFixed(2)}`
          : "$0.00",
        balance: item.balance ? `${item.balance.toFixed(2)}` : "$0.00",
        method: item.method || "", // Ensure method is included
      };
    })
    .filter((item) => {
      const createdAt = moment(item.date, dateFormat);
      const isDateValid =
        startDate && endDate
          ? createdAt.isBetween(start, end, null, "[]")
          : true;
      const isMethodValid = method
        ? validMethods.includes(item.method) && item.method === method
        : true;

      return isDateValid && isMethodValid;
    });

  await makeExcel(filteredData, outputFilePath, { columns });
};

// Now, invalid dates will fallback to the current date, and any invalid entries will be logged to the console.
// Let me know if you want me to tweak anything else! 🚀

const generateCSV = async (filePath, totalBalance, data) => {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Invalid data format");
  }

  const validMethods = ["Cash", "Card", "ACH", "Cheque"];

  const formattedData = data.map((item) => ({
    ...item,
    date: moment(item.date ? item.date : item.createdAt).format("YYYY-MM-DD"),
    amount: item.amount
      ? `${item.type === "payment" ? "-$" : "+$"}${item.amount.toFixed(2)}`
      : "$0.00",

    type: item.type,
    balance: item.balance.toFixed(2),
    account_name: item.account_name ? item.account_name : "Invoice",
  }));

  const paddedData = formattedData.map((item) => {
    return {
      ...item,
      date: moment(item.date ? item.date : item.createdAt).format("YYYY-MM-DD"),
      account_name: item.account_name ? item.account_name : "Invoice",
      type: item.type,
      amount: item.amount,
      balance: item.balance,
    };
  });

  const columns = [
    { id: "date", title: "Date" },
    { id: "account_name", title: "Account Name" },
    { id: "type", title: "Type" },
    { id: "amount", title: "Amount" },
    { id: "balance", title: "Balance" },
  ];

  await makeCSV(filePath, "", "", data, paddedData, columns);
};

const CalculateBalanceForReport = async (CustomerId, query) => {
  const selectedStartDate = query.selectedStartDate
    ? new Date(query.selectedStartDate)
    : null;
  const selectedEndDate = query.selectedEndDate
    ? new Date(query.selectedEndDate)
    : null;
  try {
    let customerData = await Customer.aggregate([
      { $match: { CustomerId: CustomerId } },
      {
        $project: {
          _id: 0,
          FirstName: 1,
          LastName: 1,
          EmailAddress: 1,
          PhoneNumber: 1,
        },
      },
    ]);

    let customer = customerData.length > 0 ? customerData[0] : null;

    let invoicePayments = await InvoicePayment.aggregate([
      { $match: { CustomerId: CustomerId } },
      {
        $lookup: {
          from: "companies",
          localField: "CompanyId",
          foreignField: "companyId",
          as: "company",
        },
      },
      {
        $addFields: {
          company: { $arrayElemAt: ["$company", 0] },
          customerData: customer,
        },
      },
      {
        $lookup: {
          from: "accounts",
          let: { account_id: "$account_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$account_id", "$$account_id"] } } },
            { $project: { _id: 0, account_name: 1 } },
          ],
          as: "accountDetails",
        },
      },
      {
        $addFields: {
          account_name: { $arrayElemAt: ["$accountDetails.account_name", 0] },
        },
      },
      { $sort: { createdAt: 1 } },
    ]);

    let invoiceCharges = await InvoiceCharge.aggregate([
      { $match: { CustomerId: CustomerId } },
      {
        $project: {
          InvoiceId: 1,
          InvoiceNumber: 1,
          CustomerId: 1,
          CompanyId: 1,
          amount: { $toDouble: "$Total" },
          createdAt: 1,
          account_id: 1,
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "CompanyId",
          foreignField: "companyId",
          as: "company",
        },
      },
      {
        $addFields: {
          company: { $arrayElemAt: ["$company", 0] },
          customerData: customer,
        },
      },
      {
        $lookup: {
          from: "accounts",
          let: { account_id: "$account_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$account_id", "$$account_id"] } } },
            { $project: { _id: 0, account_name: 1 } },
          ],
          as: "accountDetails",
        },
      },
      {
        $addFields: {
          account_name: { $arrayElemAt: ["$accountDetails.account_name", 0] },
        },
      },
      { $sort: { createdAt: 1 } },
    ]);

    let payments = await Payment.aggregate([
      { $match: { CustomerId: CustomerId } },
      {
        $lookup: {
          from: "accounts",
          localField: "account_id",
          foreignField: "account_id",
          as: "accountDetails",
        },
      },
      {
        $addFields: {
          account_name: { $arrayElemAt: ["$accountDetails.account_name", 0] },
          customerData: customer,
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "CompanyId",
          foreignField: "companyId",
          as: "company",
        },
      },
      {
        $addFields: {
          company: { $arrayElemAt: ["$company", 0] },
        },
      },
      { $sort: { createdAt: 1 } },
    ]);

    let charges = await Charge.aggregate([
      { $match: { CustomerId: CustomerId } },
      {
        $lookup: {
          from: "accounts",
          localField: "account_id",
          foreignField: "account_id",
          as: "accountDetails",
        },
      },
      {
        $addFields: {
          account_name: { $arrayElemAt: ["$accountDetails.account_name", 0] },
          customerData: customer,
        },
      },
      {
        $lookup: {
          from: "companies",
          localField: "CompanyId",
          foreignField: "companyId",
          as: "company",
        },
      },
      {
        $addFields: {
          company: { $arrayElemAt: ["$company", 0] },
        },
      },
      { $sort: { createdAt: 1 } },
    ]);

    // const data = [
    //   ...invoicePayments,
    //   ...payments,
    //   // ...charges,
    //   ...invoiceCharges,
    // ];

    // if (selectedStartDate && selectedEndDate) {
    //   selectedEndDate.setHours(23, 59, 59, 999);
    //   data = data.filter((item) => {
    //     const createdAtDate = new Date(item.createdAt);
    //     return (
    //       createdAtDate >= selectedStartDate && createdAtDate <= selectedEndDate
    //     );
    //   });
    // }
    const data = [
      ...invoicePayments,
      ...payments,
      // ...charges,
      ...invoiceCharges,
    ];

    const filteredData =
      selectedStartDate && selectedEndDate
        ? data.filter((item) => {
            selectedEndDate.setHours(23, 59, 59, 999);
            const createdAtDate = new Date(item.createdAt);
            return (
              createdAtDate >= selectedStartDate &&
              createdAtDate <= selectedEndDate
            );
          })
        : data;

    filteredData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let balance = 0;

    for (const item of filteredData) {
      let type = "";
      let amount = Number(item.amount) || 0;

      if (item?.method) {
        type = "payment";
        balance = (balance ?? 0) - (amount ?? 0);
      } else {
        type = "charge";
        balance = (balance ?? 0) + (amount ?? 0);
      }

      item.type = type;
      item.balance = balance != null ? parseFloat(balance.toFixed(2)) : 0;
    }

    filteredData.reverse();

    return {
      sortedData: filteredData,
      totalBalance: parseFloat(balance.toFixed(2)),
    };
  } catch (error) {
    return { error };
  }
};

router.post("/charges_payments/report/:CustomerId", async (req, res) => {
  try {
    const CustomerId = req.params.CustomerId;
    const { ispdf, iscsv, isexcel } = req.body;
    const query = req.query;

    const { sortedData, totalBalance, error } = await CalculateBalanceForReport(
      CustomerId,
      query
    );
    const baseFilename = `charges_payments_${CustomerId}`;
    const folder = path.join(__dirname, "../../../../cdn/files");

    if (error) {
      console.log(error);
      return res.status(500).json({
        statusCode: 500,
        message: error,
      });
    }

    if (!sortedData || sortedData.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: "No data found for the given CustomerId.",
      });
    }

    if (isexcel) {
      const excelFilePath = path.join(folder, `${baseFilename}.xlsx`);
      const columns = [
        { header: "Date", key: "date", alignment: { horizontal: "left" } },
        { header: "Account Name", key: "account_name" },
        { header: "Type", key: "type" },
        {
          header: "Amount",
          key: "amount",
          alignment: { horizontal: "right" },
        },
        {
          header: "Balance",
          key: "balance",
          alignment: { horizontal: "right" },
        },
      ];

      await generateExcel(sortedData, totalBalance, excelFilePath, {
        columns: [
          { header: "Date", key: "date" },
          { header: "Account Name", key: "account_name" },
          { header: "Type", key: "type" },
          { header: "Amount", key: "amount" },
          { header: "Balance", key: "balance" },
        ],
        inputDateFormat: "DD-MM-YYYY", // Input date format (DD-MM-YYYY)
        dateFormat: "YYYY-MM-DD", // Output date format (YYYY-MM-DD)
      });

      return res.status(200).json({
        statusCode: 200,
        fileName: `${baseFilename}.xlsx`,
      });
    }

    if (iscsv) {
      const csvFilePath = path.join(folder, `${baseFilename}.csv`);
      await generateCSV(csvFilePath, totalBalance, sortedData);
      return res.status(200).json({
        statusCode: 200,
        fileName: `${baseFilename}.csv`,
      });
    }

    if (ispdf) {
      const html = await GeneralLedger(sortedData, totalBalance);
      const pdfFileName = await generateAndSaveReportPdf(html);

      return res.status(200).json({
        statusCode: 200,
        fileName: pdfFileName,
      });
    }

    return res.status(400).json({
      statusCode: 400,
      message: "No valid flag provided (ispdf, iscsv, isexcel) in request body",
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later.",
    });
  }
});

module.exports = router;

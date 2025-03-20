var express = require("express");
var router = express.Router();
const InvoicePayment = require("../Invoice/InvoicePayment/model");
const NmiKeys = require("../../Superadmin/NMIKeys/model");
const moment = require("moment");
var querystring = require("querystring");
var axios = require("axios");
const { DOMParser } = require("xmldom");
const json2xls = require("json2xls");
const { createObjectCsvWriter } = require("csv-writer");
const { verifyLoginToken } = require("../../../authentication");
const path = require("path");
const {
  generateAndSavePdf,
  generateAndSaveReportPdf,
  makeCSV,
  makeExcel,
  generateExcelFile,
  generateExcelBuffer,
} = require("../../generatePdf");
const {
  paymentReportPdf,
} = require("../../htmlFormates/PaymentReportFunction");

const convertToJson = (data) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "application/xml");

    const jsonResult = xmlToJson(xmlDoc);
    return jsonResult;
  } catch (error) {
    console.error("Error converting XML to JSON:", error);
    return { error: "Error converting XML to JSON" };
  }
};

const xmlToJson = (xml) => {
  let result = {};

  if (xml.nodeType === 1) {
    if (xml.attributes.length > 0) {
      result["@attributes"] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j);
        result["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3 && xml.nodeValue.trim() !== "") {
    result = xml.nodeValue.trim();
  }

  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;

      if (nodeName === "#text") {
        const textValue = item.nodeValue.trim();
        if (textValue !== "") {
          return textValue;
        }
      } else {
        if (typeof result[nodeName] === "undefined") {
          result[nodeName] = xmlToJson(item);
        } else {
          if (typeof result[nodeName].push === "undefined") {
            const old = result[nodeName];
            result[nodeName] = [];
            if (old !== "") {
              result[nodeName].push(old);
            }
          }
          const childResult = xmlToJson(item);
          if (childResult !== "") {
            result[nodeName].push(childResult);
          }
        }
      }
    }
  }

  return result;
};

function formatDateTimeToNMIFormat(dateString, timeString = "000000") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error("Invalid date format. Expected format: YYYY-MM-DD");
  }

  const [year, month, day] = dateString.split("-");

  const formattedDate = `${year}${month}${day}${timeString}`;

  return formattedDate;
}

async function fetchTransactions(
  CompanyId,
  selectedStartDate,
  selectedEndDate
) {

  if (!CompanyId) {
    throw new Error("Invalid or missing CompanyId");
  }
  const todayDate = moment().format("YYYY-MM-DD");

  const securityKey = await NmiKeys.findOne({ CompanyId: CompanyId });
  if (!securityKey) {
    throw new Error(`Security key not found for admin ID ${CompanyId}`);
  }

  const formattedStartDate = formatDateTimeToNMIFormat(selectedStartDate);
  const formattedEndDate = formatDateTimeToNMIFormat(selectedEndDate);

  const postData = {
    security_key: securityKey.SecurityKey,
    start_date: formattedStartDate,
    end_date: formattedEndDate,
  };

  const config = {
    method: "post",
    url: "https://secure.networkmerchants.com/api/query.php",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: querystring.stringify(postData),
  };

  try {
    const response = await axios(config);
    const jsonResult = convertToJson(response.data);

    if (jsonResult.nm_response.transaction) {
      const filteredTransactions = jsonResult?.nm_response.transaction?.map(
        (txn) => ({
          check_account: txn?.check_account,
          cc_type: txn?.cc_type,
          cc_number: txn?.cc_number,
          transaction_type: txn?.transaction_type,
          transaction_id: txn?.transaction_id,
          first_name: txn?.first_name,
          last_name: txn?.last_name,
          email: txn?.email,
          phone: txn?.phone,
        })
      );
      return filteredTransactions;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error processing customer vault record:", error.message);
    return [];
  }
}

const sendResponse = (res, data, status = 200) => {
  if (status !== 200) {
    data = {
      error: data,
    };
  }
  return res.status(status).json({
    status,
    data,
  });
};

router.post("/get-transaction",verifyLoginToken, async (req, res, next) => {
  try {
    const { CompanyId, selectedStartDate, selectedEndDate } = req.query;
    const transactions = await fetchTransactions(
      CompanyId,
      selectedStartDate,
      selectedEndDate
    );
    sendResponse(res, transactions, 200);
  } catch (error) {
    sendResponse(res, { status: 500, error: error.message }, 500);
  }
});

// const getPaymentHistory = async (
//   CompanyId,
//   selectedStartDate,
//   selectedEndDate,
//   method
// ) => {
//   try {
//     // Initial aggregation to fetch payments for the specified CompanyId
//     const getPayment = await InvoicePayment.aggregate([
//       { $match: { CompanyId: CompanyId } },
//       {
//         $lookup: {
//           from: "companies",
//           localField: "CompanyId",
//           foreignField: "companyId",
//           as: "getCompanyDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$getCompanyDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $project: {
//           CompanyId: 1,
//           method: 1,
//           amount: 1,
//           date: 1,
//           Total: 1,
//           transactionid: 1,
//           InvoiceId: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           "getCompanyDetails.companyName": 1,
//           "getCompanyDetails.Address": 1,
//           "getCompanyDetails.phoneNumber": 1,
//           "getCompanyDetails.EmailAddress": 1,
//         },
//       },
//     ]);

//     // Filter data based on the date range if provided
//     let filteredPayments = getPayment;

//     if (selectedStartDate && selectedEndDate) {
//       filteredPayments = filteredPayments.filter((payment) => {
//         const paymentDate = new Date(payment.date);
//         return (
//           paymentDate >= new Date(selectedStartDate) &&
//           paymentDate <= new Date(selectedEndDate)
//         );
//       });
//     }

//     // If a method is provided, filter payments by method (Card, ACH, Cash, Cheque, etc.)
//     if (method) {
//       filteredPayments = filteredPayments.filter(
//         (payment) => payment.method === method
//       );
//     }

//     // Fetch transactions for the given date range
//     const transactions = await fetchTransactions(
//       CompanyId,
//       selectedStartDate,
//       selectedEndDate
//     );

//     // Handle payments that match with transactions and those that do not (Cash, Cheque, etc.)
//     const matchedPayments = filteredPayments.filter((payment) => {
//       const isTransactionMatched = transactions.some(
//         (txn) => txn.transaction_id === payment.transactionid
//       );
//       const isMethodValid =
//         payment.method === "Card" || payment.method === "ACH" || payment.method === "Cash" || payment.method === "Cheque";
//       return isTransactionMatched || isMethodValid; // Include payments with no transaction if method is Cash or Cheque
//     });

//     console.log(matchedPayments,"matchedPayments");

//     // Enrich payments with additional transaction details for Card/ACH methods
//     const enrichedPayments = matchedPayments.map((payment) => {
//       const matchedTransaction = transactions.find(
//         (txn) => txn.transaction_id === payment.transactionid
//       );
//       console.log(matchedTransaction,"matchedTransaction")
//       if (payment.method === "Card" || payment.method === "ACH") {
//         return {
//           ...payment,
//           cc_type: matchedTransaction.cc_type || "Unknown",
//           cc_number: matchedTransaction.cc_number || "Unknown",
//         };
//       }
//       return payment; // Non-Card/ACH payments remain unchanged
//     });

//     console.log(enrichedPayments,"enrichedPayments");

//     // Return the enriched payments or the filtered payments if no enriched data
//     return {
//       statusCode: 200,
//       data: enrichedPayments.length > 0 ? enrichedPayments : filteredPayments,
//       message: enrichedPayments.length
//         ? "Matched payment data retrieved successfully"
//         : "No matched payment data or method found, returning all filtered payment data",
//     };
//   } catch (error) {
//     console.error(error, "Error in getPaymentDetails");

//     return {
//       statusCode: 500,
//       data: null,
//       message: "Error retrieving payment details",
//     };
//   }
// };

// const getPaymentHistory = async (
//   CompanyId,
//   selectedStartDate,
//   selectedEndDate,
//   method
// ) => {
//   try {
//     // Initial aggregation to fetch payments for the specified CompanyId
//     const getPayment = await InvoicePayment.aggregate([
//       { $match: { CompanyId: CompanyId } },
//       {
//         $lookup: {
//           from: "companies",
//           localField: "CompanyId",
//           foreignField: "companyId",
//           as: "getCompanyDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$getCompanyDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $project: {
//           CompanyId: 1,
//           method: 1,
//           amount: 1,
//           date: 1,
//           Total: 1,
//           transactionid: 1,
//           InvoiceId: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           "getCompanyDetails.companyName": 1,
//           "getCompanyDetails.Address": 1,
//           "getCompanyDetails.phoneNumber": 1,
//           "getCompanyDetails.EmailAddress": 1,
//         },
//       },
//     ]);

//     // Log fetched payments
//     console.log(getPayment, "Fetched Payments");

//     // Filter data based on the date range if provided
//     let filteredPayments = getPayment;

//     if (selectedStartDate && selectedEndDate) {
//       filteredPayments = filteredPayments.filter((payment) => {
//         const paymentDate = new Date(payment.date);
//         return (
//           paymentDate >= new Date(selectedStartDate) &&
//           paymentDate <= new Date(selectedEndDate)
//         );
//       });
//     }

//     // If a method is provided, filter payments by method (Card, ACH, Cash, Cheque, etc.)
//     if (method) {
//       filteredPayments = filteredPayments.filter(
//         (payment) => payment.method === method
//       );
//     }

//     // Fetch transactions for the given date range
//     const transactions = await fetchTransactions(
//       CompanyId,
//       selectedStartDate,
//       selectedEndDate
//     );

//     // Log fetched transactions
//     console.log(transactions, "Fetched Transactions");

//     // Handle payments that match with transactions and those that do not (Cash, Cheque, etc.)
//     const matchedPayments = filteredPayments.filter((payment) => {
//       const isTransactionMatched = transactions.some(
//         (txn) =>
//           String(txn.transaction_id).trim() ===
//           String(payment.transactionid).trim()
//       );
//       const isMethodValid =
//         payment.method === "Card" ||
//         payment.method === "ACH" ||
//         payment.method === "Cash" ||
//         payment.method === "Cheque";
//       return isTransactionMatched || isMethodValid; // Include payments with no transaction if method is Cash or Cheque
//     });

//     console.log(matchedPayments, "Matched Payments");

//     // Enrich payments with additional transaction details for Card/ACH methods
//     const enrichedPayments = matchedPayments.map((payment) => {
//       const matchedTransaction = transactions.find(
//         (txn) =>
//           String(txn.transaction_id).trim() ===
//           String(payment.transactionid).trim()
//       );
//       console.log({ payment, matchedTransaction }, "Enrichment process");
//       if (payment.method === "Card" || payment.method === "ACH") {
//         return {
//           ...payment,
//           cc_type: matchedTransaction?.cc_type || "Unknown",
//           cc_number: matchedTransaction?.cc_number || "Unknown",
//         };
//       }
//       return payment; // Non-Card/ACH payments remain unchanged
//     });

//     console.log(enrichedPayments, "Enriched Payments");

//     // Return the enriched payments or the filtered payments if no enriched data
//     return {
//       statusCode: 200,
//       data: enrichedPayments.length > 0 ? enrichedPayments : filteredPayments,
//       message: enrichedPayments.length
//         ? "Matched payment data retrieved successfully"
//         : "No matched payment data or method found, returning all filtered payment data",
//     };
//   } catch (error) {
//     console.error(error, "Error in getPaymentHistory");

//     return {
//       statusCode: 500,
//       data: null,
//       message: "Error retrieving payment details",
//     };
//   }
// };

const getPaymentHistory = async (
  CompanyId,
  selectedStartDate,
  selectedEndDate,
  method,
  query
) => {
  try {
    const pageSize = parseInt(query.pageSize) || 10; 
    let pageNumber = parseInt(query.pageNumber) || 1; 

    pageNumber = pageNumber - 1;

    const getPayment = await InvoicePayment.aggregate([
      { $match: { CompanyId: CompanyId } },
      {
        $lookup: {
          from: "companies",
          localField: "CompanyId",
          foreignField: "companyId",
          as: "getCompanyDetails",
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "CustomerId",
          foreignField: "CustomerId",
          as: "getCustomerDetails",
        },
      },
      {
        $unwind: {
          path: "$getCompanyDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$getCustomerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          CompanyId: 1,
          method: 1,
          amount: 1,
          date: 1,
          Total: 1,
          transactionid: 1,
          InvoiceId: 1,
          createdAt: 1,
          updatedAt: 1,
          CustomerId: 1,
          "getCompanyDetails.companyName": 1,
          "getCompanyDetails.Address": 1,
          "getCompanyDetails.phoneNumber": 1,
          "getCompanyDetails.EmailAddress": 1,
          "getCustomerDetails.FirstName": 1,
          "getCustomerDetails.LastName": 1,
          "getCustomerDetails.EmailAddress": 1,
          "getCustomerDetails.PhoneNumber": 1,
        },
      },
    ]);

    // console.log(getPayment, "Fetched Payments");

    let filteredPayments = getPayment;

    if (selectedStartDate && selectedEndDate) {
      filteredPayments = filteredPayments.filter((payment) => {
        const createdAtDate = new Date(payment.createdAt); // Use createdAt field for filtering
        const startDate = new Date(selectedStartDate);
        const endDate = new Date(selectedEndDate);
    
        return createdAtDate >= startDate && createdAtDate <= endDate; // Filter based on createdAt date
      });
    }
    
    if (method) {
      filteredPayments = filteredPayments.filter(
        (payment) => payment.method === method
      );
    }

    const transactions = await fetchTransactions(
      CompanyId,
      selectedStartDate,
      selectedEndDate
    );

    // console.log(transactions, "Fetched Transactions");

    const matchedPayments = filteredPayments.filter((payment) => {
      const isTransactionMatched = transactions.some(
        (txn) =>
          String(txn.transaction_id).trim() ===
          String(payment.transactionid).trim()
      );
      const isMethodValid =
        payment.method === "Card" ||
        payment.method === "ACH" ||
        payment.method === "Cash" ||
        payment.method === "Cheque";
      return isTransactionMatched || isMethodValid; 
    });

    // console.log(matchedPayments, "Matched Payments");

    const enrichedPayments = matchedPayments.map((payment) => {
      const matchedTransaction = transactions.find(
        (txn) =>
          String(txn.transaction_id).trim() ===
          String(payment.transactionid).trim()
      );
      // console.log({ payment, matchedTransaction }, "Enrichment process");
      if (payment.method === "Card" || payment.method === "ACH") {
        return {
          ...payment,
          cc_type: matchedTransaction?.cc_type || "Unknown",
          cc_number: matchedTransaction?.cc_number || "Unknown",
          check_account: matchedTransaction?.check_account || "Unknown",
          first_name: matchedTransaction?.first_name || "Unknown",
          last_name: matchedTransaction?.last_name || "Unknown",
          email: matchedTransaction?.email || "Unknown",
          Phone: matchedTransaction?.phone || "Unknown",
          // check_account: txn?.check_account,

        };
      }
      return payment; 
    });

    // console.log(enrichedPayments, "Enriched Payments");
    const totalCount = enrichedPayments.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    const paginatedPayments = enrichedPayments.slice(pageNumber * pageSize, (pageNumber + 1) * pageSize);

    return {
      statusCode: 200,
      data: paginatedPayments.length > 0 ? paginatedPayments : enrichedPayments,
      totalPages: totalPages,
      currentPage: pageNumber + 1,  // Convert back to 1-based page number
      message:
        paginatedPayments.length > 0
          ? "Matched payment data retrieved successfully"
          : "No matched payment data or method found, returning all filtered payment data",
      totalCount,
    };
  } catch (error) {
    console.error(error, "Error in getPaymentHistory");

    return {
      statusCode: 500,
      data: null,
      message: "Error retrieving payment details",
    };
  }
};

router.get("/get_payment_data/:CompanyId",verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const { selectedStartDate, selectedEndDate, method, pageSize, pageNumber } = req.query;
    const result = await getPaymentHistory(
      CompanyId,
      selectedStartDate || null,
      selectedEndDate || null,
      method || null,
      { pageSize, pageNumber }
    );

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error in /get_payment_data API:", error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong. Please try again later!",
    });
  }
});

const getPaymentDetails = async (
  CompanyId,
  selectedStartDate,
  selectedEndDate,
  method
) => {
  try {
    // Fetch all payment details
    const getPayment = await InvoicePayment.aggregate([
      { $match: { CompanyId: CompanyId } },
      {
        $lookup: {
          from: "companies",
          localField: "CompanyId",
          foreignField: "companyId",
          as: "getCompanyDetails",
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "CustomerId",
          foreignField: "CustomerId",
          as: "getCustomerDetails",
        },
      },
      {
        $unwind: {
          path: "$getCompanyDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$getCustomerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          CompanyId: 1,
          method: 1,
          amount: 1,
          date: 1,
          Total: 1,
          transactionid: 1,
          InvoiceId: 1,
          createdAt: 1,
          updatedAt: 1,
          CustomerId: 1,
          "getCompanyDetails.companyName": 1,
          "getCompanyDetails.Address": 1,
          "getCompanyDetails.phoneNumber": 1,
          "getCompanyDetails.EmailAddress": 1,
          "getCustomerDetails.FirstName": 1,
          "getCustomerDetails.LastName": 1,
          "getCustomerDetails.EmailAddress": 1,
          "getCustomerDetails.PhoneNumber": 1,
        },
      },
    ]);

    let filteredPayments = getPayment;

    if (selectedStartDate && selectedEndDate) {
      filteredPayments = filteredPayments.filter((payment) => {
        const paymentDate = new Date(payment.date);
        return (
          paymentDate >= new Date(selectedStartDate) &&
          paymentDate <= new Date(selectedEndDate)
        );
      });
    }

    if (method) {
      filteredPayments = filteredPayments.filter(
        (payment) => payment.method === method
      );
    }

    // Fetch all transactions
    const transactions = await fetchTransactions(
      CompanyId,
      selectedStartDate,
      selectedEndDate
    );

    // **Filter: Match only payment.transactionid with transaction.transactionid**
    const matchedPayments = filteredPayments.filter((payment) =>{
      const isTransactionMatched = transactions.some(
        (txn) =>
          String(txn.transaction_id).trim() ===
          String(payment.transactionid).trim()
      );
      const isMethodValid =
        payment.method === "Card" ||
        payment.method === "ACH" ||
        payment.method === "Cash" ||
        payment.method === "Cheque";
      return isTransactionMatched || isMethodValid; 
    });
    
    // Adding extra fields if the method is "Card" or "ACH"
    const enrichedPayments = matchedPayments.map((payment) => {
      // Find the matched transaction to extract dynamic cc_type and cc_number
      const matchedTransaction = transactions.find(
        (txn) => String(txn.transaction_id).trim() ===
          String(payment.transactionid).trim()
      );

      if (payment.method === "Card" || payment.method === "ACH") {
        return {
          ...payment,
          cc_type: matchedTransaction.cc_type || "Unknown", 
          cc_number: matchedTransaction.cc_number || "Unknown",
          check_account: matchedTransaction?.check_account || "Unknown",
          first_name: matchedTransaction?.first_name || "Unknown",
          last_name: matchedTransaction?.last_name || "Unknown",
          email: matchedTransaction?.email || "Unknown",
          phone: matchedTransaction?.phone || "Unknown",
        };
      }
      return payment; // For non-Card/ACH payments, return as is
    });

    // If matched payments exist, return them; otherwise, return all getPayment data
    return {
      statusCode: 200,
      data: enrichedPayments.length > 0 ? enrichedPayments : getPayment, // If no match, return getPayment
      message: enrichedPayments.length
        ? "Matched payment data retrieved successfully"
        : "No matched payment data or method found, returning all payment data",
    };
    
    
  } catch (error) {
    console.error(error, "Error in getPaymentDetails");

    return {
      statusCode: 500,
      data: null,
      message: "Error retrieving payment details",
    };
  }
};

const generateCSV = async (
  CompanyId,
  filePath,
  startDate,
  endDate,
  method,
  data
) => {
  if (!CompanyId) {
    throw new Error("CompanyId is required");
  }

  // console.log(data, "data");

  if (!Array.isArray(data.data) || data.data.length === 0) {
    throw new Error("Invalid data format");
  }

  // Parse the start and end dates
  const start = startDate
    ? moment(startDate, "YYYY-MM-DD").startOf("day")
    : null;
  const end = endDate ? moment(endDate, "YYYY-MM-DD").endOf("day") : null;

  // Define valid methods
  const validMethods = ["Cash", "Card", "ACH", "Cheque"];

  const formattedData = data.data
    .map((item) => {
      return {
        ...item,
        CompanyId: item.CompanyId.toString(),
        Total: item.Total.toString(),
        InvoiceId: item.InvoiceId.toString(),
        amount: item.amount.toString(),
        createdAt: moment(item.createdAt).format("YYYY-MM-DD"),
        getCompanyDetails: {
          companyName: item.getCompanyDetails.companyName,
          phoneNumber: item.getCompanyDetails.phoneNumber,
        },
        getCustomerDetails: {
          FirstName: item?.getCustomerDetails?.FirstName? item.getCustomerDetails.FirstName : "N/A",
          LastName: item?.getCustomerDetails?.LastName? item.getCustomerDetails.LastName : "N/A",
          EmailAddress: item?.getCustomerDetails?.EmailAddress? item.getCustomerDetails.EmailAddress : "N/A",
          PhoneNumber: item?.getCustomerDetails?.PhoneNumber? item.getCustomerDetails.PhoneNumber : "N/A",
        },
        first_name: item.first_name,
        last_name: item.last_name,
        email: item.email,
        phone: item.phone,
      };
    })
    .filter((item) => {
      const createdAt = moment(item.createdAt, "YYYY-MM-DD");
      const isDateValid =
        start && end ? createdAt.isBetween(start, end, null, "[]") : true;
      const isMethodValid = method
        ? validMethods.includes(item.method) && item.method === method
        : true;

      return isDateValid && isMethodValid;
    });

  // Calculate max length for each column
  // const columnLengths = {
  //   CompanyId: "CompanyId".length,
  //   method: "Method".length,
  //   date: "Date".length,
  //   amount: "Amount".length,
  //   Total: "Total".length,
  //   InvoiceId: "InvoiceId".length,
  //   createdAt: "CreatedAt".length,
  //   companyName: "CompanyName".length,
  //   phoneNumber: "PhoneNumber".length,
  // };

  // formattedData.forEach((item) => {
  //   columnLengths.CompanyId = Math.max(columnLengths.CompanyId, item.CompanyId.length);
  //   columnLengths.method = Math.max(columnLengths.method, item.method.length);
  //   columnLengths.date = Math.max(columnLengths.date, item.date.length);
  //   columnLengths.amount = Math.max(columnLengths.amount, item.amount.length);
  //   columnLengths.Total = Math.max(columnLengths.Total, item.Total.length);
  //   columnLengths.InvoiceId = Math.max(columnLengths.InvoiceId, item.InvoiceId.length);
  //   columnLengths.createdAt = Math.max(columnLengths.createdAt, item.createdAt.length);
  //   columnLengths.companyName = Math.max(columnLengths.companyName, item.getCompanyDetails.companyName.length);
  //   columnLengths.phoneNumber = Math.max(columnLengths.phoneNumber, item.getCompanyDetails.phoneNumber.length);
  // });

  const paddedData = formattedData.map((item) => {
    return {
      ...item,
      CompanyId: item.CompanyId.padEnd(2, " "),
      method: item.method.padEnd(2, " "),
      date: item.date.padEnd(2, " "),
      amount: item.amount.padStart(2, " "),
      Total: item.Total.padStart(2, " "),
      TransactionId: item.transactionid,
      InvoiceId: item.InvoiceId.padEnd(2, " "),
      createdAt: item.createdAt.padEnd(2, " "),
      "getCompanyDetails.companyName": (item.getCompanyDetails &&
      item.getCompanyDetails.companyName
        ? item.getCompanyDetails.companyName
        : ""
      ).padEnd(2),
      "getCompanyDetails.phoneNumber": (item.getCompanyDetails &&
      item.getCompanyDetails.phoneNumber
        ? item.getCompanyDetails.phoneNumber
        : ""
      ).padEnd(2),
      "getCustomerDetails.EmailAddress": (item.getCustomerDetails &&
      item.getCustomerDetails.EmailAddress
        ? item.getCustomerDetails.EmailAddress
        : ""
      ).padEnd(2),
      "getCustomerDetails.PhoneNumber": (item.getCustomerDetails &&
      item.getCustomerDetails.PhoneNumber
        ? item.getCustomerDetails.PhoneNumber
        : ""
      ).padEnd(2),
      first_name: item.first_name? item.first_name : item.getCustomerDetails.FirstName,
      last_name: item.last_name? item.last_name : item.getCustomerDetails.LastName,
      email: item.email? item.email : item.getCustomerDetails.EmailAddress || "N/A",
      phone: item.phone? item.phone : item.getCustomerDetails.PhoneNumber || "N/A",
    };
  });

  const columns = [
    { id: "CompanyId", title: "CompanyId" },
    { id: "method", title: "Method" },
    { id: "date", title: "Date" },
    { id: "amount", title: "Amount" },
    { id: "Total", title: "Total" },
    { id: "InvoiceId", title: "InvoiceId" },
    { id: "transactionid", title: "transactionid" },
    { id: "createdAt", title: "CreatedAt" },
    { id: "getCompanyDetails.companyName", title: "CompanyName" },
    { id: "getCompanyDetails.phoneNumber", title: "PhoneNumber" },
    { id: "first_name", title: "first_name" },
    { id: "last_name", title: "last_name" },
    { id: "email", title: "email" },
    { id: "phone", title: "phone" },
  ];

  await makeCSV(filePath, startDate, endDate, data, paddedData, columns);
};

const generateExcel = async (data, outputFilePath, options = {}) => {
  const {
    columns,
    startDate,
    endDate,
    method,
    dateFormat = "YYYY-MM-DD",
    inputDateFormat = "YYYY-MM-DD",
  } = options;

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Invalid data format");
  }

  let start, end;
  if (startDate && endDate) {
    start = moment(startDate, inputDateFormat).startOf("day");
    end = moment(endDate, inputDateFormat).endOf("day");
  }

  // Define valid methods
  const validMethods = ["Cash", "Card", "ACH", "Cheque"];

  const filteredData = data
    .map((item) => ({
      ...item,
      CompanyId: item.CompanyId.toString(),
      Total: item.Total.toString(),
      InvoiceId: item.InvoiceId.toString(),
      amount: item.amount.toString(),
      createdAt: moment(item.createdAt).format(dateFormat),
      companyName: item.getCompanyDetails?.companyName || "", 
      first_name: item.first_name? item.first_name : item.getCustomerDetails?.FirstName || "N/A",
      last_name: item.last_name? item.last_name : item.getCustomerDetails?.LastName || "N/A",
      email: item.email? item.email : item.getCustomerDetails?.EmailAddress || "N/A",
      phone: item.phone? item.phone : item.getCustomerDetails?.PhoneNumber || "N/A",
    }))
    .filter((item) => {
      const createdAt = moment(item.createdAt, dateFormat);
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

router.post("/generate-report/:CompanyId",verifyLoginToken, async (req, res) => {
  const { CompanyId } = req.params;
  const { selectedStartDate, selectedEndDate, ispdf, iscsv, isexcel, method } =
    req.body;
  const baseFilename = "output";
  const folder = path.join(__dirname, "../../../../cdn/files");

  if (!CompanyId) {_
    return res
      .status(400)
      .json({ statusCode: 400, message: "CompanyId is required" });
  }

  try {
    const data = await getPaymentDetails(
      CompanyId,
      selectedStartDate,
      selectedEndDate,
      method
    );
    if (!data || !data.data) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Data not found" });
    }

    if (isexcel) {
      const excelFilePath = path.join(folder, `${baseFilename}.xlsx`);
      const columns = [
        { header: "CompanyId", key: "CompanyId" },
        { header: "Method", key: "method" },
        { header: "Date", key: "date" },
        { header: "Amount", key: "amount", alignment: { horizontal: "right" } },
        { header: "Total", key: "Total", alignment: { horizontal: "right" } },
        { header: "InvoiceId", key: "InvoiceId" },
        { header: "CreatedAt", key: "createdAt" },
        { header: "CompanyName", key: "companyName" },
        { header: "first_name", key: "first_name" },
        { header: "last_name", key: "last_name" },
        { header: "email", key: "email" },
        { header: "phone", key: "phone" },
      ];

      await generateExcel(data.data, excelFilePath, {
        columns,
        selectedStartDate,
        selectedEndDate,
        method,
        inputDateFormat: "DD-MM-YYYY",
        dateFormat: "YYYY-MM-DD",
      });

      // return res.download(excelFilePath, `${baseFilename}.xlsx`, (err) => {
      //   if (err) {
      //     return res.status(500).send("Error downloading the Excel file");
      //   }
      // });
      return res
        .status(200)
        .json({ statusCode: 200, fileName: `${baseFilename}.xlsx` });
    }

    if (iscsv) {
      const csvFilePath = path.join(folder, `${baseFilename}.csv`);
      await generateCSV(
        CompanyId,
        csvFilePath,
        selectedStartDate,
        selectedEndDate,
        method,
        data
      );
      // const fileName = csvFilePath;
      return res
        .status(200)
        .json({ statusCode: 200, fileName: `${baseFilename}.csv` });
    }

    if (ispdf) {
      const html = await paymentReportPdf(
        data.data,
        selectedStartDate,
        selectedEndDate,
        method
      );
      const pdfFileName = await generateAndSaveReportPdf(html);

      return res.status(200).json({ statusCode: 200, fileName: pdfFileName });
    }

    // If no flag is provided, return an error
    return res
      .status(400)
      .json({
        statusCode: 400,
        message: "No valid flag provided (ispdf, iscsv, isexcel)",
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
var express = require("express");
var router = express.Router();
const moment = require("moment");
const Invoice = require("./model");
const InvoiceItem = require("../Invoice/InvoiceItem/model");
const Contract = require("../Contract/model");
const Contracts = require("../Invoice/InvoiceItem/model");
const InvoicePayment = require("./InvoicePayment/model");
const CompanyMail = require("../../Superadmin/CompanyMail/model");
const MailConfig = require("../../Superadmin/MailConfiguration/model");
const { verifyLoginToken } = require("../../../authentication");
const { achPayment } = require("../../NMI/NmiAPi");
const { addNotification } = require("../../Notification/notification");
const Notification = require("../../Notification/model");
const { invoicePdf } = require("../../htmlFormates/InvoicFunction");
const { generateAndSavePdf } = require("../../generatePdf");
const Activities = require("../ActivitiesModel");
const Dropbox = require("../Dropbox/model");
const {
  getFileDataUri,
  getSignatureRequestDetails,
  removeSignatureRequest,
} = require("../Dropbox/route");
// const { default: Customer } = require("../../../../src/Views/Admin/Client/Customer");
const Customer = require("../Customer/model");
const Company = require("../Company/model");
const Account = require("../Account/model");
const { handleTemplate } = require("../Template/route");
const jwt = require("jsonwebtoken");
const { validateBody, InvoiceValidationSchema } = require("./validation");
// const { default: Company } = require("../../../../src/Views/Superadmin/Company/Index");

const createInvoice = async (invoiceData, req) => {
  // const existingInvoice = await Invoice.findOne({
  //   InvoiceNumber: invoiceData.InvoiceNumber,
  // });

  // if (existingInvoice) {
  //   return {
  //     statusCode: 400,
  //     message: `Contract Number ${invoiceData.InvoiceNumber} already exists. Please use a different number.`,
  //   };
  // }
  const InvoiceId = Date.now();
  const uniqueId = InvoiceId;
  invoiceData["InvoiceId"] = uniqueId;
  invoiceData["createdAt"] = moment()
    .utcOffset(330)
    .format("YYYY-MM-DD HH:mm:ss");
  invoiceData["updatedAt"] = moment()
    .utcOffset(330)
    .format("YYYY-MM-DD HH:mm:ss");

  await Invoice.create(invoiceData);

  if (invoiceData.items && invoiceData.items.length > 0) {
    for (const detail of invoiceData.items) {
      const detailItem = Date.now();
      const uniqueItemId = `${detailItem}`;

      detail["InvoiceId"] = uniqueId;
      detail["InvoiceItemId"] = uniqueItemId;
      detail["LocationId"] = invoiceData.LocationId;
      detail["CustomerId"] = invoiceData.CustomerId;
      detail["CompanyId"] = invoiceData.CompanyId;
      detail["WorkerId"] = invoiceData.WorkerId;
      detail["createdAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      detail["updatedAt"] = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");

      const detailWithoutId = Object.fromEntries(
        Object.entries(detail).filter(([key]) => key !== "_id")
      );

      await InvoiceItem.create(detailWithoutId);
    }

    //5206 code start:"notification"
    const existingNotification = await Notification.findOne({
      CompanyId: invoiceData.CompanyId,
      InvoiceId: invoiceData.InvoiceId,
    });
    if (!existingNotification) {
      await addNotification({
        CompanyId: invoiceData.CompanyId,
        InvoiceId: invoiceData.InvoiceId,
        CreatedBy: invoiceData.role.name || invoiceData.role.id,
        AddedAt: invoiceData.AddedAt,
      });
    }
  }

  let accountName = "Unknown Account";
  if (invoiceData.account_id) {
    const account = await Account.findOne({
      account_id: invoiceData.account_id,
    });
    if (account && account.account_name) {
      accountName = account.account_name;
    }
  }

  //5206 code start:"notification"
  await Activities.create({
    ActivityId: `${Date.now()}`,
    CompanyId: invoiceData.CompanyId,
    Action: "CREATE",
    Entity: "Invoice",
    EntityId: invoiceData.InvoiceId,
    ActivityBy: req.Role,
    ActivityByUsername: req.userName,
    Activity: {
      description: `Created a new Invoice #${invoiceData.InvoiceNumber} ${
        invoiceData.Subject || accountName
      }`,
    },
    Reason: "Invoice creation",
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  });
  await sendEmail(invoiceData.CompanyId, invoiceData, InvoiceId);

  return {
    statusCode: 200,
    message: "Invoice created successfully.",
    InvoiceId: uniqueId,
  };
};
router.post(
  "/",
  verifyLoginToken,
  validateBody(InvoiceValidationSchema),
  async (req, res) => {
    try {
      const result = await createInvoice(req.body, req);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Error creating invoice:", error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//----------------------CHECK INVOICENUMBER-------------------------------------------

const checkInvoiceNumber = async (CompanyId, InvoiceNumber) => {
  const findNumber = await Invoice.findOne({
    CompanyId: CompanyId,
    InvoiceNumber: InvoiceNumber,
    IsDelete: false,
  });

  if (findNumber) {
    return {
      statusCode: 203,
      message: "Number already exists",
    };
  } else {
    return {
      statusCode: 200,
      message: "Ok",
    };
  }
};
router.post("/check_number/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const { InvoiceNumber } = req.body;

    const result = await checkInvoiceNumber(CompanyId, InvoiceNumber);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-----------------------GET INVOICE ITEMS--------------------------------------

const getAllInvoicesAndItems = async () => {
  const invoice = await Invoice.find({ IsDelete: false });
  const invoiceItem = await InvoiceItem.find({ IsDelete: false });

  return {
    statusCode: 200,
    message: "Data retrieved successfully...",
    invoice,
    invoiceItem,
  };
};

router.get("/", verifyLoginToken, async (req, res) => {
  try {
    const result = await getAllInvoicesAndItems();
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//------------------------GET CALENDAR DATA---------------------------------------

const getScheduleData = async (CompanyId) => {
  const data = await Invoice.aggregate([
    {
      $match: {
        CompanyId: CompanyId,
        IsDelete: false,
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "CustomerId",
        foreignField: "CustomerId",
        as: "customer",
      },
    },
    {
      $unwind: {
        path: "$customer",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "locations",
        localField: "LocationId",
        foreignField: "LocationId",
        as: "location",
      },
    },
    {
      $unwind: {
        path: "$location",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        InvoiceId: 1,
        CompanyId: 1,
        CustomerId: 1,
        ContractId: 1,
        LocationId: 1,
        Title: "$Subject",
        InvoiceNumber: 1,
        DueDate: 1,
        Discount: 1,
        Status: 1,
        Tax: 1,
        subTotal: 1,
        ContractDisclaimer: 1,
        Message: 1,
        Total: 1,
        createdAt: 1,
        updatedAt: 1,
        FirstName: "$customer.FirstName",
        LastName: "$customer.LastName",
        Address: "$location.Address",
        City: "$location.City",
        State: "$location.State",
        Zip: "$location.Zip",
        Country: "$location.Country",
        sheduleDate: {
          $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
        },
      },
    },
  ]);
  return {
    statusCode: 200,
    data: data,
    message: "Read All Plans",
  };
};

router.get("/invoiceShedule/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const result = await getScheduleData(CompanyId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------GET INVOICE DETAILS DATA----------------------------------------

// const getInvoicesWithDetails = async (CompanyId, query) => {
//   const pageSize = parseInt(query.pageSize) || 10;
//   const pageNumber = parseInt(query.pageNumber) || 0;
//   const search = query.search;
//   const sortField = query.sortField || "updatedAt";
//   const sortOrder = query.sortOrder === "desc" ? -1 : 1;

//   let pipeline = [
//     {
//       $match: {
//         CompanyId,
//         IsDelete: false,
//       },
//     },
//     {
//       $lookup: {
//         from: "customers",
//         localField: "CustomerId",
//         foreignField: "CustomerId",
//         as: "customerData",
//       },
//     },
//     { $unwind: "$customerData" },
//     {
//       $set: {
//         customer: {
//           FirstName: "$customerData.FirstName",
//           LastName: "$customerData.LastName",
//           PhoneNumber: "$customerData.PhoneNumber",
//           EmailAddress: "$customerData.EmailAddress",
//         },
//       },
//     },
//     {
//       $lookup: {
//         from: "locations",
//         localField: "LocationId",
//         foreignField: "LocationId",
//         as: "locationData",
//       },
//     },
//     { $unwind: "$locationData" },
//     {
//       $set: {
//         location: {
//           Address: "$locationData.Address",
//           City: "$locationData.City",
//           State: "$locationData.State",
//           Country: "$locationData.Country",
//           Zip: "$locationData.Zip",
//         },
//       },
//     },
//   ];

//   if (search) {
//     const searchParts = search.split(" ").filter(Boolean);
//     const searchConditions = searchParts.map((part) => {
//       const searchRegex = new RegExp(part, "i");
//       return {
//         $or: [
//           { "customer.FirstName": { $regex: searchRegex } },
//           { "customer.LastName": { $regex: searchRegex } },
//           { "customer.PhoneNumber": { $regex: searchRegex } },
//           { "customer.EmailAddress": { $regex: searchRegex } },
//           { "location.Address": { $regex: searchRegex } },
//           { "location.City": { $regex: searchRegex } },
//           { "location.State": { $regex: searchRegex } },
//           { "location.Country": { $regex: searchRegex } },
//           { "location.Zip": { $regex: searchRegex } },
//           { Subject: { $regex: searchRegex } },
//           { InvoiceNumber: { $regex: searchRegex } },
//         ],
//       };
//     });

//     pipeline.push({
//       $match: {
//         $and: [{ CompanyId, IsDelete: false }, { $and: searchConditions }],
//       },
//     });
//   }
//   pipeline.push(
//     { $sort: { [sortField]: sortOrder } },
//     { $skip: pageNumber * pageSize },
//     { $limit: pageSize },
//     {
//       $project: {
//         CompanyId: 1,
//         InvoiceId: 1,
//         CustomerId: 1,
//         LocationId: 1,
//         Subject: 1,
//         InvoiceNumber: 1,
//         DueDate: 1,
//         PaymentDue: 1,
//         Discount: 1,
//         Status: 1,
//         Tax: 1,
//         subTotal: 1,
//         ContractDisclaimer: 1,
//         Message: 1,
//         Total: 1,
//         customer: 1,
//         location: 1,
//         updatedAt: 1,
//       },
//     }
//   );

//   const invoiceData = await Invoice.aggregate(pipeline);

//   if (!invoiceData.length) {
//     return {
//       statusCode: 200,
//       message: "No invoices found",
//       totalCount: 0,
//       data: [],
//     };
//   }

//   const totalPipeline = [...pipeline.slice(0, -3), { $count: "totalCount" }];
//   const totalResults = await Invoice.aggregate(totalPipeline);
//   const totalCount = totalResults.length > 0 ? totalResults[0].totalCount : 0;

//   const invoiceIds = invoiceData.map((invoice) => invoice.InvoiceId);
//   const invoicePayments = await InvoicePayment.find({
//     InvoiceId: { $in: invoiceIds },
//     IsDelete: false,
//   });

//   const enrichedInvoices = await Promise.all(
//     invoiceData.map(async (invoice) => {
//       const invoicePaymentData = invoicePayments.filter(
//         (payment) => payment.InvoiceId === invoice.InvoiceId
//       );

//       const totalInvoicePaid = invoicePaymentData.reduce(
//         (acc, payment) => acc + Number(payment.amount),
//         0
//       );
//       const invoiceAccount = Number(invoice.Total) - totalInvoicePaid;

//       const newStatus =
//         invoice.Status === "Canceled"
//           ? "Canceled"
//           : invoiceAccount === 0
//           ? "Paid"
//           : "Unpaid";

//       if (invoice.Status !== newStatus) {
//         await Invoice.updateOne(
//           { InvoiceId: invoice.InvoiceId },
//           { $set: { Status: newStatus } }
//         );
//       }

//       return {
//         ...invoice,
//         invoiceAccount,
//         Status: newStatus,
//       };
//     })
//   );

//   return {
//     statusCode: 200,
//     totalPages: Math.ceil(totalCount / pageSize),
//     currentPage: pageNumber,
//     totalCount,
//     data: enrichedInvoices,
//   };
// };

const getInvoicesWithDetails = async (CompanyId, query) => {
  const pageSize = parseInt(query.pageSize) || 10;
  const pageNumber = parseInt(query.pageNumber) || 0;
  const search = query.search;
  const sortOrder = query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;
  const statusFilter = query.statusFilter;

  const allowedSortFields = [
    "customerData.FirstName",
    "customerData.LastName",
    "locationData.Address",
    "locationData.City",
    "locationData.State",
    "locationData.Country",
    "locationData.Zip",
    "QuoteNumber",
    "DueDate",
    "Total",
    "subTotal",
    "invoiceAccount",
    "updatedAt",
    "createdAt",
  ];

  const sortField = allowedSortFields.includes(query.sortField)
    ? query.sortField
    : "updatedAt";

  let matchQuery = {
    CompanyId,
    IsDelete: false,
  };

  if (statusFilter && statusFilter !== "All") {
    matchQuery.Status = statusFilter;
  }

  const sortOptions = {
    [sortField]: sortOrder,
  };

  if (sortField === "Status") {
    sortOptions.Status = sortOrder;
  }

  let pipeline = [
    {
      $match: matchQuery,
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
  ];

  if (search) {
    const searchParts = search.split(" ").filter(Boolean);
    const searchConditions = searchParts.map((part) => {
      const searchRegex = new RegExp(part, "i");
      return {
        $or: [
          { "customer.FirstName": { $regex: searchRegex } },
          { "customer.LastName": { $regex: searchRegex } },
          { "customer.PhoneNumber": { $regex: searchRegex } },
          { "customer.EmailAddress": { $regex: searchRegex } },
          { "location.Address": { $regex: searchRegex } },
          { "location.City": { $regex: searchRegex } },
          { "location.State": { $regex: searchRegex } },
          { "location.Country": { $regex: searchRegex } },
          { "location.Zip": { $regex: searchRegex } },
          { Subject: { $regex: searchRegex } },
          { InvoiceNumber: { $regex: searchRegex } },
        ],
      };
    });

    pipeline.push({
      $match: {
        $and: [matchQuery, { $and: searchConditions }],
      },
    });
  }

  pipeline.push(
    { $sort: sortOptions },
    { $skip: pageNumber * pageSize },
    { $limit: pageSize },
    {
      $project: {
        CompanyId: 1,
        InvoiceId: 1,
        CustomerId: 1,
        LocationId: 1,
        Subject: 1,
        InvoiceNumber: 1,
        DueDate: 1,
        PaymentDue: 1,
        Discount: 1,
        Status: 1,
        Tax: 1,
        subTotal: 1,
        ContractDisclaimer: 1,
        Message: 1,
        Total: 1,
        customer: 1,
        location: 1,
        account_name: 1,
        account_id: 1,
        updatedAt: 1,
      },
    }
  );
  const collation = { locale: "en", strength: 2 };

  const invoiceData = await Invoice.aggregate(pipeline).collation(collation);

  if (!invoiceData.length) {
    return {
      statusCode: 200,
      message: "No invoices found",
      totalCount: 0,
      data: [],
    };
  }

  const totalPipeline = [...pipeline.slice(0, -3), { $count: "totalCount" }];
  const totalResults = await Invoice.aggregate(totalPipeline);
  const totalCount = totalResults.length > 0 ? totalResults[0].totalCount : 0;

  const invoiceIds = invoiceData.map((invoice) => invoice.InvoiceId);
  const invoicePayments = await InvoicePayment.find({
    InvoiceId: { $in: invoiceIds },
    IsDelete: false,
  });

  const enrichedInvoices = await Promise.all(
    invoiceData.map(async (invoice) => {
      const invoicePaymentData = invoicePayments.filter(
        (payment) => payment.InvoiceId === invoice.InvoiceId
      );

      const totalInvoicePaid = invoicePaymentData.reduce(
        (acc, payment) => acc + Number(payment.amount),
        0
      );
      const invoiceAccount = Number(invoice.Total) - totalInvoicePaid;

      const newStatus =
        invoice.Status === "Canceled"
          ? "Canceled"
          : invoiceAccount === 0
          ? "Paid"
          : "Unpaid";

      if (invoice.Status !== newStatus) {
        await Invoice.updateOne(
          { InvoiceId: invoice.InvoiceId },
          { $set: { Status: newStatus } }
        );
      }

      return {
        ...invoice,
        invoiceAccount,
        Status: newStatus,
      };
    })
  );

  return {
    statusCode: 200,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: pageNumber,
    totalCount,
    data: enrichedInvoices,
  };
};

router.get("/InvoicePayment", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Missing token" });
  }

  try {
    const decoded = jwt.verify(
      token,
      "fuirfgerug^%GF(Fijrijgrijgidjg#$@#$TYFSD()*$#%^&S(*^uk8olrgrtg#%^%#gerthr%B&^#eergege*&^#gg%*B^"
    );

    // Extract IDs from the decoded token
    const { InvoiceId, CompanyId, CustomersId } = decoded;

    // Assuming you are using MongoDB with Mongoose models
    const invoiceData = await Invoice.findOne({
      InvoiceId: InvoiceId, // ensure this field matches the model
    });
    const companyData = await Company.findOne({
      companyId: CompanyId, // ensure this field matches the model
    });
    const customerData = await Customer.findOne({
      CustomerId: CustomersId, // ensure this field matches the model
    });

    // If any of the queries return null, handle it
    if (!invoiceData || !companyData || !customerData) {
      return res
        .status(404)
        .json({ message: "Data not found for one or more IDs" });
    }

    res.json({
      message: "Token is valid",
      data: {
        invoice: invoiceData,
        company: companyData,
        customer: customerData,
      },
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

//5206 code end
router.get("/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const query = req.query;
    query.sortField = query.sortField || "updatedAt";
    query.sortOrder = query.sortOrder || "desc";
    //5206 code start: "pagination and search filter"
    const result = await getInvoicesWithDetails(CompanyId, query);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//------------------------GET INVOICENUMBER---------------------------------

const getMaxInvoiceNumber = async (CompanyId) => {
  const totalInvoices = await Invoice.find({
    CompanyId,
    IsDelete: false,
    InvoiceNumber: { $exists: true },
  }).select("InvoiceNumber");

  const invoiceNumbers = totalInvoices
    .map((invoice) => Number(invoice.InvoiceNumber))
    .filter((num) => !isNaN(num));

  const maxInvoiceNumber = invoiceNumbers.length
    ? Math.max(...invoiceNumbers)
    : 0;

  return {
    statusCode: 200,
    InvoiceNumber: maxInvoiceNumber || 0,
  };
};

router.get("/get_number/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;

    const result = await getMaxInvoiceNumber(CompanyId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//--------------------------GET INVOICE DETAILS--------------------------------------

//Invoice details
// const getInvoiceDetail = async (InvoiceId) => {
//   const contracts = await Invoice.aggregate([
//     { $match: { InvoiceId, IsDelete: false } },

//     {
//       $lookup: {
//         from: "customers",
//         localField: "CustomerId",
//         foreignField: "CustomerId",
//         as: "customerData",
//       },
//     },
//     { $unwind: "$customerData" },
//     {
//       $set: {
//         customer: {
//           FirstName: "$customerData.FirstName",
//           LastName: "$customerData.LastName",
//           PhoneNumber: "$customerData.PhoneNumber",
//           EmailAddress: "$customerData.EmailAddress",
//         },
//       },
//     },

//     {
//       $lookup: {
//         from: "locations",
//         localField: "LocationId",
//         foreignField: "LocationId",
//         as: "locationData",
//       },
//     },
//     { $unwind: "$locationData" },
//     {
//       $set: {
//         location: {
//           Address: "$locationData.Address",
//           City: "$locationData.City",
//           State: "$locationData.State",
//           Country: "$locationData.Country",
//           Zip: "$locationData.Zip",
//         },
//       },
//     },

//     {
//       $lookup: {
//         from: "invoiceitems",
//         let: { invoiceId: "$InvoiceId" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$InvoiceId", "$$invoiceId"] },
//                   { $eq: ["$IsDelete", false] },
//                 ],
//               },
//             },
//           },
//           {
//             $project: {
//               InvoiceItemId: 1,
//               Type: 1,
//               Name: 1,
//               Description: 1,
//               Unit: 1,
//               CostPerUnit: 1,
//               CostPerHour: 1,
//               Cost: 1,
//               Hour: 1,
//               Square: 1,
//               CostPerSquare: 1,
//               Total: 1,
//               Attachment: 1,
//               createdAt: 1,
//               updatedAt: 1,
//             },
//           },
//         ],
//         as: "Items",
//       },
//     },

//     {
//       $project: {
//         CompanyId: 1,
//         InvoiceId: 1,
//         CustomerId: 1,
//         ContractId: 1,
//         LocationId: 1,
//         Subject: 1,
//         InvoiceNumber: 1,
//         IssueDate: 1,
//         DueDate: 1,
//         PaymentDue: 1,
//         ContractDisclaimer: 1,
//         Message: 1,
//         Notes: 1,
//         Discount: 1,
//         Tax: 1,
//         subTotal: 1,
//         Total: 1,
//         Attachment: 1,
//         Status: 1,
//         createdAt: 1,
//         updatedAt: 1,
//         Items: 1,
//         customer: 1,
//         location: 1,
//       },
//     },
//   ]);

//   if (contracts.length > 0) {
//     return {
//       statusCode: 200,
//       data: contracts[0],
//     };
//   } else {
//     return {
//       statusCode: 404,
//       message: "Invoice not found!",
//     };
//   }
// };

const getDropboxFileData = async (signatureRequestId) => {
  const dataUri = await getFileDataUri(signatureRequestId);
  const statusCode = await getSignatureRequestDetails(signatureRequestId);
  return { dataUri: dataUri?.fileDataUri?.dataUri, statusCode };
};
const getInvoiceDetails = async (InvoiceId) => {
  if (!InvoiceId) {
    return {
      statusCode: 400,
      message: "InvoiceId is required!",
    };
  }

  const invoices = await Invoice.aggregate([
    {
      $match: { InvoiceId, IsDelete: false },
    },
    // Lookup for customer data
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
          CustomerId: "$customerData.CustomerId",
        },
      },
    },
    // Lookup for location data
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
      $lookup: {
        from: "companies",
        localField: "CompanyId",
        foreignField: "companyId",
        as: "companyData",
      },
    },
    { $unwind: "$companyData" },
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
    // Lookup for invoice items
    {
      $lookup: {
        from: "invoiceitems",
        let: { invoiceId: "$InvoiceId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$InvoiceId", "$$invoiceId"] },
                  { $eq: ["$IsDelete", false] },
                ],
              },
            },
          },
          {
            $project: {
              InvoiceItemId: 1,
              Description: 1,
              Quantity: 1,
              UnitPrice: 1,
              Total: 1,
              createdAt: 1,
              updatedAt: 1,
              Unit: 1,
              Attachment: 1,
              CostPerUnit: 1,
              CostPerHour: 1,
              CustomerMessage: 1,
              Cost: 1,
              Hourly: 1,
              Square: 1,
              CostPerSquare: 1,
              Fixed: 1,
              CostPerFixed: 1,
              Type: 1,
              Name: 1,
              Message: 1,
            },
          },
        ],
        as: "Items",
      },
    },
    {
      $lookup: {
        from: "dropboxes",
        localField: "InvoiceId",
        foreignField: "InvoiceId",
        as: "dropboxFiles",
        pipeline: [
          {
            $match: { IsDeleted: false },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$dropboxFiles",
        preserveNullAndEmptyArrays: true,
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
      $group: {
        _id: "$_id",
        InvoiceId: { $first: "$InvoiceId" },
        CustomerId: { $first: "$CustomerId" },
        LocationId: { $first: "$LocationId" },
        CompanyId: { $first: "$CompanyId" },
        ContractId: { $first: "$ContractId" },
        Subject: { $first: "$Subject" },
        Attachment: { $first: "$Attachment" },
        InvoiceNumber: { $first: "$InvoiceNumber" },
        IssueDate: { $first: "$IssueDate" },
        PaymentDue: { $first: "$PaymentDue" },
        ContractDisclaimer: { $first: "$ContractDisclaimer" },
        TotalAmount: { $first: "$TotalAmount" },
        Message: { $first: "$Message" },
        Discount: { $first: "$Discount" },
        Tax: { $first: "$Tax" },
        subTotal: { $first: "$subTotal" },
        Total: { $first: "$Total" },
        Attachment: { $first: "$Attachment" },
        Status: { $first: "$Status" },
        DueDate: { $first: "$DueDate" },
        Notes: { $first: "$Notes" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        Items: { $first: "$Items" },
        customer: { $first: "$customer" },
        location: { $first: "$location" },
        account_name: { $first: "$account_name" },
        dropboxFiles: { $push: "$dropboxFiles" },
        companyData: { $first: "$companyData" },
      },
    },
  ]);

  if (invoices.length === 0) {
    return {
      statusCode: 404,
      message: "Invoice not found!",
      data: {},
    };
  }

  const dropboxFiles = invoices[0]?.dropboxFiles
    ? await Promise.all(
        invoices[0].dropboxFiles
          .filter((dropboxFile) => !dropboxFile.IsDeleted)
          .map(async (dropboxFile) => {
            const { dataUri, statusCode } = await getDropboxFileData(
              dropboxFile.signatureRequestId
            );
            return { ...dropboxFile, dataUri, statusCode };
          })
      )
    : [];
  invoices[0].dropboxFiles = dropboxFiles;

  return {
    statusCode: 200,
    data: invoices[0],
    message: "Invoice retrieved successfully",
  };
};
router.get("/invoice_detail/:InvoiceId", verifyLoginToken, async (req, res) => {
  try {
    const { InvoiceId } = req.params;

    const result = await getInvoiceDetails(InvoiceId);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//--------------------------GET INVOICE DETAILS--------------------------------------

const getInvoiceCustomerDetails = async (CompanyId, CustomerId) => {
  const contractSearchQuery = {
    CompanyId,
    CustomerId,
    IsDelete: false,
  };

  const invoice = await Invoice.aggregate([
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
      $lookup: {
        from: "locations",
        localField: "LocationId",
        foreignField: "LocationId",
        as: "locationData",
      },
    },
    { $unwind: "$locationData" },
    {
      $addFields: {
        customer: {
          FirstName: "$customerData.FirstName",
          LastName: "$customerData.LastName",
        },
        location: {
          Address: "$locationData.Address",
          City: "$locationData.City",
          State: "$locationData.State",
          Country: "$locationData.Country",
          Zip: "$locationData.Zip",
        },
      },
    },
    { $match: contractSearchQuery },
    { $sort: { updatedAt: -1 } },
    {
      $project: {
        CompanyId: 1,
        CustomerId: 1,
        ContractId: 1,
        LocationId: 1,
        InvoiceId: 1,
        Subject: 1,
        InvoiceNumber: 1,
        Status: 1,
        DueDate: 1,
        Total: 1,
        customer: 1,
        location: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (invoice.length > 0) {
    return {
      statusCode: 200,
      data: invoice,
    };
  } else {
    return {
      statusCode: 204,
      message: "No invoice found",
    };
  }
};
router.get(
  "/get_invoice_customer/:CompanyId/:CustomerId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { CompanyId, CustomerId } = req.params;

      const result = await getInvoiceCustomerDetails(CompanyId, CustomerId);

      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//-------------------------GET INVOICE PROPERTIES----------------------------------------

const getInvoiceCustomerPropertyDetails = async (
  CompanyId,
  CustomerId,
  LocationId
) => {
  const invoiceSearchQuery = {
    CompanyId,
    CustomerId,
    LocationId,
    IsDelete: false,
  };

  const invoice = await Invoice.aggregate([
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
      $lookup: {
        from: "locations",
        localField: "LocationId",
        foreignField: "LocationId",
        as: "locationData",
      },
    },
    { $unwind: "$locationData" },
    {
      $addFields: {
        customer: {
          FirstName: "$customerData.FirstName",
          LastName: "$customerData.LastName",
        },
        location: {
          Address: "$locationData.Address",
          City: "$locationData.City",
          State: "$locationData.State",
          Country: "$locationData.Country",
          Zip: "$locationData.Zip",
        },
      },
    },
    { $match: invoiceSearchQuery },
    { $sort: { updatedAt: -1 } },
    {
      $project: {
        CompanyId: 1,
        CustomerId: 1,
        ContractId: 1,
        LocationId: 1,
        InvoiceId: 1,
        Subject: 1,
        InvoiceNumber: 1,
        Status: 1,
        DueDate: 1,
        Total: 1,
        customer: 1,
        location: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (invoice.length > 0) {
    return {
      statusCode: 200,
      data: invoice,
    };
  } else {
    return {
      statusCode: 204,
      message: "No invoice found",
    };
  }
};
router.get(
  "/get_invoice_customer_property/:CompanyId/:CustomerId/:LocationId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { CompanyId, CustomerId, LocationId } = req.params;

      const result = await getInvoiceCustomerPropertyDetails(
        CompanyId,
        CustomerId,
        LocationId
      );

      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//-------------------------PUT INVOICE DATA--------------------------------------

const updateInvoice = async (InvoiceId, invoiceData, items, req) => {
  if (!InvoiceId) {
    return {
      statusCode: 400,
      message: "InvoiceId is required!",
    };
  }

  const invoice = await Invoice.findOne({ InvoiceId, IsDelete: false });

  if (!invoice) {
    return {
      statusCode: 404,
      message: "Invoice not found!",
    };
  }
  if (invoice) {
    const existingDetails = await InvoiceItem.find({
      InvoiceId,
      IsDelete: false,
    });
    const incomingDetailIds = items
      .map((detail) => detail.InvoiceItemId)
      .filter(Boolean);
    const detailsToDelete = existingDetails.filter(
      (detail) => !incomingDetailIds.includes(detail.InvoiceItemId)
    );

    const deletePromises = detailsToDelete.map((detail) =>
      InvoiceItem.findOneAndDelete({ InvoiceItemId: detail.InvoiceItemId })
    );
    await Promise.all(deletePromises);
  }

  Object.assign(invoice, invoiceData);
  invoice.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  await invoice.save();

  if (Array.isArray(items) && items.length > 0) {
    const detailPromises = items.map(async (detail, index) => {
      detail.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

      if (!detail.InvoiceItemId) {
        const newInvoiceItem = {
          ...detail,
          InvoiceId: invoice.InvoiceId,
          InvoiceItemId: `${Date.now() + index}`,
          createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        };
        return await InvoiceItem.create(newInvoiceItem);
      } else {
        const updatedItem = await InvoiceItem.findOneAndUpdate(
          { InvoiceItemId: detail.InvoiceItemId, IsDelete: false },
          { $set: detail },
          { new: true }
        );
        if (!updatedItem) {
          return {
            statusCode: 404,
            message: "Item not found!",
          };
        }
        return updatedItem;
      }
    });

    await Promise.all(detailPromises);
  }
  await Activities.create({
    ActivityId: `${Date.now()}`,
    CompanyId: req.CompanyId,
    Action: "UPDATE",
    Entity: "Invoice",
    EntityId: InvoiceId,
    ActivityBy: req.Role,
    ActivityByUsername: req.userName,
    Activity: {
      description: `Updated a Invoice #${invoiceData.InvoiceNumber} ${invoiceData.Subject}`,
    },
    Reason: "Invoice updating",
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  });

  return {
    statusCode: 200,
    message: "Invoice updated successfully.",
    data: invoice,
    items,
  };
};
router.put("/:InvoiceId", verifyLoginToken, async (req, res) => {
  const { InvoiceId } = req.params;
  const { items, ...invoiceData } = req.body;

  try {
    const result = await updateInvoice(InvoiceId, invoiceData, items, req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//--------------------------CANCEL INVOICE---------------------------------------

const cancelInvoice = async (InvoiceId, DeleteReason, req) => {
  if (!InvoiceId) {
    return {
      statusCode: 400,
      message: "InvoiceId is required!",
    };
  }
  const invoice = await Invoice.findOneAndUpdate(
    { InvoiceId, IsDelete: false },
    {
      $set: {
        Status: "Canceled",
        updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      },
    },
    { new: true }
  );

  if (!invoice) {
    return {
      statusCode: 404,
      message: "Invoice not found!",
    };
  }
  await Activities.create({
    ActivityId: `${Date.now()}`,
    CompanyId: req.CompanyId,
    Action: "UPDATE",
    Entity: "Invoice Cancellation",
    EntityId: InvoiceId,
    ActivityBy: req.Role,
    ActivityByUsername: req.userName,
    Activity: {
      description: `Invoice cancelled by #${invoice.InvoiceNumber} ${invoice.Subject}`,
    },
    Reason: req.body.data.DeleteReason,
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  });

  return {
    statusCode: 200,
    message: "Invoice canceled successfully.",
    data: invoice,
  };
};
router.put("/cancel/:InvoiceId", verifyLoginToken, async (req, res) => {
  const { InvoiceId } = req.params;
  const { DeleteReason } = req.body;

  try {
    const result = await cancelInvoice(InvoiceId, DeleteReason, req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error canceling invoice:", error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------DELETE INVOICE---------------------------------------

const deleteInvoice = async (InvoiceId, ContractId, DeleteReason, req) => {
  //5206 code start: validation if invoice assign with any
  const findContract = await Contract.findOne({ ContractId });

  if (findContract && !findContract.IsDelete) {
    return {
      statusCode: 202,
      message:
        "You can't delete the customer, it's already assigned to a contract",
    };
  }
  //5206 code end: validation if customer assign with any

  if (!InvoiceId) {
    return {
      statusCode: 400,
      message: "InvoiceId is required!",
    };
  }

  const dropboxEntry = await Dropbox.findOne({ InvoiceId });
  if (dropboxEntry && dropboxEntry.signatureRequestId) {
    await removeSignatureRequest(dropboxEntry.signatureRequestId);
  }

  const updatedInvoice = await Invoice.findOneAndUpdate(
    { InvoiceId },
    { $set: { IsDelete: true, DeleteReason } },
    { new: true }
  );

  const updatedItems = await InvoiceItem.updateMany(
    { InvoiceId },
    { $set: { IsDelete: true } },
    { new: true }
  );
  const updatedNotifications = await Notification.updateMany(
    { InvoiceId },
    { $set: { IsDelete: true } }
  );

  if (
    updatedInvoice ||
    updatedItems.modifiedCount > 0 ||
    updatedNotifications.nModified > 0
  ) {
    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: req.CompanyId,
      Action: "DELETE",
      Entity: "Invoice",
      EntityId: updatedInvoice.InvoiceId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Deleted a Invoice #${updatedInvoice.InvoiceNumber} ${updatedInvoice.Subject}`,
      },
      Reason: req.body.DeleteReason,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      message: "Invoice deleted successfully",
    };
  } else {
    return {
      statusCode: 404,
      message: "Deletion failed, invoice not found or something went wrong",
    };
  }
};
// const deleteInvoice = async (InvoiceId, ContractId, DeleteReason, req) => {
//   const findContract = await Contract.findOne({ ContractId });

//   if (findContract && !findContract.IsDelete) {
//     return {
//       statusCode: 202,
//       message:
//         "You can't delete the invoice; it's already assigned to a contract.",
//     };
//   }    // const token = await createResetToken({ EmailAddress });

//   if (!InvoiceId) {
//     return {
//       statusCode: 400,
//       message: "InvoiceId is required!",
//     };
//   }

//   const dropboxEntry = await Dropbox.findOne({ InvoiceId });
//   let isComplete = false;

//   if (dropboxEntry && dropboxEntry.signatureRequestId) {
//     const signatureRequestResponse = await removeSignatureRequest(
//       dropboxEntry.signatureRequestId
//     );
//     if (signatureRequestResponse.statusCode === 200) {
//       isComplete = true;
//     }
//   }

//   const updatedInvoice = await Invoice.findOneAndUpdate(
//     { InvoiceId },
//     { $set: { IsDelete: true, DeleteReason } },
//     { new: true }
//   );

//   const updatedItems = await InvoiceItem.updateMany(
//     { InvoiceId },
//     { $set: { IsDelete: true } },
//     { new: true }
//   );

//   const updatedNotifications = await Notification.updateMany(
//     { InvoiceId },
//     { $set: { IsDelete: true } }
//   );

//   if (
//     updatedInvoice ||
//     updatedItems.modifiedCount > 0 ||
//     updatedNotifications.nModified > 0
//   ) {
//     await Activities.create({
//       ActivityId: `${Date.now()}`,
//       CompanyId: req.CompanyId,
//       Action: "DELETE",
//       Entity: "Invoice",
//       EntityId: updatedInvoice.InvoiceId,
//       ActivityBy: req.Role,
//       ActivityByUsername: req.userName,
//       Activity: {
//         description: `Deleted an Invoice #${updatedInvoice.InvoiceNumber} ${updatedInvoice.Subject}`,
//       },
//       Reason: req.body.DeleteReason,
//       createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//       updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//     });

//     if (isComplete) {
//       const signatureRequest = await Dropbox.findOne({
//         signatureRequestId: dropboxEntry.signatureRequestId,
//       });

//       const data = {
//         CompanyId: signatureRequest.CompanyId,
//         InvoiceId: signatureRequest.InvoiceId,
//       };

//       const signerName =
//         signatureRequest.signers.length > 0
//           ? signatureRequest.signers[0].name
//           : "Unknown Signer";

//       const activityData = {
//         ActivityId: `${Date.now()}`,
//         CompanyId: data.CompanyId,
//         Action: "DELETE",
//         Entity: "",
//         EntityId: "",
//         ActivityBy: req.Role,
//         ActivityByUsername: req.userName,
//         Activity: {
//           description: "",
//         },
//         Reason: "",
//         createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//         updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//       };

//       if (data.InvoiceId) {
//         activityData.Entity = "Dropbox Signature for Invoice";
//         activityData.EntityId = data.InvoiceId;
//         activityData.Activity.description = `Invoice Signature Request canceled for "${signerName}`;
//         activityData.Reason = req.body.DeleteReason;
//       } else {
//         throw new Error("Delete activity cannot be logged.");
//       }

//       await Activities.create(activityData);
//     }

//     return {
//       statusCode: 200,
//       message: "Invoice deleted successfully!",
//     };
//   } else {
//     return {
//       statusCode: 404,
//       message: "Deletion failed, invoice not found or something went wrong.",
//     };
//   }
// };

router.delete("/:InvoiceId", verifyLoginToken, async (req, res) => {
  const { InvoiceId } = req.params;
  const { ContractId, DeleteReason } = req.body;
  try {
    const result = await deleteInvoice(
      InvoiceId,
      DeleteReason,
      ContractId,
      req
    );

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------SEND MAIL--------------------------------------

// send invoice mail to customer
const sendEmail = async (companyId, data, IsSendpdf, InvoicesId) => {
  try {
    const { CustomerId } = data;
    const InvoiceId = InvoicesId || data?.InvoiceId;
    const findCustomer = await Customer.findOne({ CustomerId });
    if (!findCustomer) {
      return { statusCode: 404, message: "Customer not found" };
    }

    const findCompany = await Company.findOne({ companyId });
    if (!findCompany) {
      return { statusCode: 404, message: "Company not found" };
    }

    let fileName = null;

    if (IsSendpdf) {
      try {
        const response = await getInvoiceDetails(InvoiceId);
        if (!response || !response.data) {
          return { statusCode: 404, message: "Invoices not found" };
        }

        const html = await invoicePdf(response.data);
        fileName = await generateAndSavePdf(html);
        // return { statusCode: 200, message: "generate PDF", fileName };
      } catch (error) {
        console.error("Error generating PDF:", error);
        return { statusCode: 500, message: "Failed to generate PDF" };
      }
    }

    const CompanyId = data?.CompanyId;
    const CustomersId = data?.CustomerId;
    const companyName = data?.companyName || data?.role?.companyName;

    const token = jwt.sign(
      { InvoiceId, CompanyId, CustomersId },
      "fuirfgerug^%GF(Fijrijgrijgidjg#$@#$TYFSD()*$#%^&S(*^uk8olrgrtg#%^%#gerthr%B&^#eergege*&^#gg%*B^",
      { expiresIn: "30d" }
    );

    const url = `https://app.cloudjobmanager.com/InvoicePayment?token=${token}`;

    const makepayment = `
      <p><a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #e88c44; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none; border-radius: 50px; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: all 0.3s ease;">Make Your Payment</a></p>
    `;

    const defaultSubject = "Your Custom Invoice from Cloud Job Manager";
    const defaultBody = `
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
      <h2 style="font-size: 24px; color: #003366; text-align: center;  font-weight: 700;">Your Custom Invoice is Ready!</h2>
      <p style="font-size: 18px; color: #555; line-height: 1.7; text-align: center; font-weight: 400;">Dear <strong style="color: #003366;">${
        findCustomer.FirstName
      } ${findCustomer.LastName}</strong>,</p>
      <p style="font-size: 16px; color: #555; line-height: 1.6;">Thank you for the opportunity to provide a Invoice for <strong style="color: #003366;">${
        data.Subject
      }</strong> with a total amount of <strong>$${data.Total}</strong>.</p>
      <p style="font-size: 16px; color: #555; line-height: 1.6;">We are excited to present this custom Invoice tailored just for you.</p>

      

      <!-- Invoice Details Section -->
      <div style=" padding: 15px; text-align: center;  ">
        <h3 style="font-size: 21px; color: #e88c44; font-weight: 700;">Total Amount: <strong style="font-size: 21px; color: #003366;">$${
          data.Total
        }</strong></h3>
        <p style="font-size: 16px; color: #718096; font-weight: 400;">Invoice Date: <strong>${moment(
          data.createdAt
        ).format("DD-MM-YYYY")}</strong></p>
      </div>


       <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #e88c44; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none; border-radius: 50px; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: all 0.3s ease;">Make Your Payment</a>

      <p style="font-size: 16px; color: #555; line-height: 1.7; text-align: center;">If you have any questions or would like to proceed with this Invoice, please reach out to us at <a href="mailto:${
        findCompany.EmailAddress
      }" style="color: #003366; text-decoration: none; font-weight: 600;">${
      findCompany.EmailAddress
    }</a>.</p>
      <p style="font-size: 16px; color: #555; line-height: 1.7; text-align: center;">We look forward to working with you!</p>

      <div style="text-align: end; margin-top: 40px;">
        <p style="font-size: 16px; color: #555;">Best regards,<br />
          <strong style="color: #003366; font-weight: 700;">${
            findCompany.companyName
          }</strong><br />
          <span style="font-size: 14px; color: #718096;">${
            findCompany.EmailAddress
          }</span>
        </p>
      </div>
    </td>
  </tr>

  <!-- Footer Section -->
  <tr>
    <td style="padding: 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f4f4f7; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; font-family: 'Arial', sans-serif;">
      CloudJobManager, Inc. | All rights reserved.<br>
      <a href="#" style="color: #e88c44; text-decoration: none; font-weight: 600;">Unsubscribe</a> if you no longer wish to receive these emails.
    </td>
  </tr>
</table>`;

    const QuoteData = [
      {
        FirstName: findCustomer.FirstName || "",
        LastName: findCustomer.LastName || "",
        EmailAddress: findCustomer.EmailAddress || "",
        PhoneNumber: findCustomer.PhoneNumber || "",
        companyName: findCompany.companyName || "",
        EmailAddress: findCompany.EmailAddress || "",
        companyPhoneNumber: findCompany.phoneNumber || "",
        Subject: data.Subject || "",
        InvoiceNumber: data.InvoiceNumber || "",
        SubTotal: data.SubTotal || "",
        Discount: data.Discount || "",
        Tax: data.Tax || "",
        Total: data.Total || "",
        url: makepayment || "",
      },
    ];
    const emailStatus = await handleTemplate(
      "Invoice",
      findCompany.companyId,
      QuoteData,
      [fileName],
      defaultSubject,
      defaultBody,
      findCustomer.CustomerId
    );

    if (emailStatus) {
      return {
        statusCode: 200,
        message: `Email was sent to ${findCustomer.EmailAddress}`,
      };
    } else {
      return {
        statusCode: 203,
        message: "Issue sending email",
      };
    }
  } catch (error) {
    console.error("Error sending email:", error.message);
    return {
      statusCode: 500,
      message: "Something went wrong, please try again later",
    };
  }
};

router.post("/send_mail/:companyId", verifyLoginToken, async (req, res) => {
  try {
    const { companyId } = req.params;
    const { IsSendpdf, ...data } = req.body;
    const response = await sendEmail(companyId, data, IsSendpdf);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-----------------------COLLECT PAYMENT------------------------------------------

const collectPayment = async (paymentDetails) => {
  const NmisecretKey = await NmiKeys.findOne({
    CompanyId: paymentDetails.CompanyId,
  });

  if (!NmisecretKey) {
    return {
      statusCode: 404,
      message: "Security key not found",
    };
  }

  const nmiResponse = await achPayment(
    paymentDetails,
    NmisecretKey.SecurityKey
  );

  if (nmiResponse.response_code === "100") {
    const successMessage = `Payment done successfully! Transaction ID: ${nmiResponse.transactionid}`;
    return {
      statusCode: 200,
      message: successMessage,
      data: nmiResponse,
    };
  } else {
    return {
      statusCode: 200,
      message: `Failed to process payment: ${nmiResponse.responsetext}`,
      data: nmiResponse,
    };
  }
};
router.post("/collect-payment", verifyLoginToken, async (req, res) => {
  try {
    const response = await collectPayment(req.body);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

router.post("/invoicepdf/:InvoiceId", verifyLoginToken, async (req, res) => {
  try {
    const { InvoiceId } = req.params;
    if (!InvoiceId) {
      return res
        .status(400)
        .json({ statusCode: 400, message: "InvoiceId is required" });
    }

    const response = await getInvoiceDetails(InvoiceId);
    if (!response || !response.data) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Invoice not found" });
    }

    const html = await invoicePdf(response.data);

    const fileName = await generateAndSavePdf(html);

    return res.status(200).json({ statusCode: 200, fileName });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);

    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later.",
    });
  }
});
//-------------------------------------------------------------------------------------

const fetchInvoices = async (CustomerId) => {
  const filterConditions = {
    CustomerId,
    IsDelete: false,
  };

  const invoiceData = await Invoice.aggregate([
    {
      $match: filterConditions,
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
      $project: {
        CompanyId: 1,
        InvoiceId: 1,
        CustomerId: 1,
        LocationId: 1,
        Subject: 1,
        InvoiceNumber: 1,
        DueDate: 1,
        Status: 1,
        Discount: 1,
        Tax: 1,
        subTotal: 1,
        Total: 1,
        customer: 1,
        location: 1,
        UpdatedAt: 1,
      },
    },
  ]);

  if (!invoiceData.length) {
    return {
      statusCode: 404,
      message: "Invoices not found",
    };
  }

  const invoiceIds = invoiceData.map((invoice) => invoice.InvoiceId);

  const invoicePayments = await InvoicePayment.find({
    InvoiceId: { $in: invoiceIds },
    IsDelete: false,
  });

  const object = {};
  invoiceData.forEach((invoice) => {
    const invoicePaymentData = invoicePayments.filter(
      (payment) => payment.InvoiceId === invoice.InvoiceId
    );

    const totalInvoicePaid = invoicePaymentData.reduce(
      (acc, payment) => acc + Number(payment.amount),
      0
    );

    const Status = invoice.Status;
    if (!object[`${Status}`]) {
      object[`${Status}`] = [];
    }
    object[`${Status}`].push({
      ...invoice,
      balance: Number(invoice.Total) - totalInvoicePaid,
    });
  });

  return {
    statusCode: 200,
    data: object,
  };
};
router.get("/invoice/:CustomerId", verifyLoginToken, async (req, res) => {
  try {
    const { CustomerId } = req.params;
    const response = await fetchInvoices(CustomerId);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

module.exports = { router, createInvoice, getMaxInvoiceNumber };

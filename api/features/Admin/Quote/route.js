var express = require("express");
var router = express.Router();
const moment = require("moment");
const Quotes = require("../Quote/model");
const QuoteDetail = require("./QuoteDetail/model");
const Locations = require("../Location/model");
const Customer = require("../Customer/model");
const Quote = require("../Quote/QuoteDetail/model");
const Company = require("../Company/model");
const Contract = require("../Contract/model");
const Notification = require("../../Notification/model");
const CompanyMail = require("../../Superadmin/CompanyMail/model");
const MailConfig = require("../../Superadmin/MailConfiguration/model");
const Activities = require("../ActivitiesModel");
const Dropbox = require("../Dropbox/model");

const { addNotification } = require("../../Notification/notification");
const { verifyLoginToken } = require("../../../authentication");
const { quotePdf } = require("../../htmlFormates/QuoteFunction");
const { generateAndSavePdf } = require("../../generatePdf");
const {
  getFileDataUri,
  getSignatureRequestDetails,
  removeSignatureRequest,
} = require("../Dropbox/route");
const { handleTemplate } = require("../Template/route");
const { validateBody, QuoteValidationSchema } = require("./validation");

// Post Quotes from Company
const createQuoteWithDetails = async (req, quoteData) => {
  const timestamp = Date.now();
  const uniqueId = `${timestamp}`;
  const currentTime = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  // const existingQuote = await Quotes.findOne({
  //   QuoteNumber: quoteData.QuoteNumber,
  // });

  // if (existingQuote) {
  //   return {
  //     statusCode: 400,
  //     message: `Quote Number ${quoteData.QuoteNumber} already exists. Please use a different number.`,
  //   };
  // }

  quoteData.QuoteId = uniqueId;
  quoteData.createdAt = currentTime;
  quoteData.updatedAt = currentTime;

  const newQuote = await Quotes.create(quoteData);

  const detailPromises = quoteData.details.map((detail, index) => {
    const detailTimestamp = Date.now() + index;
    const uniqueDetailId = `${detailTimestamp}`;

    detail.QuoteId = uniqueId;
    detail.QuoteDetailId = uniqueDetailId;
    detail.LocationId = quoteData.LocationId;
    detail.CustomerId = quoteData.CustomerId;
    detail.CompanyId = quoteData.CompanyId;
    detail.createdAt = currentTime;
    detail.updatedAt = currentTime;
    return QuoteDetail.create(detail);
  });
  await Promise.all(detailPromises);

  await addNotification({
    CompanyId: quoteData.CompanyId,
    CustomerId: quoteData.CustomerId,
    QuoteId: uniqueId,
    LocationId: quoteData.LocationId,
    CreatedBy: quoteData.role,
    AddedAt: quoteData.AddedAt,
  });

  await Activities.create({
    ActivityId: `${Date.now()}`,
    CompanyId: quoteData.CompanyId,
    Action: "CREATE",
    Entity: "Quote",
    EntityId: quoteData.QuoteId,
    ActivityBy: req.Role,
    ActivityByUsername: req.userName,
    Activity: {
      description: `Created a new quote #${newQuote.QuoteNumber} ${newQuote.Title}`,
    },
    Reason: "Quote creation",
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  });

  return {
    statusCode: 200,
    data: newQuote,
    message: "Quote added successfully",
  };
};
router.post(
  "/",
  verifyLoginToken,
  validateBody(QuoteValidationSchema),
  async (req, res) => {
    try {
      const result = await createQuoteWithDetails(req, req.body);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//--------------------------CHECK QUOTENUMBER----------------------------------------

const checkQuoteNumberExists = async (companyId, quoteNumber) => {
  const findNumber = await Quotes.findOne({
    CompanyId: companyId,
    QuoteNumber: quoteNumber,
    IsDelete: false,
  });

  if (findNumber) {
    return { statusCode: 203, message: "Number already exists" };
  } else {
    return { statusCode: 200, message: "Ok" };
  }
};
router.post("/check_number/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const { QuoteNumber } = req.body;

    const result = await checkQuoteNumberExists(CompanyId, QuoteNumber);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ statusCode: 500, message: error.message });
  }
});

//--------------------------GET QUOTE FOR CUSTOMER----------------------------------------

// For Customer show Assigned Quote (Customer)
const getCustomerQuotes = async (CustomerId) => {
  if (!CustomerId) {
    throw { statusCode: 400, message: "CustomerId is required!" };
  }

  const projectFields = {
    _id: 1,
    CompanyId: 1,
    CustomerId: 1,
    QuoteId: 1,
    LocationId: 1,
    Title: 1,
    SubTotal: 1,
    Discount: 1,
    Tax: 1,
    Total: 1,
    CustomerMessage: 1,
    ContractDisclaimer: 1,
    Notes: 1,
    Attachment: 1,
    ChangeRequest: 1,
    status: 1,
    QuoteNumber: 1,
    Total: 1,
    createdAt: 1,
    updatedAt: 1,
    company: { companyName: "$companyData.companyName" },
    address: {
      Address: "$Address",
      City: "$City",
      State: "$State",
      Zip: "$Zip",
      Country: "$Country",
    },
  };

  const quotes = await Quotes.aggregate([
    { $match: { CustomerId, IsDelete: false } },
    {
      $lookup: {
        from: "locations",
        localField: "LocationId",
        foreignField: "LocationId",
        as: "locationDetails",
      },
    },
    { $unwind: "$locationDetails" },
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
      $addFields: {
        Address: "$locationDetails.Address",
        City: "$locationDetails.City",
        State: "$locationDetails.State",
        Zip: "$locationDetails.Zip",
        Country: "$locationDetails.Country",
      },
    },
    {
      $facet: {
        awaitingResponse: [
          { $match: { status: "Awaiting Response" } },
          { $project: projectFields },
        ],
        changesRequested: [
          { $match: { status: "Request changed" } },
          { $project: projectFields },
        ],
        approved: [
          { $match: { status: "Approved" } },
          { $project: projectFields },
        ],
      },
    },
  ]);

  return {
    statusCode: quotes.length > 0 ? 200 : 204,
    data: {
      "Awaiting Response": quotes[0]?.awaitingResponse || [],
      "Request changed": quotes[0]?.changesRequested || [],
      Approved: quotes[0]?.approved || [],
    },
    message:
      quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
  };
};
router.get("/quotes/:CustomerId", verifyLoginToken, async (req, res) => {
  try {
    const { CustomerId } = req.params;
    const result = await getCustomerQuotes(CustomerId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});
//------------GET QUOTE DATA------------------------------------

// const getQuotes = async (query, CompanyId) => {
//   const pageSize = parseInt(query.pageSize) || 10;
//   const pageNumber = parseInt(query.pageNumber) || 0;
//   const search = query.search;
//   const sortField = query.sortField || "updatedAt";
//   const sortOrder = query.sortOrder === "desc" ? -1 : 1;

//   let quoteSearchQuery = { CompanyId, IsDelete: false };

//   const sortOptions = {
//     [sortField]: sortOrder,
//   };

//   const basePipeline = [
//     { $match: quoteSearchQuery },
//     {
//       $lookup: {
//         from: "customers",
//         localField: "CustomerId",
//         foreignField: "CustomerId",
//         as: "customerData",
//       },
//     },
//     { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
//     {
//       $lookup: {
//         from: "locations",
//         localField: "LocationId",
//         foreignField: "LocationId",
//         as: "locationData",
//       },
//     },
//     { $unwind: { path: "$locationData", preserveNullAndEmptyArrays: true } },
//     {
//       $addFields: {
//         customer: {
//           FirstName: "$customerData.FirstName",
//           LastName: "$customerData.LastName",
//         },
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
//           { "location.Address": { $regex: searchRegex } },
//           { "location.City": { $regex: searchRegex } },
//           { "location.State": { $regex: searchRegex } },
//           { "location.Country": { $regex: searchRegex } },
//           { "location.Zip": { $regex: searchRegex } },
//           { Title: { $regex: searchRegex } },
//           { QuoteNumber: { $regex: searchRegex } },
//         ],
//       };
//     });

//     basePipeline.push({
//       $match: {
//         $and: searchConditions,
//       },
//     });
//   }

//   const countPipeline = [...basePipeline, { $count: "totalCount" }];

//   const mainPipeline = [
//     ...basePipeline,
//     { $sort: sortOptions },
//     { $skip: pageNumber * pageSize },
//     { $limit: pageSize },
//     {
//       $project: {
//         CompanyId: 1,
//         CustomerId: 1,
//         QuoteId: 1,
//         LocationId: 1,
//         Title: 1,
//         QuoteNumber: 1,
//         status: 1,
//         customer: 1,
//         location: 1,
//         Total: 1,
//         createdAt: 1,
//         updatedAt: 1,
//       },
//     },
//   ];

//   const [countResult, quotes] = await Promise.all([
//     Quotes.aggregate(countPipeline),
//     Quotes.aggregate(mainPipeline),
//   ]);

//   const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

//   return {
//     statusCode: quotes.length > 0 ? 200 : 204,
//     data: quotes,
//     totalPages: Math.ceil(totalCount / pageSize),
//     currentPage: pageNumber,
//     message:
//       quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
//     totalCount,
//   };
// }
// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

const getQuotes = async (query, CompanyId) => {
  const pageSize = parseInt(query.pageSize) || 10;
  const pageNumber = parseInt(query.pageNumber) || 0;
  const search = query.search;

  const sortOrder = query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;
  const statusFilter = query.statusFilter?.toLowerCase() || "";

  let quoteSearchQuery = { CompanyId, IsDelete: false };
  if (statusFilter && statusFilter !== "all") {
    quoteSearchQuery.status = { $regex: statusFilter, $options: "i" };
  }

  const allowedSortFields = [
    "customerData.FirstName",
    "customerData.LastName",
    "locationData.Address",
    "locationData.City",
    "locationData.State",
    "locationData.Country",
    "locationData.Zip",
    "QuoteNumber",
    "Total",
    "updatedAt",
    "createdAt",
  ];

  const sortField = allowedSortFields.includes(query.sortField)
    ? query.sortField
    : "updatedAt";
  const collation = { locale: "en", strength: 2 };

  const basePipeline = [
    { $match: quoteSearchQuery },
    {
      $lookup: {
        from: "customers",
        localField: "CustomerId",
        foreignField: "CustomerId",
        as: "customerData",
      },
    },
    { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "locations",
        localField: "LocationId",
        foreignField: "LocationId",
        as: "locationData",
      },
    },
    { $unwind: { path: "$locationData", preserveNullAndEmptyArrays: true } },
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
        Total: {
          $toInt: { $round: [{ $toDouble: "$Total" }, 0] },
        },
      },
    },
  ];

  if (search) {
    const searchParts = search.split(" ").filter(Boolean);
    const searchConditions = searchParts.map((part) => {
      const searchRegex = new RegExp(part, "i");
      return {
        $or: [
          { "customerData.FirstName": { $regex: searchRegex } },
          { "customerData.LastName": { $regex: searchRegex } },
          { "locationData.Address": { $regex: searchRegex } },
          { "locationData.City": { $regex: searchRegex } },
          { "locationData.State": { $regex: searchRegex } },
          { "locationData.Country": { $regex: searchRegex } },
          { "locationData.Zip": { $regex: searchRegex } },
          { Title: { $regex: searchRegex } },
          { QuoteNumber: { $regex: searchRegex } },
        ],
      };
    });

    basePipeline.push({
      $match: {
        $and: searchConditions,
      },
    });
  }

  const sortOptions = {
    [sortField]: sortOrder,
  };

  basePipeline.push({ $sort: sortOptions });

  const countPipeline = [...basePipeline, { $count: "totalCount" }];

  const mainPipeline = [
    ...basePipeline,
    { $skip: pageNumber * pageSize },
    { $limit: pageSize },
    {
      $project: {
        CompanyId: 1,
        CustomerId: 1,
        QuoteId: 1,
        LocationId: 1,
        Title: 1,
        QuoteNumber: 1,
        status: 1,
        customer: 1,
        location: 1,
        Total: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  const [countResult, quotes] = await Promise.all([
    Quotes.aggregate(countPipeline),
    Quotes.aggregate(mainPipeline).collation(collation),
  ]);
  const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  return {
    statusCode: quotes.length > 0 ? 200 : 204,
    data: quotes,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: pageNumber,
    message:
      quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
    totalCount,
  };
};

router.get("/get_quotes/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const query = req.query;
    query.sortField = query.sortField || "updatedAt";
    query.sortOrder = query.sortOrder || "desc";
    const result = await getQuotes(query, CompanyId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

// Sorting should now work properly for customer.FirstName or any nested field!

// xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//--------------------------GET QUOTE DETAILS DATA-----------------------------------------

// const getQuoteDetails = async (QuoteId) => {
//   const quotes = await Quotes.aggregate([
//     {
//       $match: { QuoteId, IsDelete: false },
//     },
//     // Lookup for customers
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
//       $addFields: {
//         customer: {
//           FirstName: "$customerData.FirstName",
//           LastName: "$customerData.LastName",
//           PhoneNumber: "$customerData.PhoneNumber",
//           EmailAddress: "$customerData.EmailAddress",
//         },
//       },
//     },
//     // Lookup for locations
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
//       $addFields: {
//         location: {
//           Address: "$locationData.Address",
//           City: "$locationData.City",
//           State: "$locationData.State",
//           Country: "$locationData.Country",
//           Zip: "$locationData.Zip",
//         },
//       },
//     },
//     // Lookup for quotedetails
//     {
//       $lookup: {
//         from: "quotedetails",
//         let: { quoteId: "$QuoteId" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$QuoteId", "$$quoteId"] },
//                   { $eq: ["$IsDelete", false] },
//                 ],
//               },
//             },
//           },
//           {
//             $project: {
//               QuoteDetailId: 1,
//               Type: 1,
//               Name: 1,
//               Description: 1,
//               Unit: 1,
//               CostPerUnit: 1,
//               Hour: 1,
//               CostPerHour: 1,
//               Square: 1,
//               CostPerSquare: 1,
//               Total: 1,
//               Attachment: 1,
//             },
//           },
//         ],
//         as: "products",
//       },
//     },
//     {
//       $project: {
//         CompanyId: 1,
//         CustomerId: 1,
//         QuoteId: 1,
//         LocationId: 1,
//         status: 1,
//         Title: 1,
//         QuoteNumber: 1,
//         SubTotal: 1,
//         Discount: 1,
//         Tax: 1,
//         Total: 1,
//         CustomerMessage: 1,
//         ContractDisclaimer: 1,
//         Notes: 1,
//         Attachment: 1,
//         ChangeRequest: 1,
//         customer: 1,
//         location: 1,
//         createdAt: 1,
//         updatedAt: 1,
//         products: 1,
//       },
//     },
//   ]);

//   return {
//     statusCode: quotes.length > 0 ? 200 : 204,
//     data: quotes[0] || {},
//     message:
//       quotes.length > 0 ? "Quote retrieved successfully" : "Quote not found!",
//   };
// };

const getDropboxFileData = async (signatureRequestId) => {
  const dataUri = await getFileDataUri(signatureRequestId);
  const statusCode = await getSignatureRequestDetails(signatureRequestId);
  return { dataUri: dataUri?.fileDataUri?.dataUri, statusCode };
};

const getQuoteDetails = async (QuoteId) => {
  const quotes = await Quotes.aggregate([
    {
      $match: { QuoteId, IsDelete: false },
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
      $lookup: {
        from: "companies",
        localField: "CompanyId",
        foreignField: "companyId",
        as: "companyData",
      },
    },
    { $unwind: "$companyData" },
    {
      $addFields: {
        customer: {
          CustomerId: "$customerData.CustomerId",
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
      $addFields: {
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
        from: "quotedetails",
        let: { quoteId: "$QuoteId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$QuoteId", "$$quoteId"] },
                  { $eq: ["$IsDelete", false] },
                ],
              },
            },
          },
          {
            $project: {
              QuoteDetailId: 1,
              Type: 1,
              Name: 1,
              Description: 1,
              Unit: 1,
              CostPerUnit: 1,
              Hourly: 1,
              CostPerHour: 1,
              Square: 1,
              CostPerSquare: 1,
              Fixed: 1,
              CostPerFixed: 1,
              Total: 1,
              Attachment: 1,
              Notes: 1,
            },
          },
        ],
        as: "products",
      },
    },
    {
      $lookup: {
        from: "dropboxes",
        localField: "QuoteId",
        foreignField: "QuoteId",
        as: "dropboxFiles",
        pipeline: [
          {
            $match: { IsDeleted: false }, // Filter out deleted Dropbox files
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$dropboxFiles",
        preserveNullAndEmptyArrays: true, // Preserve quotes even if dropbox files are missing
      },
    },
    {
      $group: {
        _id: "$_id",
        CompanyId: { $first: "$CompanyId" },
        CustomerId: { $first: "$CustomerId" },
        QuoteId: { $first: "$QuoteId" },
        LocationId: { $first: "$LocationId" },
        status: { $first: "$status" },
        Title: { $first: "$Title" },
        QuoteNumber: { $first: "$QuoteNumber" },
        SubTotal: { $first: "$SubTotal" },
        Discount: { $first: "$Discount" },
        Tax: { $first: "$Tax" },
        Total: { $first: "$Total" },
        CustomerMessage: { $first: "$CustomerMessage" },
        ContractDisclaimer: { $first: "$ContractDisclaimer" },
        Notes: { $first: "$Notes" },
        Attachment: { $first: "$Attachment" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        ChangeRequest: { $first: "$ChangeRequest" },
        customer: { $first: "$customer" },
        location: { $first: "$location" },
        products: { $first: "$products" },
        dropboxFiles: { $push: "$dropboxFiles" },
        companyData: { $first: "$companyData" },
      },
    },
    {
      $project: {
        CompanyId: 1,
        CustomerId: 1,
        QuoteId: 1,
        LocationId: 1,
        status: 1,
        Title: 1,
        QuoteNumber: 1,
        SubTotal: 1,
        Discount: 1,
        Tax: 1,
        Total: 1,
        CustomerMessage: 1,
        ContractDisclaimer: 1,
        Notes: 1,
        Attachment: 1,
        createdAt: 1,
        updatedAt: 1,
        ChangeRequest: 1,
        customer: 1,
        location: 1,
        products: 1,
        dropboxFiles: 1,
        companyData: 1,
      },
    },
  ]);

  if (quotes.length === 0) {
    return {
      statusCode: 404,
      data: {},
      message: "Quote not found!",
    };
  }

  const dropboxFiles = await Promise.all(
    quotes[0].dropboxFiles.map(async (dropboxFile) => {
      const { dataUri, statusCode } = await getDropboxFileData(
        dropboxFile.signatureRequestId
      );
      return { ...dropboxFile, dataUri, statusCode };
    })
  );
  quotes[0].dropboxFiles = dropboxFiles;

  return {
    statusCode: 200,
    data: quotes[0],
    message: "Quote retrieved successfully",
  };
};

router.get("/quote_details/:QuoteId", verifyLoginToken, async (req, res) => {
  try {
    const { QuoteId } = req.params;
    const result = await getQuoteDetails(QuoteId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//---------------------------GET MAX NUMBER-------------------------------------

// Find last  Quotes-Number in Company
const getMaxQuoteNumber = async (CompanyId) => {
  const totalQuotes = await Quotes.find({
    CompanyId,
    IsDelete: false,
  }).select("QuoteNumber");

  const quoteNumbers = totalQuotes.map((quote) =>
    parseInt(quote.QuoteNumber, 10)
  );
  const maxQuoteNumber = quoteNumbers.length ? Math.max(...quoteNumbers) : 0;

  return {
    statusCode: 200,
    quoteNumber: maxQuoteNumber,
  };
};
router.get("/get_number/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;

    const result = await getMaxQuoteNumber(CompanyId);

    res.status(result.statusCode).json({
      statusCode: result.statusCode,
      quoteNumber: result.quoteNumber,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//----------------------------DELETE QUOTE DATA--------------------------------------

const deleteQuoteAndRelatedData = async (QuoteId, DeleteReason, req) => {
  const findContract = await Contract.findOne({ QuoteId, IsDelete: false });
  if (findContract) {
    return {
      statusCode: 202,
      message:
        "You can't delete the quote; it's already associated with a contract.",
    };
  }

  const updatedQuote = await Quotes.findOneAndUpdate(
    { QuoteId, IsDelete: false },
    { $set: { IsDelete: true, DeleteReason } },
    { new: true }
  );

  const updatedQuoteDetails = await QuoteDetail.updateMany(
    { QuoteId, IsDelete: false },
    { $set: { IsDelete: true } }
  );

  const updatedNotifications = await Notification.updateMany(
    { QuoteId },
    { $set: { IsDelete: true } }
  );

  if (
    updatedQuote ||
    updatedQuoteDetails.modifiedCount > 0 ||
    updatedNotifications.modifiedCount > 0
  ) {
    const quoteId = updatedQuote ? updatedQuote.QuoteId : QuoteId;
    const quoteNumber = updatedQuote ? updatedQuote.QuoteNumber : "Unknown";
    const title = updatedQuote ? updatedQuote.Title : "Unknown";

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: req.CompanyId,
      Action: "DELETE",
      Entity: "Quote",
      EntityId: quoteId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Deleted a quote #${quoteNumber} ${title}`,
      },
      Reason: DeleteReason,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      message: "Quote deleted successfully!",
    };
  } else {
    return {
      statusCode: 404,
      message: "Quote not found or deletion failed",
    };
  }
};
router.delete("/:QuoteId", verifyLoginToken, async (req, res) => {
  try {
    const { QuoteId } = req.params;
    const { DeleteReason } = req.body;
    const result = await deleteQuoteAndRelatedData(QuoteId, DeleteReason, req);

    res.status(result.statusCode).json({
      statusCode: result.statusCode,
      message: result.message,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

// const deleteQuoteAndRelatedData = async (QuoteId, DeleteReason, req) => {
//   const findContract = await Contract.findOne({ QuoteId, IsDelete: false });
//   if (findContract) {
//     return {
//       statusCode: 202,
//       message:
//         "You can't delete the quote; it's already associated with a contract.",
//     };
//   }

//   const dropboxEntry = await Dropbox.findOne({ QuoteId });
//   let IsDeleted = false;

//   if (dropboxEntry && dropboxEntry.signatureRequestId) {
//     const signatureRequestResponse = await removeSignatureRequest(
//       dropboxEntry.signatureRequestId
//     );
//     if (signatureRequestResponse.statusCode === 200) {
//       IsDeleted = true;
//     }
//   }

//   const updatedQuote = await Quotes.findOneAndUpdate(
//     { QuoteId, IsDelete: false },
//     { $set: { IsDelete: true, DeleteReason } },
//     { new: true }
//   );

//   const updatedQuoteDetails = await QuoteDetail.updateMany(
//     { QuoteId, IsDelete: false },
//     { $set: { IsDelete: true } }
//   );

//   const updatedNotifications = await Notification.updateMany(
//     { QuoteId },
//     { $set: { IsDelete: true } }
//   );

//   if (
//     updatedQuote ||
//     updatedQuoteDetails.modifiedCount > 0 ||
//     updatedNotifications.modifiedCount > 0
//   ) {
//     const quoteId = updatedQuote ? updatedQuote.QuoteId : QuoteId;
//     const quoteNumber = updatedQuote ? updatedQuote.QuoteNumber : "Unknown";
//     const title = updatedQuote ? updatedQuote.Title : "Unknown";

//     await Activities.create({
//       ActivityId: `${Date.now()}`,
//       CompanyId: req.CompanyId,
//       Action: "DELETE",
//       Entity: "Quote",
//       EntityId: quoteId,
//       ActivityBy: req.Role,
//       ActivityByUsername: req.userName,
//       Activity: {
//         description: `Deleted a quote #${quoteNumber} ${title}`,
//       },
//       Reason: DeleteReason,
//       createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//       updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//     });

//     if (IsDeleted) {
//       const signatureRequest = await Dropbox.findOne({
//         signatureRequestId: dropboxEntry.signatureRequestId,
//       });

//       const data = {
//         CompanyId: signatureRequest.CompanyId,
//         QuoteId: signatureRequest.QuoteId,
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

//       if (data.QuoteId) {
//         activityData.Entity = "Dropbox Signature for Quote";
//         activityData.EntityId = data.QuoteId;
//         activityData.Activity.description = `Quote Signature Request canceled for "${signerName}"`;
//         activityData.Reason = DeleteReason;
//       } else {
//         throw new Error("Delete activity cannot be logged.");
//       }
//       await Activities.create(activityData);
//     }

//     return {
//       statusCode: 200,
//       message: "Quote deleted successfully!",
//     };
//   } else {
//     return {
//       statusCode: 404,
//       message: "Quote not found or deletion failed",
//     };
//   }
// };

router.delete("/:QuoteId", verifyLoginToken, async (req, res) => {
  try {
    const { QuoteId } = req.params;
    const { DeleteReason } = req.body;
    const result = await deleteQuoteAndRelatedData(QuoteId, DeleteReason, req);

    res.status(result.statusCode).json({
      statusCode: result.statusCode,
      message: result.message,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------PUT QUOTE DATA------------------------------------

// const updateQuote = async (QuoteId, quoteData, details, req) => {
//   quoteData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

//   if (quoteData.status === "Approved") {
//     quoteData.IsApprovedByCustomer = true;
//   } else {
//     quoteData.IsApprovedByCustomer = false;
//   }

//   const updatedQuote = await Quotes.findOneAndUpdate(
//     { QuoteId },
//     { $set: quoteData },
//     { new: true }
//   );

//   if (!updatedQuote) {
//     return {
//       statusCode: 404,
//       message: "Quote not found!",
//     };
//   }

//   // 5206 code start: Line items
//   if (updatedQuote) {
//     const existingDetails = await QuoteDetail.find({
//       QuoteId,
//       IsDelete: false,
//     });
//     const incomingDetailIds = details
//       .map((detail) => detail.QuoteDetailId)
//       .filter(Boolean);
//     const detailsToDelete = existingDetails.filter(
//       (detail) => !incomingDetailIds.includes(detail.QuoteDetailId)
//     );

//     const deletePromises = detailsToDelete.map((detail) =>
//       QuoteDetail.findOneAndDelete({ QuoteDetailId: detail.QuoteDetailId })
//     );
//     await Promise.all(deletePromises);
//   }
//   // 5206 code end: Line items

//   if (Array.isArray(details) && details.length > 0) {
//     const detailPromises = details.map(async (detail, index) => {
//       detail.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

//       if (!detail.QuoteDetailId) {
//         const newQuoteDetail = {
//           ...detail,
//           QuoteId: updatedQuote.QuoteId,
//           QuoteDetailId: `${Date.now()}-${index}`,
//           createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
//         };

//         return await QuoteDetail.create(newQuoteDetail);
//       } else {
//         const updatedDetail = await QuoteDetail.findOneAndUpdate(
//           { QuoteDetailId: detail.QuoteDetailId, IsDelete: false },
//           { $set: detail },
//           { new: true }
//         );
//         if (!updatedDetail) {
//           return {
//             statusCode: 404,
//             message: "QuoteItem not found!",
//           };
//         }
//         return updatedDetail;
//       }
//     });

//     await Promise.all(detailPromises);
//   }

//   const activityDescription = updatedQuote.IsApprovedByCustomer
//     ? `Customer approved the quote #${updatedQuote.QuoteNumber} ${updatedQuote.Title}`
//     : `Updated a quote #${updatedQuote.QuoteNumber} ${updatedQuote.Title}`;
//   const CompanyId =
//     req.Role === "customer" ? req.tokenData.CompanyId : req.CompanyId;

//   await Activities.create({
//     ActivityId: `${Date.now()}`,
//     CompanyId: CompanyId,
//     Action: "UPDATE",
//     Entity: "Quote",
//     EntityId: updatedQuote.QuoteId,
//     ActivityBy: req.Role,
//     ActivityByUsername: req.userName,
//     Activity: {
//       description: activityDescription,
//     },
//     Reason: updatedQuote.IsApprovedByCustomer
//       ? "Quote approved"
//       : "Quote updating",
//     createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//     updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//   });

//   const createQuoteNotification = async (updatedQuote) => {
//     if (updatedQuote.IsApprovedByCustomer) {
//       await addNotification({
//         CompanyId: updatedQuote.CompanyId,
//         CustomerId: updatedQuote.CustomerId,
//         QuoteId: updatedQuote.QuoteId,
//         CreatedBy: "Customer",
//       });
//     }
//   };
//   await createQuoteNotification(updatedQuote);

//   return {
//     statusCode: 200,
//     message: "Quote updated successfully",
//     data: updatedQuote,
//   };
// };
// router.put("/:QuoteId", verifyLoginToken, async (req, res) => {
//   try {
//     const { QuoteId } = req.params;
//     const { details = [], ...quoteData } = req.body;

//     const result = await updateQuote(QuoteId, quoteData, details, req);

//     res.status(result.statusCode).json(result);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({
//       statusCode: 500,
//       message: "Something went wrong, please try later!",
//     });
//   }
// });

const updateQuote = async (QuoteId, quoteData, details, req) => {
  quoteData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  const updatedQuote = await Quotes.findOneAndUpdate(
    { QuoteId },
    { $set: quoteData },
    { new: true }
  );

  if (!updatedQuote) {
    return {
      statusCode: 404,
      message: "Quote not found!",
    };
  }

  if (updatedQuote) {
    const existingDetails = await QuoteDetail.find({
      QuoteId,
      IsDelete: false,
    });
    const incomingDetailIds = details
      .map((detail) => detail.QuoteDetailId)
      .filter(Boolean);
    const detailsToDelete = existingDetails.filter(
      (detail) => !incomingDetailIds.includes(detail.QuoteDetailId)
    );

    const deletePromises = detailsToDelete.map((detail) =>
      QuoteDetail.findOneAndDelete({ QuoteDetailId: detail.QuoteDetailId })
    );
    await Promise.all(deletePromises);
  }

  if (Array.isArray(details) && details.length > 0) {
    const detailPromises = details.map(async (detail, index) => {
      detail.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

      if (!detail.QuoteDetailId) {
        const newQuoteDetail = {
          ...detail,
          QuoteId: updatedQuote.QuoteId,
          QuoteDetailId: `${Date.now()}-${index}`,
          createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        };

        return await QuoteDetail.create(newQuoteDetail);
      } else {
        const updatedDetail = await QuoteDetail.findOneAndUpdate(
          { QuoteDetailId: detail.QuoteDetailId, IsDelete: false },
          { $set: detail },
          { new: true }
        );
        if (!updatedDetail) {
          return {
            statusCode: 404,
            message: "QuoteItem not found!",
          };
        }
        return updatedDetail;
      }
    });

    await Promise.all(detailPromises);
  }

  const activityDescription = `Updated a quote #${updatedQuote.QuoteNumber} ${updatedQuote.Title}`;
  const CompanyId =
    req.Role === "customer" ? req.tokenData.CompanyId : req.CompanyId;

  await Activities.create({
    ActivityId: `${Date.now()}`,
    CompanyId: CompanyId,
    Action: "UPDATE",
    Entity: "Quote",
    EntityId: updatedQuote.QuoteId,
    ActivityBy: req.Role,
    ActivityByUsername: req.userName,
    Activity: {
      description: activityDescription,
    },
    Reason: "Quote updating",
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  });

  return {
    statusCode: 200,
    message: "Quote updated successfully",
    data: updatedQuote,
  };
};

router.put("/:QuoteId", verifyLoginToken, async (req, res) => {
  try {
    const { QuoteId } = req.params;
    const { details = [], ...quoteData } = req.body;

    const result = await updateQuote(QuoteId, quoteData, details, req);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

const approveQuote = async (QuoteId, status, req) => {
  const updatedQuote = await Quotes.findOneAndUpdate(
    { QuoteId },
    {
      $set: {
        status: status,
        updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      },
    },
    { new: true }
  );

  if (!updatedQuote) {
    return {
      statusCode: 404,
      message: "Quote not found!",
    };
  }

  const activityDescription = `Customer approved the quote #${updatedQuote.QuoteNumber} ${updatedQuote.Title}`;
  const CompanyId =
    req.Role === "customer" ? req.tokenData.CompanyId : req.CompanyId;

  await Activities.create({
    ActivityId: `${Date.now()}`,
    CompanyId: CompanyId,
    Action: "APPROVE",
    Entity: "Quote",
    EntityId: updatedQuote.QuoteId,
    ActivityBy: req.Role,
    ActivityByUsername: req.userName,
    Activity: {
      description: activityDescription,
    },
    Reason: "Quote approved",
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  });

  await addNotification({
    CompanyId: updatedQuote.CompanyId,
    CustomerId: updatedQuote.CustomerId,
    QuoteId: updatedQuote.QuoteId,
    AddedAt: req.body.AddedAt,
    CreatedBy: "Customer",
  });

  return {
    statusCode: 200,
    message: "Quote status updated successfully",
    data: updatedQuote,
  };
};

router.patch("/approve/:QuoteId", verifyLoginToken, async (req, res) => {
  try {
    const { QuoteId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        statusCode: 400,
        message: "Status is required",
      });
    }

    const result = await approveQuote(QuoteId, status, req);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------GET SHCEDULE DATA------------------------------------------

// For Shedule in Company
const getScheduleData = async (CompanyId) => {
  const data = await Quotes.aggregate([
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
        as: "customerData",
      },
    },
    {
      $unwind: {
        path: "$customerData",
        preserveNullAndEmptyArrays: true,
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
    {
      $unwind: {
        path: "$locationData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        Title: 1,
        QuoteNumber: 1,
        CompanyId: 1,
        QuoteId: 1,
        CustomerId: 1,
        LocationId: 1,
        createdAt: 1,
        updatedAt: 1,
        FirstName: "$customerData.FirstName",
        LastName: "$customerData.LastName",
        Address: "$locationData.Address",
        City: "$locationData.City",
        State: "$locationData.State",
        Zip: "$locationData.Zip",
        Country: "$locationData.Country",
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
router.get("/shedule/:CompanyId", verifyLoginToken, async (req, res) => {
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

//-------------------------GET QUOTE DATA----------------------------------------

// Get ALL Quotes in (Superadmin)
const gettableQuote = async (CompanyId, query) => {
  const {
    search,
    pageSize = 10,
    pageNumber = 0,
    sortField = "updatedAt",
    sortOrder = "desc",
  } = query;

  const limit = parseInt(pageSize, 10) || 10;
  const skip = parseInt(pageNumber, 10) * limit || 0;

  let quoteSearchQuery = { CompanyId, IsDelete: false };
  if (search) {
    const searchRegex = new RegExp(search, "i");
    quoteSearchQuery.$or = [
      { Title: { $regex: searchRegex } },
      { Status: { $regex: searchRegex } },
      { "customer.FirstName": { $regex: searchRegex } },
      { "customer.LastName": { $regex: searchRegex } },
    ];
  }

  let sortOptions = {};
  if (sortField) {
    sortOptions[sortField] = sortOrder === "desc" ? -1 : 1;
  }
  const quotes = await Quotes.aggregate([
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
    { $match: quoteSearchQuery },
    { $sort: sortOptions },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        CompanyId: 1,
        CustomerId: 1,
        QuoteId: 1,
        LocationId: 1,
        Title: 1,
        Status: 1,
        QuoteNumber: 1,
        customer: 1,
        location: 1,
        Total: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  const totalCountArray = await Quotes.aggregate([
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
    { $match: quoteSearchQuery },
    { $count: "total" },
  ]);

  const total = totalCountArray.length > 0 ? totalCountArray[0].total : 0;
  const totalPages = Math.ceil(total / limit);

  return {
    statusCode: quotes.length > 0 ? 200 : 204,
    data: {
      visits: quotes,
      totalPages,
      currentPage: pageNumber,
    },
    message:
      quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
  };
};
router.get("/", verifyLoginToken, async (req, res) => {
  try {
    const result = await gettableQuote(req.query.CompanyId, req.query);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//---------------------GET DETAILS DATA------------------------------------------

// For Customer show Assigned Quote in Detail (Customer)
const fetchQuoteDetails = async (QuoteId, sortField, sortOrder) => {
  const quotesSearchQuery = { QuoteId, IsDelete: false };

  const sortOptions = {};
  if (sortField) {
    sortOptions[sortField] = sortOrder === "desc" ? -1 : 1;
  }

  const quotes = await Quotes.aggregate([
    {
      $match: quotesSearchQuery,
    },
    {
      $lookup: {
        from: "customers",
        localField: "CustomerId",
        foreignField: "CustomerId",
        as: "customerDetails",
      },
    },
    {
      $unwind: {
        path: "$customerDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "locations",
        let: { quoteLocationId: "$LocationId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$LocationId", "$$quoteLocationId"] },
            },
          },
        ],
        as: "propertyDetails",
      },
    },
    {
      $unwind: {
        path: "$propertyDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "quotedetails",
        localField: "QuoteId",
        foreignField: "QuoteId",
        as: "products",
      },
    },
    {
      $addFields: {
        property: "$propertyDetails",
        FirstName: "$customerDetails.FirstName",
        LastName: "$customerDetails.LastName",
        PhoneNumber: "$customerDetails.PhoneNumber",
      },
    },
    {
      $unset: ["propertyDetails", "customerDetails"],
    },
    { $sort: sortOptions },
  ]);

  return {
    statusCode: quotes.length > 0 ? 200 : 204,
    message:
      quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
    data: quotes,
  };
};
router.get("/detail/:QuoteId", verifyLoginToken, async function (req, res) {
  const { QuoteId } = req.params;
  const sortField = req.query.sortField || "updatedAt";
  const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

  try {
    const result = await fetchQuoteDetails(QuoteId, sortField, sortOrder);

    res.status(result.statusCode).json({
      statusCode: result.statusCode,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//------------------------GET COMPANIES DATA----------------------------------------

// Get Companyname for show in Quote Table (Superadmin)
const getCompanies = async () => {
  const data = await Company.find({ IsDelete: false });
  const companies = data.map((item) => ({
    admin: item.companyName,
  }));

  return {
    statusCode: 200,
    data: companies,
  };
};
router.get("/get_companies", verifyLoginToken, async (req, res) => {
  try {
    const result = await getCompanies();
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//----------------------GET QUOTE DATA-------------------------------------------

//get quote for for customer detail page
const getQuotesByCustomer = async (CompanyId, CustomerId) => {
  const quoteSearchQuery = {
    CompanyId,
    CustomerId,
    IsDelete: false,
  };

  const quotes = await Quotes.aggregate([
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
    { $match: quoteSearchQuery },
    { $sort: { updatedAt: -1 } },
    {
      $project: {
        CompanyId: 1,
        CustomerId: 1,
        QuoteId: 1,
        LocationId: 1,
        Title: 1,
        QuoteNumber: 1,
        status: 1,
        customer: 1,
        location: 1,
        Total: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return {
    statusCode: quotes.length > 0 ? 200 : 204,
    data: quotes.length > 0 ? quotes : null,
    message: quotes.length > 0 ? null : "No quotes found",
  };
};
router.get(
  "/get_quotes_customer/:CompanyId/:CustomerId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { CompanyId, CustomerId } = req.params;

      const result = await getQuotesByCustomer(CompanyId, CustomerId);

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

//-------------------------GET IN CUSTOMER PROPERTIES PAGE-------------------------------------------

//get quote for for customer detail page property vise
const getQuotesByCustomerAndLocation = async (
  CompanyId,
  CustomerId,
  LocationId
) => {
  const quoteSearchQuery = {
    CompanyId,
    CustomerId,
    LocationId,
    IsDelete: false,
  };

  const quotes = await Quotes.aggregate([
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
    { $match: quoteSearchQuery },
    { $sort: { updatedAt: -1 } },
    {
      $project: {
        CompanyId: 1,
        CustomerId: 1,
        QuoteId: 1,
        LocationId: 1,
        Title: 1,
        QuoteNumber: 1,
        status: 1,
        customer: 1,
        location: 1,
        Total: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return {
    statusCode: quotes.length > 0 ? 200 : 204,
    data: quotes.length > 0 ? quotes : null,
    message: quotes.length > 0 ? null : "No quotes found",
  };
};
router.get(
  "/get_quotes_customer_property/:CompanyId/:CustomerId/:LocationId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { CompanyId, CustomerId, LocationId } = req.params;

      const result = await getQuotesByCustomerAndLocation(
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

//---------------------------SEND MAIL-------------------------------------

// send qoute mail to customer
const sendEmailWithConfig = async (companyId, data, IsSendpdf) => {
  try {
    const { CustomerId, QuoteId } = data;
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
        const response = await getQuoteDetails(QuoteId);
        if (!response || !response.data) {
          return { statusCode: 404, message: "Quote not found" };
        }

        const html = await quotePdf(response.data);
        fileName = await generateAndSavePdf(html);
        // return { statusCode: 200, message: "generate PDF", fileName };
      } catch (error) {
        console.error("Error generating PDF:", error);
        return { statusCode: 500, message: "Failed to generate PDF" };
      }
    }

    const defaultSubject = "Your Custom Quote from Cloud Job Manager";
    const defaultBody = `
    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); border: 1px solid #e88c44;">
      <tr>
        <td style="padding: 30px 0; text-align: center; background-color: #063164; border-top-left-radius: 12px; border-top-right-radius: 12px;">
          <div style="display: inline-block; padding: 15px; background-color: white; border-radius: 8px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);">
            <img src="https://app.cloudjobmanager.com/cdn/upload/20250213103016_site-logo2.png" alt="CloudJobManager Logo" style="width: 180px; max-width: 100%; display: block; margin: auto;" />
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 40px;font-family: 'Arial', sans-serif; color: #555;text-align:center;">
          <h2 style="font-size: 24px; color: #003366; text-align: center; font-weight: 700;">Your Custom Quote is Ready!</h2>
          <p style="font-size: 18px; color: #555; line-height: 1.7; text-align: center; font-weight: 400;">Dear <strong style="color: #003366;">${
            findCustomer.FirstName
          } ${findCustomer.LastName}</strong>,</p>
          <p style="font-size: 16px; color: #555; line-height: 1.6;">Thank you for the opportunity to receive a quote for <strong style="color: #003366;">${
            data.Title
          }</strong> with a total amount of <strong>$${data.Total}</strong>.</p>

          <div style="padding: 15px; text-align: center;">
            <h3 style="font-size: 21px; color: #e88c44; font-weight: 700;">Total Amount: <strong style="font-size: 21px; color: #003366;">$${
              data.Total
            }</strong></h3>
            <p style="font-size: 16px; color: #718096; font-weight: 400;">Quote Date: <strong>${moment(
              data.createdAt
            ).format("DD-MM-YYYY")}</strong></p>
          </div>

         

          <p style="font-size: 16px; color: #555;">If you have any questions, please reach out to <a href="mailto:${
            findCompany.EmailAddress
          }" style="color: #003366; text-decoration: none; font-weight: 600;">${
      findCompany.EmailAddress
    }</a>.</p>

          <p style="font-size: 16px; color: #555;">Best regards,<br />
            <strong style="color: #003366; font-weight: 700;">${
              findCompany.companyName
            }</strong><br />
            <span style="font-size: 14px; color: #718096;">${
              findCompany.EmailAddress
            }</span>
          </p>
        </td>
      </tr>
    </table>
  `;

    const QuoteData = [
      {
        FirstName: findCustomer.FirstName || "",
        LastName: findCustomer.LastName || "",
        EmailAddress: findCustomer.EmailAddress || "",
        PhoneNumber: findCustomer.PhoneNumber || "",
        companyName: findCompany.companyName || "",
        EmailAddress: findCompany.EmailAddress || "",
        companyPhoneNumber: findCompany.phoneNumber || "",
        Title: data.Title || "",
        QuoteNumber: data.QuoteNumber || "",
        SubTotal: data.SubTotal || "",
        Discount: data.Discount || "",
        Tax: data.Tax || "",
        Total: data.Total || "",
      },
    ];

    const emailStatus = await handleTemplate(
      "Quote",
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
    console.error("Error sending email:", error);
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
    const result = await sendEmailWithConfig(companyId, data, IsSendpdf);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

router.post("/quotepdf/:QuoteId", async (req, res) => {
  try {
    const { QuoteId } = req.params;
    if (!QuoteId) {
      return res
        .status(400)
        .json({ statusCode: 400, message: "QuoteId is required" });
    }

    const response = await getQuoteDetails(QuoteId);
    if (!response || !response.data) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Quote not found" });
    }

    const html = await quotePdf(response.data);
    const fileName = await generateAndSavePdf(html);

    return res.status(200).json({ statusCode: 200, fileName });
  } catch (error) {
    console.error("Error generating quote PDF:", error);

    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later.",
    });
  }
});
module.exports = router;

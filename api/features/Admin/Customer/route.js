var express = require("express");
var router = express.Router();
var Customer = require("./model");
var Company = require("../Company/model");
var Quote = require("../Quote/model");
var QuoteDetail = require("../Quote/QuoteDetail/model");
var Location = require("../Location/model");
var Contract = require("../Contract/model");
var Invoice = require("../Invoice/model");
var Worker = require("../Worker/model");
var Visits = require("../Contract/Visits/model");
const CompanyMail = require("../../Superadmin/CompanyMail/model");
const MailConfig = require("../../Superadmin/MailConfiguration/model");
const RequestChange = require("../RequestChange/model");
var SuperAdmin = require("../../Superadmin/SignupLogin/model");
const moment = require("moment");
const {
  encryptData,
  decryptData,
  verifyLoginToken,
} = require("../../../authentication");
const emailService = require("../../emailService");
const { addNotification } = require("../../Notification/notification");
const Notification = require("../../Notification/model");
const Activities = require("../ActivitiesModel");
const { createResetToken } = require("../ResetPassword/authentication");
const { handleTemplate } = require("../Template/route");
const { customerValidationSchema, validateBody } = require("./validation");
const AppUrl = process.env.REACT_APP;
const secretKey = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");

const createCustomer = async (req, customerData) => {
  const { PhoneNumber, FirstName, LastName, EmailAddress, CompanyId, City } =
    customerData;

  const customerExists = await Customer.findOne({
    EmailAddress,
    IsDelete: false,
  });
  const companyExists = await Company.findOne({
    EmailAddress: EmailAddress,
    IsDelete: false,
  });
  const workerExists = await Worker.findOne({
    EmailAddress,
    IsDelete: false,
  });
  const superAdmin = await SuperAdmin.findOne({
    EmailAddress: EmailAddress,
    IsDelete: false,
  });

  if (customerExists || companyExists || workerExists || superAdmin) {
    return {
      statusCode: 403,
      message: "E-Mail Already Exist!",
    };
  }

  const timestamp = new Date();
  const customerId = `${moment(timestamp).format("HHMMYYYYssDDmm")}`;
  let newLocation;

  if (City) {
    const locationId = `${moment(timestamp).format("HHMMYYYYDDssmm")}`;
    newLocation = {
      LocationId: locationId,
      CustomerId: customerId,
      CompanyId,
      Address: customerData.Address || "",
      City: City || "",
      State: customerData.State || "",
      Zip: customerData.Zip || "",
      Country: customerData.Country || "",
      createdAt: moment(timestamp).format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(timestamp).format("YYYY-MM-DD HH:mm:ss"),
    };
    await Location.create(newLocation);
  }

  if (
    !PhoneNumber ||
    typeof PhoneNumber !== "string" ||
    PhoneNumber.length < 4
  ) {
    return { statusCode: 400, message: "Invalid mobile number" };
  }

  const lastFourDigits = PhoneNumber.slice(-4);
  const generatedPassword = `${FirstName}@${lastFourDigits}`;
  const encryptedPassword = encryptData(generatedPassword);

  const newCustomerData = {
    ...customerData,
    CustomerId: customerId,
    Password: encryptedPassword,
    createdAt: moment(timestamp).format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment(timestamp).format("YYYY-MM-DD HH:mm:ss"),
  };

  const newCustomer = await Customer.create(newCustomerData);

  await Activities.create({
    ActivityId: `${Date.now()}`,
    CompanyId,
    Action: "CREATE",
    Entity: "Customer",
    EntityId: newCustomer.CustomerId,
    ActivityBy: req.Role,
    ActivityByUsername: req.userName,
    Activity: {
      description: `Created a new customer: ${FirstName} ${LastName}`,
    },
    Reason: "Customer creation",
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  });

  //5206 "code start: customer notification"
  await addNotification({
    CompanyId,
    CustomerId: customerId,
    CreatedBy: customerData.role,
    AddedAt: customerData.AddedAt,
  });

  await sendWelcomeEmailToCustomer(customerId);
  if (newCustomer) {
    return {
      statusCode: 201,
      message: "Customer Created!",
      data: {
        ...newCustomer.toObject(),
        location: [newLocation],
      },
    };
  } else {
    return {
      statusCode: 404,
      message: "Customer creation failed!",
    };
  }
};

router.post(
  "/",
  verifyLoginToken,
  validateBody(customerValidationSchema),
  async (req, res) => {
    try {
      const result = await createCustomer(req, req.body);
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

//-------------------------GET CUSTOMER DASHBOARD--------------------------------------

// const getCustomerDashboardCounts = async (CustomerId, CompanyId) => {
//   const pipeline = [
//     // Lookup for Quotes
//     {
//       $lookup: {
//         from: "quotes",
//         let: { customerId: "$CustomerId", companyId: "$CompanyId" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$CustomerId", "$$customerId"] },
//                   { $eq: ["$CompanyId", "$$companyId"] },
//                   { $eq: ["$IsDelete", false] },
//                   { $ne: ["$status", "Draft"] }
//                 ]
//               }
//             }
//           },
//           { $count: "quoteCount" }
//         ],
//         as: "quotes"
//       }
//     },
//     // Lookup for Contracts
//     {
//       $lookup: {
//         from: "contracts",
//         let: { customerId: "$CustomerId", companyId: "$CompanyId" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$CustomerId", "$$customerId"] },
//                   { $eq: ["$CompanyId", "$$companyId"] },
//                   { $eq: ["$IsDelete", false] },
//                   { $ne: ["$Status", "Unscheduled"] }
//                 ]
//               }
//             }
//           },
//           { $count: "contractCount" }
//         ],
//         as: "contracts"
//       }
//     },
//     // Lookup for Invoices
//     {
//       $lookup: {
//         from: "invoices",
//         let: { customerId: "$CustomerId", companyId: "$CompanyId" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$CustomerId", "$$customerId"] },
//                   { $eq: ["$CompanyId", "$$companyId"] },
//                   { $eq: ["$IsDelete", false] }
//                 ]
//               }
//             }
//           },
//           { $count: "invoiceCount" }
//         ],
//         as: "invoices"
//       }
//     },
//     // Lookup for Visits
//     {
//       $lookup: {
//         from: "visits",
//         let: { customerId: "$CustomerId", companyId: "$CompanyId" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$CustomerId", "$$customerId"] },
//                   { $eq: ["$CompanyId", "$$companyId"] },
//                   { $eq: ["$IsDelete", false] }
//                 ]
//               }
//             }
//           },
//           { $count: "visitCount" }
//         ],
//         as: "visits"
//       }
//     },
//     {
//       $project: {
//         quotes: { $arrayElemAt: ["$quotes.quoteCount", 0] },
//         contracts: { $arrayElemAt: ["$contracts.contractCount", 0] },
//         invoices: { $arrayElemAt: ["$invoices.invoiceCount", 0] },
//         visits: { $arrayElemAt: ["$visits.visitCount", 0] }
//       }
//     }
//   ];

//   const result = await Customer.aggregate(pipeline);

//   return {
//     quotes: result[0]?.quotes || 0,
//     contracts: result[0]?.contracts || 0,
//     invoices: result[0]?.invoices || 0,
//     visits: result[0]?.visits || 0,
//   };
// };
const getCustomerDashboardCounts = async (CustomerId, CompanyId) => {
  const pipeline = [
    {
      $match: {
        CustomerId, // Match the CustomerId
        CompanyId, // Match the CompanyId
      },
    },
    // Lookup for Quotes
    {
      $lookup: {
        from: "quotes",
        let: { customerId: "$CustomerId", companyId: "$CompanyId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$CustomerId", "$$customerId"] },
                  { $eq: ["$CompanyId", "$$companyId"] },
                  { $eq: ["$IsDelete", false] },
                  { $ne: ["$status", "Draft"] },
                ],
              },
            },
          },
        ],
        as: "quotes",
      },
    },
    {
      $addFields: { quoteCount: { $size: "$quotes" } },
    },
    // Lookup for Contracts
    {
      $lookup: {
        from: "contracts",
        let: { customerId: "$CustomerId", companyId: "$CompanyId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$CustomerId", "$$customerId"] },
                  { $eq: ["$CompanyId", "$$companyId"] },
                  { $eq: ["$IsDelete", false] },
                  { $ne: ["$Status", "Unscheduled"] },
                ],
              },
            },
          },
          // {
          //   $lookup: {
          //     from: "invoices",
          //     let: { contractId: "$ContractId" },
          //     pipeline: [
          //       {
          //         $match: {
          //           $expr: {
          //             $and: [
          //               { $eq: ["$ContractId", "$$contractId"] },
          //               { $eq: ["$IsDelete", false] },
          //             ],
          //           },
          //         },
          //       },
          //     ],
          //     as: "relatedInvoices",
          //   },
          // },
          // {
          //   $match: {
          //     $expr: { $eq: [{ $size: "$relatedInvoices" }, 0] },
          //   },
          // },
        ],
        as: "contracts",
      },
    },
    {
      $addFields: { contractCount: { $size: "$contracts" } },
    },
    // Lookup for Invoices
    {
      $lookup: {
        from: "invoices",
        let: { customerId: "$CustomerId", companyId: "$CompanyId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$CustomerId", "$$customerId"] },
                  { $eq: ["$CompanyId", "$$companyId"] },
                  { $eq: ["$IsDelete", false] },
                ],
              },
            },
          },
        ],
        as: "invoices",
      },
    },
    {
      $addFields: { invoiceCount: { $size: "$invoices" } },
    },
    // Lookup for Visits
    {
      $lookup: {
        from: "visits",
        let: { customerId: "$CustomerId", companyId: "$CompanyId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$CustomerId", "$$customerId"] },
                  { $eq: ["$CompanyId", "$$companyId"] },
                  { $eq: ["$IsDelete", false] },
                ],
              },
            },
          },
        ],
        as: "visits",
      },
    },
    {
      $addFields: { visitCount: { $size: "$visits" } },
    },
    // Project the counts
    {
      $project: {
        quotes: "$quoteCount",
        contracts: "$contractCount",
        invoices: "$invoiceCount",
        visits: "$visitCount",
      },
    },
  ];

  const result = await Customer.aggregate(pipeline);

  return {
    quotes: result[0]?.quotes || 0,
    contracts: result[0]?.contracts || 0,
    invoices: result[0]?.invoices || 0,
    visits: result[0]?.visits || 0,
  };
};

router.get(
  "/customer-dashboard/:CustomerId/:CompanyId",
  // verifyLoginToken,
  async (req, res) => {
    try {
      const { CustomerId, CompanyId } = req.params;

      const counts = await getCustomerDashboardCounts(CustomerId, CompanyId);

      res.status(200).json({
        statusCode: 200,
        message: "Customer dashboard counts retrieved successfully",
        data: counts,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//----------------------------GET CUSTOMER DATA--------------------------------------

// const getCustomers = async (query, CompanyId) => {
//   const pageSize = parseInt(query.pageSize) || 10;
//   const pageNumber = parseInt(query.pageNumber) || 0;
//   const search = query.search;
//   const sortOrder = query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;

//   let customerSearchQuery = { CompanyId, IsDelete: false };

//   const allowedSortFields = [
//     "FirstName",
//     "LastName",
//     "EmailAddress",
//     "PhoneNumber",
//     "CompanyName",
//     "updatedAt",
//     "createdAt",
//   ];

//   const sortField = allowedSortFields.includes(query.sortField)
//     ? query.sortField
//     : "updatedAt";

//   if (search) {
//     const searchParts = search.split(" ").filter(Boolean);
//     const searchConditions = searchParts.map((part) => {
//       const searchRegex = new RegExp(part, "i");
//       return {
//         $or: [
//           { FirstName: { $regex: searchRegex } },
//           { LastName: { $regex: searchRegex } },
//           { PhoneNumber: { $regex: searchRegex } },
//           { EmailAddress: { $regex: searchRegex } },
//           { "properties.Address": { $regex: searchRegex } },
//           { "properties.City": { $regex: searchRegex } },
//           { "properties.State": { $regex: searchRegex } },
//           { "properties.Country": { $regex: searchRegex } },
//           { "properties.Zip": { $regex: searchRegex } },
//         ],
//       };
//     });

//     customerSearchQuery = {
//       $and: [{ CompanyId }, { IsDelete: false }, { $and: searchConditions }],
//     };
//   }

//   let sortOptions = {};
//   if (sortField) {
//     sortOptions[sortField] = sortOrder;
//   }

//   const collation = { locale: "en", strength: 2 };

//   const customers = await Customer.aggregate([
//     {
//       $lookup: {
//         from: "locations",
//         localField: "CustomerId",
//         foreignField: "CustomerId",
//         as: "properties",
//       },
//     },
//     { $match: customerSearchQuery },
//     {
//       $project: {
//         _id: 1,
//         CompanyId: 1,
//         CustomerId: "$CustomerId",
//         FirstName: "$FirstName",
//         LastName: "$LastName",
//         CompanyName: "$CompanyName",
//         PhoneNumber: "$PhoneNumber",
//         EmailAddress: "$EmailAddress",
//         createdAt: 1,
//         updatedAt: 1,
//         IsDelete: 1,
//         location: {
//           $filter: {
//             input: "$properties",
//             as: "property",
//             cond: { $eq: ["$$property.IsDelete", false] },
//           },
//         },
//       },
//     },
//     { $sort: sortOptions },
//     { $skip: pageNumber * pageSize },
//     { $limit: pageSize },
//   ]).collation(collation);

//   const total = await Customer.aggregate([
//     {
//       $lookup: {
//         from: "locations",
//         localField: "CustomerId",
//         foreignField: "CustomerId",
//         as: "properties",
//       },
//     },
//     { $match: customerSearchQuery },
//     { $count: "totalCount" },
//   ]);

//   const totalCount = total[0]?.totalCount || 0;

//   if (customers.length > 0) {
//     return {
//       statusCode: 200,
//       message: "Customers retrieved successfully",
//       data: customers,
//       totalPages: Math.ceil(totalCount / pageSize),
//       currentPage: pageNumber,
//       totalCount: totalCount,
//     };
//   } else {
//     return {
//       statusCode: 204,
//       message: "No customers found",
//     };
//   }
// };

// router.get("/get/:CompanyId", async (req, res) => {
//   try {
//     const { CompanyId } = req.params;
//     const query = req.query;
//     query.sortField = query.sortField || "updatedAt";
//     query.sortOrder = query.sortOrder || "desc";
//     const result = await getCustomers(query, CompanyId);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({
//       statusCode: 500,
//       message: "Something went wrong, please try later!",
//     });
//   }
// });

const getCustomers = async (query, CompanyId) => {
  const pageSize = Math.max(parseInt(query.pageSize) || 10, 1);
  const pageNumber = Math.max(parseInt(query.pageNumber) || 0, 0);
  const search = query.search;
  const sortOrder = query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;

  let customerSearchQuery = { CompanyId, IsDelete: false };

  const allowedSortFields = [
    "FirstName",
    "LastName",
    "EmailAddress",
    "PhoneNumber",
    "CompanyName",
    "updatedAt",
    "createdAt",
  ];

  const sortField = allowedSortFields.includes(query.sortField)
    ? query.sortField
    : "updatedAt";

  if (search) {
    const searchParts = search.split(" ").filter(Boolean);
    const searchConditions = searchParts.map((part) => {
      const searchRegex = new RegExp(part, "i");
      return {
        $or: [
          { FirstName: { $regex: searchRegex } },
          { LastName: { $regex: searchRegex } },
          { PhoneNumber: { $regex: searchRegex } },
          { EmailAddress: { $regex: searchRegex } },
          { "properties.Address": { $regex: searchRegex } },
          { "properties.City": { $regex: searchRegex } },
          { "properties.State": { $regex: searchRegex } },
          { "properties.Country": { $regex: searchRegex } },
          { "properties.Zip": { $regex: searchRegex } },
        ],
      };
    });

    customerSearchQuery = {
      $and: [{ CompanyId }, { IsDelete: false }, { $and: searchConditions }],
    };
  }

  let sortOptions = {};
  if (sortField) {
    sortOptions[sortField] = sortOrder;
  }

  const collation = { locale: "en", strength: 2 };

  const customers = await Customer.aggregate([
    {
      $lookup: {
        from: "locations",
        localField: "CustomerId",
        foreignField: "CustomerId",
        as: "properties",
      },
    },
    { $match: customerSearchQuery },
    {
      $project: {
        _id: 1,
        CompanyId: 1,
        CustomerId: "$CustomerId",
        FirstName: "$FirstName",
        LastName: "$LastName",
        CompanyName: "$CompanyName",
        PhoneNumber: "$PhoneNumber",
        EmailAddress: "$EmailAddress",
        createdAt: 1,
        updatedAt: 1,
        IsDelete: 1,
        location: {
          $filter: {
            input: "$properties",
            as: "property",
            cond: { $eq: ["$$property.IsDelete", false] },
          },
        },
      },
    },
    { $sort: sortOptions },
    { $skip: pageNumber * pageSize },
    { $limit: pageSize },
  ]).collation(collation);

  const total = await Customer.aggregate([
    {
      $lookup: {
        from: "locations",
        localField: "CustomerId",
        foreignField: "CustomerId",
        as: "properties",
      },
    },
    { $match: customerSearchQuery },
    { $count: "totalCount" },
  ]);

  const totalCount = total[0]?.totalCount || 0;

  if (customers.length > 0) {
    return {
      statusCode: 200,
      message: "Customers retrieved successfully",
      data: customers,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: pageNumber,
      totalCount: totalCount,
    };
  } else {
    return {
      statusCode: 204,
      message: "No customers found",
    };
  }
};

router.get("/get/:CompanyId", async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const query = req.query;
    query.sortField = query.sortField || "updatedAt";
    query.sortOrder = query.sortOrder || "desc";

    const result = await getCustomers(query, CompanyId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

// 🛠️ Make sure your MongoDB collections have indexes for better performance
// db.customers.createIndex({ CompanyId: 1, CustomerId: 1 });
// db.locations.createIndex({ CustomerId: 1 });

module.exports = router;

// const getCustomers = async (query, CompanyId) => {
//   const pageSize = parseInt(query.pageSize) || 10;
//   const pageNumber = parseInt(query.pageNumber) || 0;
//   const search = query.search;
//   const sortField = query.sortField || "updatedAt";
//   const sortOrder = query.sortOrder === "desc" ? -1 : 1;

//   let customerSearchQuery = { CompanyId, IsDelete: false };

//   if (search) {
//     const searchParts = search.split(" ").filter(Boolean);
//     const searchConditions = searchParts.map((part) => {
//       const searchRegex = new RegExp(part, "i");
//       return {
//         $or: [
//           { FirstName: { $regex: searchRegex } },
//           { LastName: { $regex: searchRegex } },
//           { PhoneNumber: { $regex: searchRegex } },
//           { EmailAddress: { $regex: searchRegex } },
//           { "properties.Address": { $regex: searchRegex } },
//           { "properties.City": { $regex: searchRegex } },
//           { "properties.State": { $regex: searchRegex } },
//           { "properties.Country": { $regex: searchRegex } },
//           { "properties.Zip": { $regex: searchRegex } },
//         ],
//       };
//     });

//     customerSearchQuery = {
//       $and: [{ CompanyId }, { IsDelete: false }, { $and: searchConditions }],
//     };
//   }

//   let sortOptions = {};
//   if (sortField) {
//     sortOptions[sortField] = sortOrder;
//   }

//   const customers = await Customer.aggregate([
//     {
//       $lookup: {
//         from: "locations",
//         localField: "CustomerId",
//         foreignField: "CustomerId",
//         as: "properties",
//       },
//     },
//     { $match: customerSearchQuery },
//     { $sort: sortOptions },
//     { $skip: pageNumber * pageSize },
//     { $limit: pageSize },
//     {
//       $project: {
//         _id: 1,
//         CompanyId: 1,
//         CustomerId: "$CustomerId",
//         FirstName: "$FirstName",
//         LastName: "$LastName",
//         CompanyName: "$CompanyName",
//         PhoneNumber: "$PhoneNumber",
//         EmailAddress: "$EmailAddress",
//         createdAt: 1,
//         updatedAt: 1,
//         IsDelete: 1,
//         location: {
//           $filter: {
//             input: "$properties",
//             as: "property",
//             cond: { $eq: ["$$property.IsDelete", false] },
//           },
//         },
//       },
//     },
//   ]);

//   const total = await Customer.aggregate([
//     {
//       $lookup: {
//         from: "locations",
//         localField: "CustomerId",
//         foreignField: "CustomerId",
//         as: "properties",
//       },
//     },
//     { $match: customerSearchQuery },
//     { $count: "totalCount" },
//   ]);

//   const totalCount = total[0]?.totalCount || 0;

//   if (customers.length > 0) {
//     return {
//       statusCode: 200,
//       message: "Customers retrieved successfully",
//       data: customers,
//       totalPages: Math.ceil(totalCount / pageSize),
//       currentPage: pageNumber,
//       totalCount: totalCount,
//     };
//   } else {
//     return {
//       statusCode: 204,
//       message: "No customers found",
//     };
//   }
// };
// router.get("/get/:CompanyId", verifyLoginToken, async (req, res) => {
//   try {
//     const { CompanyId } = req.params;
//     const query = req.query;
//     query.sortField = "updatedAt";
//     query.sortOrder = "desc";
//     const result = await getCustomers(query, CompanyId);
//     //5206 code end: pagination and search filter
//     res.status(result.statusCode).json(result);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({
//       statusCode: 500,
//       message: "Something went wrong, please try later!",
//     });
//   }
// });
const getCustomersWithoutPaginationOrFilter = async (CompanyId) => {
  let customerSearchQuery = { CompanyId, IsDelete: false };

  const customers = await Customer.aggregate([
    {
      $lookup: {
        from: "locations",
        localField: "CustomerId",
        foreignField: "CustomerId",
        as: "properties",
      },
    },
    { $match: customerSearchQuery },
    {
      $project: {
        _id: 1,
        CompanyId: 1,
        CustomerId: "$CustomerId",
        FirstName: "$FirstName",
        LastName: "$LastName",
        CompanyName: "$CompanyName",
        PhoneNumber: "$PhoneNumber",
        EmailAddress: "$EmailAddress",
        createdAt: 1,
        updatedAt: 1,
        IsDelete: 1,
        location: {
          $filter: {
            input: "$properties",
            as: "property",
            cond: { $eq: ["$$property.IsDelete", false] },
          },
        },
      },
    },
  ]);

  if (customers.length > 0) {
    return {
      statusCode: 200,
      message: "Customers retrieved successfully",
      data: customers,
    };
  } else {
    return {
      statusCode: 204,
      message: "No customers found",
    };
  }
};

router.get("/get-all/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const result = await getCustomersWithoutPaginationOrFilter(CompanyId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//----------------------------GET CUSTOMER DATA------------------------------------

const getCustomerDetail = async (CustomerId, queryParams) => {
  const sortField = queryParams.sortField || "updatedAt";
  const sortOrder = queryParams.sortOrder === "desc" ? -1 : 1;

  let quoteSearchQuery = { CustomerId, IsDelete: false };

  let sortOptions = {};
  if (sortField) {
    sortOptions[sortField] = sortOrder;
  }

  const customers = await Customer.aggregate([
    {
      $lookup: {
        from: "locations",
        localField: "CustomerId",
        foreignField: "CustomerId",
        as: "properties",
      },
    },
    {
      $match: quoteSearchQuery,
    },
    {
      $project: {
        _id: 1,
        CompanyId: 1,
        CustomerId: 1,
        FirstName: "$FirstName",
        LastName: "$LastName",
        CompanyName: "$CompanyName",
        PhoneNumber: "$PhoneNumber",
        EmailAddress: "$EmailAddress",
        createdAt: 1,
        updatedAt: 1,
        IsDelete: 1,
        location: {
          $filter: {
            input: "$properties",
            as: "property",
            cond: { $eq: ["$$property.IsDelete", false] },
          },
        },
      },
    },
  ]);

  if (customers.length > 0) {
    return {
      statusCode: 200,
      message: "Customer retrieved successfully",
      data: customers[0],
    };
  } else {
    return {
      statusCode: 404,
      message: "No Customer found",
    };
  }
};
router.get("/detail/:CustomerId", verifyLoginToken, async (req, res) => {
  try {
    const { CustomerId } = req.params;
    const result = await getCustomerDetail(CustomerId, req.query);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------GET CUSTOMER PROFILE----------------------------------------

const getCustomerProfile = async (CustomerId) => {
  const customerProfile = await Customer.aggregate([
    {
      $match: {
        CustomerId,
        IsDelete: false,
      },
    },
    {
      $lookup: {
        from: "locations",
        localField: "CustomerId",
        foreignField: "CustomerId",
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
      $match: {
        "location.IsDelete": false,
      },
    },
    {
      $project: {
        _id: 0,
        statusCode: { $literal: 200 },
        message: { $literal: "Customer profile retrieved successfully" },
        data: {
          CompanyId: "$CompanyId",
          CustomerId: "$CustomerId",
          FirstName: "$FirstName",
          LastName: "$LastName",
          PhoneNumber: "$PhoneNumber",
          EmailAddress: "$EmailAddress",
          Password: "$Password",
          IsDelete: "$IsDelete",
          IsActive: "$IsActive",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          __v: "$__v",
          profileImage: "$profileImage",
          LocationId: "$location.LocationId",
          Address: "$location.Address",
          City: "$location.City",
          State: "$location.State",
          Zip: "$location.Zip",
          Country: "$location.Country",
        },
      },
    },
  ]);

  if (customerProfile.length > 0) {
    let decryptedPassword = null;
    const customerData = customerProfile[0].data;

    if (customerData.Password) {
      try {
        decryptedPassword = decryptData(customerData.Password, secretKey);
      } catch (error) {
        console.error("Error decrypting password:", error);
      }
    }

    return {
      statusCode: 200,
      message: "Customer profile retrieved successfully",
      data: {
        ...customerData,
        Password: decryptedPassword,
      },
    };
  } else {
    return {
      statusCode: 204,
      message: "No Customer found",
    };
  }
};
router.get("/profile/:CustomerId", verifyLoginToken, async function (req, res) {
  try {
    const { CustomerId } = req.params;
    const response = await getCustomerProfile(CustomerId);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------PUT CUSTOMER PROFILE----------------------------------------

const updateCustomerProfile = async (CustomerId, updateData) => {
  updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  const { EmailAddress, companyName, Password } = updateData;

  if (Password) {
    const hashedPassword = encryptData(Password, secretKey);
    updateData.Password = hashedPassword;
  }
  const customer = await Customer.findOneAndUpdate(
    { CustomerId, IsDelete: false },
    { $set: updateData },
    { new: true }
  );

  const location = await Location.findOneAndUpdate(
    { CustomerId: customer.CustomerId, IsDelete: false },
    { $set: updateData },
    { new: true }
  );

  if (!customer) {
    return {
      statusCode: 404,
      message: "Customer not found!",
    };
  }

  if (updateData.products) {
    customer.products = updateData.products;
    await customer.save();
  }

  return {
    statusCode: 200,
    message: "Customer updated successfully",
    data: customer,
    location,
  };
};
router.put("/profile/:CustomerId", verifyLoginToken, async (req, res) => {
  try {
    const { CustomerId } = req.params;
    const result = await updateCustomerProfile(CustomerId, req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------GET CUSTOMER DETAILS-------------------------------------

// const getUserDetailWithInvoices = async (CustomerId) => {
//   const data = await Customer.aggregate([
//     {
//       $match: {
//         CustomerId,
//         IsDelete: false,
//       },
//     },
//     {
//       $lookup: {
//         from: "locations",
//         let: { customerId: "$CustomerId" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$CustomerId", "$$customerId"] },
//                   { $eq: ["$IsDelete", false] },
//                 ],
//               },
//             },
//           },
//         ],
//         as: "properties",
//       },
//     },
//     {
//       $lookup: {
//         from: "invoices",
//         let: { customerId: "$CustomerId" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$CustomerId", "$$customerId"] },
//                   { $eq: ["$IsDelete", false] },
//                 ],
//               },
//             },
//           },
//         ],
//         as: "invoiceData",
//       },
//     },
//     {
//       $unwind: {
//         path: "$invoiceData",
//         preserveNullAndEmptyArrays: true,
//       },
//     },
//     {
//       $lookup: {
//         from: "invoice-payments",
//         let: { invoiceId: "$invoiceData.InvoiceId" },
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
//         ],
//         as: "invoiceData.payments",
//       },
//     },
//     {
//       $group: {
//         _id: "$_id",
//         CompanyId: { $first: "$CompanyId" },
//         CustomerId: { $first: "$CustomerId" },
//         FirstName: { $first: "$FirstName" },
//         LastName: { $first: "$LastName" },
//         PhoneNumber: { $first: "$PhoneNumber" },
//         EmailAddress: { $first: "$EmailAddress" },
//         Password: { $first: "$Password" },
//         createdAt: { $first: "$createdAt" },
//         updatedAt: { $first: "$updatedAt" },
//         IsDelete: { $first: "$IsDelete" },
//         properties: { $first: "$properties" },
//         invoiceData: { $push: "$invoiceData" },
//       },
//     },
//     {
//       $project: {
//         _id: 1,
//         CompanyId: 1,
//         CustomerId: 1,
//         FirstName: 1,
//         LastName: 1,
//         PhoneNumber: 1,
//         EmailAddress: 1,
//         Password: 1,
//         createdAt: 1,
//         updatedAt: 1,
//         IsDelete: 1,
//         location: {
//           $filter: {
//             input: "$properties",
//             as: "property",
//             cond: { $eq: ["$$property.IsDelete", false] },
//           },
//         },
//         invoiceData: 1,
//       },
//     },
//   ]);

//   if (data.length > 0) {
//     const user = data[0];

//     const totalPaidAmount = data[0].invoiceData
//       .reduce(
//         (acc, elem) =>
//           Number(acc || 0) +
//           Number(
//             elem.payments.reduce(
//               (acc, elem) => Number(acc || 0) + Number(elem.amount || 0),
//               0
//             ) || 0
//           ),
//         0
//       )
//       .toFixed(2);

//     const invoiceAmount = data[0].invoiceData
//       .reduce((acc, elem) => Number(acc || 0) + Number(elem.Total || 0), 0)
//       .toFixed(2);

//     const invoiceData = data[0].invoiceData.sort(
//       (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//     );

//     invoiceData.forEach((invoice) => {
//       if (invoice.payments && invoice.payments.length > 0) {
//         invoice.payments.sort(
//           (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//         );
//       }
//     });

//     const currentBalance = (
//       Number(invoiceAmount) - Number(totalPaidAmount)
//     ).toFixed(2);

//     return {
//       statusCode: 200,
//       message: "User retrieved successfully",
//       data: { ...user, currentBalance },
//     };
//   } else {
//     return {
//       statusCode: 404,
//       message: "No user found",
//     };
//   }
// };

const getUserDetailWithInvoices = async (CustomerId) => {
  const data = await Customer.aggregate([
    {
      $match: {
        CustomerId,
        IsDelete: false,
      },
    },
    {
      $lookup: {
        from: "locations",
        let: { customerId: "$CustomerId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$CustomerId", "$$customerId"] },
                  { $eq: ["$IsDelete", false] },
                ],
              },
            },
          },
        ],
        as: "properties",
      },
    },
    {
      $lookup: {
        from: "invoices",
        let: { customerId: "$CustomerId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$CustomerId", "$$customerId"] },
                  { $eq: ["$IsDelete", false] },
                ],
              },
            },
          },
        ],
        as: "invoiceData",
      },
    },
    {
      $unwind: {
        path: "$invoiceData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "invoice-payments",
        let: { invoiceId: "$invoiceData.InvoiceId" },
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
        ],
        as: "invoiceData.payments",
      },
    },
    {
      $lookup: {
        from: "recurring-payments",
        let: { customerId: "$CustomerId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$CustomerId", "$$customerId"] },
                  { $eq: ["$IsDelete", false] },
                ],
              },
            },
          },
        ],
        as: "recurringData",
      },
    },
    {
      $group: {
        _id: "$_id",
        CompanyId: { $first: "$CompanyId" },
        CustomerId: { $first: "$CustomerId" },
        FirstName: { $first: "$FirstName" },
        LastName: { $first: "$LastName" },
        PhoneNumber: { $first: "$PhoneNumber" },
        EmailAddress: { $first: "$EmailAddress" },
        Password: { $first: "$Password" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        IsDelete: { $first: "$IsDelete" },
        properties: { $first: "$properties" },
        invoiceData: { $push: "$invoiceData" },
        recurringData: { $first: "$recurringData" },
      },
    },
    {
      $project: {
        _id: 1,
        CompanyId: 1,
        CustomerId: 1,
        FirstName: 1,
        LastName: 1,
        PhoneNumber: 1,
        EmailAddress: 1,
        Password: 1,
        createdAt: 1,
        updatedAt: 1,
        IsDelete: 1,
        location: {
          $filter: {
            input: "$properties",
            as: "property",
            cond: { $eq: ["$$property.IsDelete", false] },
          },
        },
        invoiceData: 1,
        IsRecurring: {
          $cond: {
            if: { $gt: [{ $size: "$recurringData" }, 0] },
            then: true, // Set 'IsRecurring' to true if recurringData has elements
            else: false, // Set 'IsRecurring' to false if no recurringData found
          },
        },
      },
    },
  ]);

  if (data.length > 0) {
    const user = data[0];

    const totalPaidAmount = data[0].invoiceData
      .reduce(
        (acc, elem) =>
          Number(acc || 0) +
          Number(
            elem.payments.reduce(
              (acc, elem) => Number(acc || 0) + Number(elem.amount || 0),
              0
            ) || 0
          ),
        0
      )
      .toFixed(2);

    const invoiceAmount = data[0].invoiceData
      .reduce((acc, elem) => Number(acc || 0) + Number(elem.Total || 0), 0)
      .toFixed(2);

    const invoiceData = data[0].invoiceData.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    invoiceData.forEach((invoice) => {
      if (invoice.payments && invoice.payments.length > 0) {
        invoice.payments.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      }
    });

    const currentBalance = (
      Number(invoiceAmount) - Number(totalPaidAmount)
    ).toFixed(2);

    return {
      statusCode: 200,
      message: "User retrieved successfully",
      data: { ...user, currentBalance },
    };
  } else {
    return {
      statusCode: 404,
      message: "No user found",
    };
  }
};

router.get("/:CustomerId", verifyLoginToken, async (req, res) => {
  try {
    const { CustomerId } = req.params;
    const result = await getUserDetailWithInvoices(CustomerId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------PUT CUSTOMER DATA-------------------------------------
const updateCustomer = async (CustomerId, req) => {
  const timestamp = new Date();
  req.body["updatedAt"] = moment(timestamp).format("YYYY-MM-DD HH:mm:ss");

  const companyExists = await Company.findOne({
    EmailAddress: req.body.EmailAddress,
    IsDelete: false,
  });

  const workerExists = await Worker.findOne({
    EmailAddress: req.body.EmailAddress,
    IsDelete: false,
  });

  const superAdmin = await SuperAdmin.findOne({
    EmailAddress: req.body.EmailAddress,
    IsDelete: false,
  });

  const customer = await Customer.findOne({
    EmailAddress: req.body.EmailAddress,
    IsDelete: false,
  });

  const existingEmailAddress = await Customer.findOne({
    EmailAddress: { $regex: new RegExp(`^${req.body.EmailAddress}$`, "i") },
    IsDelete: false,
  });

  if (
    companyExists ||
    workerExists ||
    superAdmin ||
    (customer && CustomerId !== existingEmailAddress.CustomerId)
  ) {
    return {
      statusCode: 203,
      message: "E-mail Already Exists!",
    };
  }

  const updatedCustomer = await Customer.findOneAndUpdate(
    { CustomerId, IsDelete: false },
    { $set: req.body },
    { new: true }
  );

  if (!updatedCustomer) {
    return {
      statusCode: 201,
      message: "Customer not found!",
    };
  }

  const locations = await Location.find({ CustomerId, IsDelete: false });

  if (locations.length === 1) {
    const locationUpdate = {
      Address: req.body.Address || locations[0].Address,
      City: req.body.City || locations[0].City,
      State: req.body.State || locations[0].State,
      Zip: req.body.Zip || locations[0].Zip,
      Country: req.body.Country || locations[0].Country,
      updatedAt: moment(timestamp).format("YYYY-MM-DD HH:mm:ss"),
    };

    await Location.findOneAndUpdate(
      { CustomerId, IsDelete: false },
      { $set: locationUpdate },
      { new: true }
    );
  } else {
    const locationId = `${moment(timestamp).format("HHMMYYYYDDssmm")}`;
    await Location.create({
      CompanyId: req.body.CompanyId,
      CustomerId: req.body.CustomerId,
      LocationId: locationId,
      Address: req.body.Address || locations[0].Address,
      City: req.body.City || locations[0].City,
      State: req.body.State || locations[0].State,
      Zip: req.body.Zip || locations[0].Zip,
      Country: req.body.Country || locations[0].Country,
      updatedAt: moment(timestamp).format("YYYY-MM-DD HH:mm:ss"),
    });
  }
  await Activities.create({
    ActivityId: `${Date.now()}`,
    CompanyId: req.body.CompanyId,
    Action: "UPDATE",
    Entity: "Customer",
    EntityId: updatedCustomer.CustomerId,
    ActivityBy: req.Role,
    ActivityByUsername: req.userName,
    Activity: {
      description: `Updated a customer: ${updatedCustomer.FirstName} ${updatedCustomer.LastName}`,
    },
    Reason: "Customer updating",
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  });
  return {
    statusCode: 200,
    message: "Customer updated successfully",
    data: updatedCustomer,
  };
};
router.put("/:CustomerId", verifyLoginToken, async (req, res) => {
  try {
    const { CustomerId } = req.params;
    const result = await updateCustomer(CustomerId, req, req);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------DELETE CUSTOMER DATA--------------------------------------

const deleteCustomer = async (CustomerId, DeleteReason, req) => {
  //5206 code start: validation if customer assign with any
  const findContract = await Contract.findOne({ CustomerId, IsDelete: false });
  const findQuote = await Quote.findOne({ CustomerId, IsDelete: false });
  const findInvoice = await Invoice.findOne({ CustomerId, IsDelete: false });
  const findVisit = await Visits.findOne({ CustomerId, IsDelete: false });

  if (findContract || findQuote || findInvoice || findVisit) {
    return {
      statusCode: 202,
      message:
        "You can't delete the customer, it's already assigned to a contract, quote, invoice or visits",
    };
  }

  const findCustomer = await Customer.findOneAndUpdate(
    { CustomerId, IsDelete: false },
    { $set: { IsDelete: true, DeleteReason } },
    { new: true }
  );

  const updateLocations = await Location.updateMany(
    { CustomerId, IsDelete: false },
    { $set: { IsDelete: true } }
  );

  const updatedNotifications = await Notification.updateMany(
    { CustomerId },
    { $set: { IsDelete: true } }
  );

  if (
    findCustomer ||
    updateLocations.modifiedCount > 0 ||
    updatedNotifications.nModified > 0
  ) {
    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: req.CompanyId,
      Action: "DELETE",
      Entity: "Customer",
      EntityId: findCustomer.CustomerId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Deleted a customer: ${findCustomer.FirstName} ${findCustomer.LastName}`,
      },
      Reason: DeleteReason,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      message: "Customer deleted successfully",
    };
  }

  return {
    statusCode: 404,
    message: "Customer not found",
  };
};
router.delete("/:CustomerId", verifyLoginToken, async (req, res) => {
  try {
    const { CustomerId } = req.params;
    const { DeleteReason } = req.body;

    const result = await deleteCustomer(CustomerId, DeleteReason, req);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------GET CUSTOMER WITH LOCATION---------------------------------------

const getCustomersWithLocations = async (CompanyId) => {
  try {
    const customers = await Customer.aggregate([
      {
        $match: {
          CompanyId: CompanyId,
          IsDelete: false,
        },
      },
      {
        $sort: { updatedAt: -1 },
      },
      {
        $lookup: {
          from: "locations",
          localField: "CustomerId",
          foreignField: "CustomerId",
          as: "location",
        },
      },
      {
        $addFields: {
          location: {
            $filter: {
              input: "$location",
              as: "loc",
              cond: { $eq: ["$$loc.IsDelete", false] },
            },
          },
        },
      },
    ]);

    if (customers.length === 0) {
      return {
        statusCode: 204,
      };
    }

    return {
      statusCode: 200,
      message: "Customer retrieved successfully with all locations",
      data: customers,
    };
  } catch (error) {
    throw new Error("Failed to fetch customers with locations");
  }
};
router.get("/get_customer/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const result = await getCustomersWithLocations(CompanyId);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

// ------------------------SEND INVITATION MAIL-----------------------------------
const sendWelcomeEmailToCustomer = async (customerId) => {
  try {
    const findCustomer = await Customer.findOne({ CustomerId: customerId });
    if (!findCustomer) {
      return { statusCode: 404, message: "Customer not found" };
    }
    const findCompany = await Company.findOne({
      companyId: findCustomer.CompanyId,
    });
    if (!findCompany) {
      return { statusCode: 404, message: "Company not found" };
    }

    const resetToken = await createResetToken({
      EmailAddress: findCustomer.EmailAddress,
    });
    const url = `${AppUrl}/auth/new-password?token=${resetToken}`;
          
    const button = `
      <p>
        <a href="${url}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; border: 1px solid #e88c44; border-radius: 8px; background-color: #e88c44; color: #fff; text-decoration: none; text-align: center; font-size: 15px; font-weight: 500; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
          Set Your Password
        </a>
      </p>
    `;

    const data = [
      {
        FirstName: findCustomer.FirstName || "",
        LastName: findCustomer.LastName || "",
        EmailAddress: findCustomer.EmailAddress || "",
        PhoneNumber: findCustomer.PhoneNumber || "",
        companyName: findCompany.companyName || "",
        EmailAddress: findCompany.EmailAddress || "",
        companyPhoneNumber: findCompany.phoneNumber || "",
        Url: button || "",
      },
    ];

    const defaultBody = `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff;">
      <!-- Outer Wrapper -->
      <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 1px solid #e88c44;">
        
        <!-- Header Section with Logo -->
        <tr>
          <td style="padding: 20px 0; text-align: center; background-color: #063164; ">
            <div style="display: inline-block; padding: 20px; background-color: white; border-radius: 12px;">
              <img src="https://app.cloudjobmanager.com/cdn/upload/20250213103016_site-logo2.png" alt="CloudJobManager Logo" style="width: 160px; max-width: 100%; display: block; margin: auto;" />
            </div>
          </td>
        </tr>
  
        <!-- Main Content Section -->
        <tr>
          <td style="padding: 0px 20px; text-align: center; color: #333333; background-color: #ffffff; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
            <h2 style="font-size: 25px; font-weight: 700; color: #063164; margin-bottom: 20px; letter-spacing: 1px;margin-top:20px;">Welcome to ${findCompany.companyName}</h2>
            <p style="font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 20px; font-weight: 400;">
              Dear ${findCustomer.FirstName} ${findCustomer.LastName},<br>
              We are pleased to provide you with your login credentials for accessing our Contract Management System. Below are your details:
            </p>
            <p><strong>Email:</strong> ${findCustomer.EmailAddress}</p>
  
            <!-- Set Password Button -->
            <p>
              <a href="${url}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; border: 1px solid #e88c44 ; border-radius: 8px; background-color: #e88c44 ; color: #fff; text-decoration: none; text-align: center; font-size: 15px; font-weight: 500; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
                Set Your Password
              </a>
            </p>
            
            <p style="font-size: 14px; color: #888888; margin-top: 30px; line-height: 1.6;">
              For security reasons, we recommend changing your password upon first login. If you have any questions or need assistance, please do not hesitate to reach out to our support team at <a href="mailto:${findCompany.EmailAddress}" style="color: #063164; font-weight: 600;">${findCompany.EmailAddress}</a> or ${findCompany.phoneNumber}.
            </p>
  
            <p style="font-size: 14px; color: #888888; margin-top: 30px; font-weight: 400;">
              Thank you for choosing ${findCompany.companyName}. We are committed to providing you with a seamless and efficient experience.
            </p>
  
            <p style="font-size: 14px; color: #888888; margin-top: 30px; font-weight: 400;">Best regards,<br>The ${findCompany.companyName} Team</p>
          </td>
        </tr>
  
        <!-- Footer Section -->
        <tr>
          <td style="padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f4f4f7; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
            ${findCompany.companyName}, Inc. | All rights reserved.<br>
            <a href="#" style="color: #e88c44; text-decoration: none;">Unsubscribe</a> if you no longer wish to receive these emails.
          </td>
        </tr>
      </table>
    </div>
  `;

    const emailStatus = await handleTemplate(
      "Invitation",
      findCustomer.CompanyId,
      data,
      [],
      "Welcome to our service",
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
    console.error("Error sending welcome email:", error.message);
    return {
      statusCode: 500,
      message: "Something went wrong, please try again later",
    };
  }
};

// Endpoint to trigger sending welcome email
router.post("/send_mail/:CustomerId", verifyLoginToken, async (req, res) => {
  try {
    const { CustomerId } = req.params;

    // Call the sendWelcomeEmailToCustomer function
    const result = await sendWelcomeEmailToCustomer(CustomerId);

    // Return response based on the result from the send function
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error in /send_mail endpoint:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//--------------------------SETUP NEW PASSWORD-------------------------------------

// Set First Time Password for Customer
const setNewCustomerPassword = async (
  CustomerId,
  token,
  newPassword,
  secretKey
) => {
  if (!token || !newPassword) {
    return { statusCode: 400, message: "Token and new password are required" };
  }

  let decryptedData;
  try {
    decryptedData = JSON.parse(
      decryptData(decodeURIComponent(token), secretKey)
    );
  } catch (err) {
    return { statusCode: 400, message: "Invalid token format" };
  }

  const { email, expiresAt } = decryptedData;
  const currentTime = new Date().getTime();

  if (currentTime > expiresAt) {
    return { statusCode: 400, message: "Token has expired" };
  }

  const customer = await Customer.findOne({
    EmailAddress: email,
    IsDelete: false,
  });

  if (!customer) {
    return {
      statusCode: 404,
      message: "User not found or email does not exist",
    };
  }

  if (newPassword.length < 8) {
    return {
      statusCode: 400,
      message: "Password must be at least 8 characters long",
    };
  }

  const hashConvert = encryptData(newPassword, secretKey);

  const updatedCustomer = await Customer.findOneAndUpdate(
    { CustomerId: CustomerId, IsDelete: false },
    { $set: { Password: hashConvert } },
    { new: true }
  );

  if (updatedCustomer) {
    return { statusCode: 200, message: "Password updated successfully" };
  } else {
    return { statusCode: 404, message: "User not found" };
  }
};
router.put("/set_password/:CustomerId", verifyLoginToken, async (req, res) => {
  const { CustomerId } = req.params;
  const { token, Password } = req.body;

  try {
    const result = await setNewCustomerPassword(
      CustomerId,
      token,
      Password,
      secretKey
    );

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error updating password:", error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

const sendWelcomeEmailToCompany = async (QuoteId, data) => {
  try {
    const findQuote = await Quote.findOne({
      QuoteId: QuoteId,
      status: { $ne: "Approved" },
    });
    if (!findQuote) {
      return {
        statusCode: 404,
        message: "Quote not found or already approved",
      };
    }
    const findCustomer = await Customer.findOne({
      CustomerId: findQuote.CustomerId,
    });
    if (!findCustomer) {
      return { statusCode: 404, message: "Customer not found" };
    }

    const findCompany = await Company.findOne({
      companyId: findCustomer.CompanyId,
    });
    if (!findCompany) {
      return { statusCode: 404, message: "Company not found" };
    }

    const data = [
      {
        FirstName: findCustomer.FirstName || "",
        LastName: findCustomer.LastName || "",
        EmailAddress: findCompany.EmailAddress || "",
        EmailAddress: findCustomer.EmailAddress || "",
        PhoneNumber: findCustomer.PhoneNumber || "",
        companyName: findCompany.companyName || "",
        companyPhoneNumber: findCompany.phoneNumber || "",
        quoteTitle: findQuote.Title || "",
        quoteNumber: findQuote.QuoteNumber || "",
        quoteTotal: findQuote.Total || "",
      },
    ];

    const CompanyId = data?.CompanyId;
    const CustomersId = data?.CustomerId;

    // Step 6: Generate JWT Token for URL
    const token = jwt.sign(
      { QuoteId, CompanyId, CustomersId },
      "fuirfgerug^%GF(Fijrijgrijgidjg#$@#$TYFSD()*$#%^&S(*^uk8olrgrtg#%^%#gerthr%B&^#eergege*&^#gg%*B^",
      { expiresIn: "30d" }
    );

    const url = `https://app.cloudjobmanager.com/customers/quotes-details?token=${token}`;
    //This is the below cooment code it view quote btton in mail which is after the findQuote.Total message

    // <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #e88c44; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none; border-radius: 50px; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: all 0.3s ease;">View Quote</a>
    const defaultBody = `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff;">
      <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 1px solid #e88c44;">
      
        <tr>
          <td style="padding: 20px 0; text-align: center; background-color: #063164;">
            <div style="display: inline-block; padding: 20px; background-color: white; border-radius: 12px;">
              <img src="https://app.cloudjobmanager.com/cdn/upload/20250213103016_site-logo2.png" alt="CloudJobManager Logo" style="width: 160px; max-width: 100%; display: block; margin: auto;" />
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 0px 20px; text-align: center; color: #333333; background-color: #ffffff; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
            <h2 style="font-size: 25px; font-weight: 700; color: #063164; margin-bottom: 20px; letter-spacing: 1px;margin-top:20px;">Quote Approved From ${findCustomer.FirstName} ${findCustomer.LastName}</h2>
            <p style="font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 20px; font-weight: 400;">
              Dear ${findCompany.companyName},<br>
              A customer has confirmed a quote. Below are the details for your reference:
            </p>

            


<div style="margin-right:auto; font-family: Arial, sans-serif; color: #063164; font-size: 18px;">
  <!-- Customer Details Column (Left) -->
    <p style="margin: 8px 0;display:flex;justify-content:space-between;"><strong style="color: #e88c44;font-size:16px;">Customer Name:</strong> ${findCustomer.FirstName} ${findCustomer.LastName}</p>
    <p style="margin: 8px 0;display:flex;justify-content:space-between;"><strong style="color: #e88c44;font-size:16px;">Email:</strong> <a href="mailto:${findCustomer.EmailAddress}" style="color: #063164; text-decoration: none;">${findCustomer.EmailAddress}</a></p>
    <p style="margin: 8px 0;display:flex;justify-content:space-between;"><strong style="color: #e88c44;font-size:16px;">Phone Number:</strong> ${findCustomer.PhoneNumber}</p>

    <p style="margin: 8px 0;display:flex;justify-content:space-between;"><strong style="color: #e88c44;font-size:16px;">Quote Title:</strong> ${findQuote.Title}</p>
    <p style="margin: 8px 0;display:flex;justify-content:space-between;"><strong style="color: #e88c44;font-size:16px;">Quote Number:</strong> ${findQuote.QuoteNumber}</p>
    <p style="margin: 8px 0;display:flex;justify-content:space-between;"><strong style="color: #e88c44;font-size:16px;">Quote Total:</strong> <span style="font-weight: bold; color: #063164;">${findQuote.Total}</span></p>
  
</div>



            <p style="font-size: 14px; color: #888888; margin-top: 30px; line-height: 1.6;">
              If you have any questions or need further assistance, please feel free to reach out to us at <a href="mailto:${findCustomer.EmailAddress}" style="color: #063164; font-weight: 600;">${findCustomer.EmailAddress}</a> or ${findCustomer.PhoneNumber}.
            </p>

            <p style="font-size: 14px; color: #888888; margin-top: 30px; font-weight: 400;">Best regards,<br>The ${findCustomer.FirstName} ${findCustomer.LastName} Team</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f4f4f7; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
            ${findCustomer.FirstName} ${findCustomer.LastName}, Inc. | All rights reserved.<br>
            <a href="#" style="color: #e88c44; text-decoration: none;">Unsubscribe</a> if you no longer wish to receive these emails.
          </td>
        </tr>
      </table>
    </div>
  `;

    // Send email using handleTemplate function
    const emailStatus = await handleTemplate(
      "Invitation",
      findCustomer.CompanyId,
      data,
      [],
      "Quote Approved by Customer",
      defaultBody,
      findCustomer.CustomerId
    );

    if (emailStatus) {
      return {
        statusCode: 200,
        message: `Email was sent to ${findCompany.EmailAddress}`,
      };
    } else {
      return {
        statusCode: 203,
        message: "Issue sending email",
      };
    }
  } catch (error) {
    console.error("Error sending welcome email:", error.message);
    return {
      statusCode: 500,
      message: "Something went wrong, please try again later",
    };
  }
};

router.post(
  "/send_mailcompany/:QuoteId",

  async (req, res) => {
    try {
      const { QuoteId } = req.params;

      const result = await sendWelcomeEmailToCompany(QuoteId);

      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Error in /send_mail endpoint:", error);
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

const handleRequestchangemail = async (
  QuotesId,
  data,
  // quoteDetail,
  companyId
) => {
  try {
    // const { CustomerId } = data;
    const QuoteId = QuotesId || data?.QuoteId;
    // Step 1: Find the Quote if QuoteId is provided
    const findQuote = await Quote.findOne({
      QuoteId: QuoteId,
      status: { $ne: "Approved" },
    });

    if (!findQuote) {
      return {
        statusCode: 404,
        message: "Quote not found or already request-change",
      };
    }
    const CustomerId = findQuote.CustomerId;

    // Step 2: Check if Request Change exists for the found Quote
    const requstchange = await RequestChange.findOne({
      QuoteId: findQuote.QuoteId,
    });

    // Step 3: Find Customer associated with Quote
    const findCustomer = await Customer.findOne({
      CustomerId: findQuote.CustomerId,
    });
    if (!findCustomer) {
      return { statusCode: 404, message: "Customer not found" };
    }

    // Step 4: Find Company associated with Customer
    const findCompany = await Company.findOne({
      companyId: findCustomer.CompanyId,
    });
    if (!findCompany) {
      return { statusCode: 404, message: "Company not found" };
    }

    const Quotedata = [
      {
        FirstName: findCustomer.FirstName || "",
        LastName: findCustomer.LastName || "",
        EmailAddress: findCompany.EmailAddress || "",
        EmailAddress: findCustomer.EmailAddress || "",
        PhoneNumber: findCustomer.PhoneNumber || "",
        companyName: findCompany.companyName || "",
        companyPhoneNumber: findCompany.phoneNumber || "",
        quoteTitle: findQuote.Title || "",
        quoteNumber: findQuote.QuoteNumber || "",
        quoteTotal: findQuote.Total || "",
        requestChange:
          (requstchange &&
            requstchange.RequestMessage &&
            requstchange.RequestMessage[0] &&
            requstchange.RequestMessage[0].message) ||
          "",
      },
    ];

    const CompanyId = data?.CompanyId;
    const CustomersId = data?.CustomerId;

    // Step 6: Generate JWT Token for URL
    const token = jwt.sign(
      { QuoteId, CompanyId, CustomersId },
      "fuirfgerug^%GF(Fijrijgrijgidjg#$@#$TYFSD()*$#%^&S(*^uk8olrgrtg#%^%#gerthr%B&^#eergege*&^#gg%*B^",
      { expiresIn: "30d" }
    );

    const url = `https://app.cloudjobmanager.com/customers/quotes-details?token=${token}`;
    // https://app.cloudjobmanager.com/wp-amin
    // Step 7: Create the 'Make Payment' Button HTML
    const makepayment = `
      <p><a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #e88c44; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none; border-radius: 50px; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: all 0.3s ease;">View Quote</a></p>
    `;
    //This is the below cooment code it view quote btton in mail which is after the requestchange message

    // <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #e88c44; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none; border-radius: 50px; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transition: all 0.3s ease;">View Quote</a>

    const defaultBody = `
    <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff;">
      <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 1px solid #e88c44;">
        <tr>
          <td style="padding: 20px 0; text-align: center; background-color: #063164;">
            <div style="display: inline-block; padding: 20px; background-color: white; border-radius: 12px;">
              <img src="https://app.cloudjobmanager.com/cdn/upload/20250213103016_site-logo2.png" alt="CloudJobManager Logo" style="width: 160px; max-width: 100%; display: block; margin: auto;" />
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 0px 20px; text-align: center; color: #333333; background-color: #ffffff; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
            <h2 style="font-size: 25px; font-weight: 700; color: #063164; margin-bottom: 20px; letter-spacing: 1px;margin-top:20px;">Quote Request Change From ${
              findCustomer.FirstName
            } ${findCustomer.LastName}</h2>
            <p style="font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 20px; font-weight: 400;">
              Dear ${findCompany.companyName},<br>
              A customer has requested a change to the quote. Below are the details for your reference:
            </p>
          
            <div style="margin-right:auto; font-family: Arial, sans-serif; color: #063164; font-size: 18px;">
              <p style="margin: 8px 0;display:flex;justify-content:space-between;"><strong style="color: #e88c44;font-size:16px;">Customer Name:</strong> ${
                findCustomer.FirstName
              } ${findCustomer.LastName}</p>
              <p style="margin: 8px 0;display:flex;justify-content:space-between;"><strong style="color: #e88c44;font-size:16px;">Email:</strong> <a href="mailto:${
                findCustomer.EmailAddress
              }" style="color: #063164; text-decoration: none;">${
      findCustomer.EmailAddress
    }</a></p>
              <p style="margin: 8px 0;display:flex;justify-content:space-between;"><strong style="color: #e88c44;font-size:16px;">Phone Number:</strong> ${
                findCustomer.PhoneNumber
              }</p>
 
              <p style="margin: 8px 0;display:flex;justify-content:space-between;"><strong style="color: #e88c44;font-size:16px;">Quote Title:</strong> ${
                findQuote.Title
              }</p>
              <p style="margin: 8px 0;display:flex;justify-content:space-between;"><strong style="color: #e88c44;font-size:16px;">Quote Number:</strong> ${
                findQuote.QuoteNumber
              }</p>
              <p style="margin: 8px 0;display:flex;justify-content:space-between;"><strong style="color: #e88c44;font-size:16px;">Quote Total:</strong> <span style="font-weight: bold; color: #063164;">${
                findQuote.Total
              }</span></p>
              <p style="margin: 8px 0;display:flex;justify-content:space-between;">
                <strong style="color: #e88c44;font-size:16px;">Request Change message:</strong>
                <span style="font-weight: bold; color: #063164;">
                  ${
                    requstchange &&
                    requstchange.RequestMessage &&
                    requstchange.RequestMessage[0]
                      ? requstchange.RequestMessage[0].message
                      : ""
                  }
                </span>
              </p>
            </div>

         
            <p style="font-size: 14px; color: #888888; margin-top: 30px; line-height: 1.6;">
              If you have any questions or need further assistance, please feel free to reach out to us at <a href="mailto:${
                findCustomer.EmailAddress
              }" style="color: #063164; font-weight: 600;">${
      findCustomer.EmailAddress
    }</a> or ${findCustomer.PhoneNumber}.
            </p>

            <p style="font-size: 14px; color: #888888; margin-top: 30px; font-weight: 400;">Best regards,<br>The ${
              findCustomer.FirstName
            } ${findCustomer.LastName} Team</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f4f4f7; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
            ${findCustomer.FirstName} ${
      findCustomer.LastName
    }, Inc. | All rights reserved.<br>
            <a href="#" style="color: #e88c44; text-decoration: none;">Unsubscribe</a> if you no longer wish to receive these emails.
          </td>
        </tr>
      </table>
    </div>
  `;

    // Step 9: Send Email using `handleTemplate` function
    const emailStatus = await handleTemplate(
      "Invitation",
      findCustomer.CompanyId,
      Quotedata,
      [],
      "Request Change by Customer",
      defaultBody,
      findCustomer.CustomerId
    );

    if (emailStatus) {
      return {
        statusCode: 200,
        message: `Email was sent to ${findCompany.EmailAddress}`,
      };
    } else {
      return {
        statusCode: 203,
        message: "Issue sending email",
      };
    }
  } catch (error) {
    console.error("Error sending request change email:", error.message);
    return {
      statusCode: 500,
      message: "Something went wrong, please try again later",
    };
  }
};

router.post(
  "/send_requestchangemail/:QuoteId",

  async (req, res) => {
    try {
      const { QuoteId } = req.params;

      const result = await handleRequestchangemail(QuoteId);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Error in /send_mail endpoint:", error);
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

router.put("/change-password/:CustomerId", async (req, res) => {
  const { Password, confirmpassword } = req.body;
  const { CustomerId } = req.params;

  try {
    const company = await Customer.findOne({ CustomerId });
    if (!company) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const decryptedPassword = decryptData(company.Password);

    if (Password === decryptedPassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }

    company.Password = encryptData(Password);
    await company.save();

    return res.status(200).json({ message: "Password successfully changed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

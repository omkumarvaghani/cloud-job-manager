var express = require("express");
var router = express.Router();
const Visits = require("./model");
const moment = require("moment");
const { verifyLoginToken } = require("../../../../authentication");
const AssignPerson = require("../../Worker/model");
const Notification = require("../../../Notification/model");
const { addNotification } = require("../../../Notification/notification");
const Customer = require("../../Customer/model");
const Location = require("../../Location/model");
const Activities = require("../../ActivitiesModel");
const Contract = require("../model");
const { validateVisitsBody, visitsValidationSchema } = require("./validation");

//Create visit in contract
const createVisit = async (data, req) => {
  const VisitId = Date.now();
  const uniqueId = `${VisitId}`;

  if (!Array.isArray(data.WorkerId)) {
    data.WorkerId = [data.WorkerId];
  }
  data["VisitId"] = uniqueId;
  data["createdAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  data["updatedAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  try {
    const createdVisit = await Visits.create(data);
    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: data.CompanyId,
      Action: "CREATE",
      Entity: "Visit",
      EntityId: data.VisitId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Created a new visit #${data.ItemName}`,
      },
      Reason: "Visit creation",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    await addNotification({
      CompanyId: data.CompanyId,
      VisitId: data.VisitId,
      CreatedBy: "VisitRole",
      AddedAt: data.createdAt,
      Is_Admin: true, 
      Is_Superadmin: false, 
      Is_Customer: true,
      Is_Staffmember: true,
    });

    return {
      statusCode: 200,
      message: "Visit created successfully.",
      data: createdVisit,
    };
  } catch (error) {
    return {
      statusCode: 400,
      message: "Failed to create visit.",
      error: error.message,
    };
  }
};
router.post("/", verifyLoginToken,validateVisitsBody(visitsValidationSchema), async (req, res) => {
  try {
    const response = await createVisit(req.body, req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------GET DATA----------------------------------------

const getVisits = async (CompanyId) => {
  const schedule = await Visits.find({
    CompanyId,
    IsDelete: false,
  });

  if (!schedule || schedule.length === 0) {
    return {
      statusCode: 204,
      message: "No visits found.",
    };
  }

  return {
    statusCode: 200,
    data: schedule,
    message: "Data retrieved successfully.",
  };
};

router.get("/schedule/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const result = await getVisits(CompanyId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error occurred:", error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------GET DATA----------------------------------------

const getVisitSchedule = async (CompanyId) => {
  try {
    const contracts = await Visits.aggregate([
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
          as: "CustomerData",
        },
      },
      {
        $lookup: {
          from: "locations",
          localField: "LocationId",
          foreignField: "LocationId",
          as: "LocationData",
        },
      },
      {
        $lookup: {
          from: "contracts",
          localField: "ContractId",
          foreignField: "ContractId",
          as: "ContractData",
        },
      },
      {
        $unwind: {
          path: "$CustomerData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$LocationData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$ContractData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          ItemName: 1,
          Note: 1,
          VisitId: 1,
          ContractId: 1,
          StartDate: 1,
          EndDate: 1,
          StartTime: 1,
          EndTime: 1,
          FirstName: "$CustomerData.FirstName",
          LastName: "$CustomerData.LastName",
          Address: "$LocationData.Address",
          City: "$LocationData.City",
          State: "$LocationData.State",
          Zip: "$LocationData.Zip",
          Country: "$LocationData.Country",
          ContractNumber: "$ContractData.ContractNumber",
        },
      }
    ]);
    return {
      statusCode: 200,
      data: contracts,
      message: "Read All Contracts and Visits",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Something went wrong, please try later!",
    };
  }
};

router.get("/visit-schedule/:CompanyId", async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const result = await getVisitSchedule(CompanyId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------GET DATA----------------------------------------

const getWorkerSchedule = async (WorkerId) => {
  const schedule = await Visits.aggregate([
    {
      $match: {
        WorkerId: { $in: [WorkerId] },
        IsDelete: false,
      },
    },
    {
      $lookup: {
        from: "locations",
        localField: "LocationId",
        foreignField: "LocationId",
        as: "locationDetails",
      },
    },
    {
      $unwind: {
        path: "$locationDetails",
        preserveNullAndEmptyArrays: true,
      },
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
      $project: {
        _id: 0,
        VisitId: 1,
        ContractId: 1,
        ItemName: 1,
        Note: 1,
        StartDate: 1,
        EndDate: 1,
        StartTime: 1,
        EndTime: 1,
        "customerDetails.FirstName": 1,
        "customerDetails.LastName": 1,
        "locationDetails.Address": 1,
        "locationDetails.City": 1,
        "locationDetails.State": 1,
        "locationDetails.Zip": 1,
        "locationDetails.Country": 1,
      },
    },
  ]);

  if (!schedule || schedule.length === 0) {
    return {
      statusCode: 204,
      message: "No visits found.",
    };
  }

  return {
    statusCode: 200,
    data: schedule,
    message: "Data retrieved successfully.",
  };
};

router.get("/Worker_schedule/:WorkerId", async (req, res) => {
  try { 
    const { WorkerId } = req.params;
    const result = await getWorkerSchedule(WorkerId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error occurred:", error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------GET DETAILS DATA----------------------------------------

const getVisitDetails = async (ContractId, CompanyId) => {
  try {
    const result = await Visits.aggregate([
      {
        $match: {
          ContractId,
          CompanyId,
          IsDelete: false,
        },
      },
      {
        $lookup: {
          from: "workers",
          localField: "WorkerId",
          foreignField: "WorkerId",
          as: "AssignPerson",
        },
      },
      {
        $lookup: {
          from: "workers",
          localField: "ConfirmWorker",
          foreignField: "WorkerId",
          as: "ConfirmedWorkersDetails",
        },
      },
      {
        $lookup: {
          from: "workers",
          localField: "ConfirmComplete",
          foreignField: "WorkerId",
          as: "ConfirmCompleteWorkers",
        },
      },
      {
        $unwind: {
          path: "$AssignPerson",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          VisitId: { $first: "$VisitId" },
          ContractId: { $first: "$ContractId" },
          WorkerId: { $first: "$WorkerId" },
          ItemName: { $first: "$ItemName" },
          Note: { $first: "$Note" },
          StartDate: { $first: "$StartDate" },
          EndDate: { $first: "$EndDate" },
          // AssignPersons: { $push: "$AssignPerson.FullName" },
          AssignPersons: { $push: { $concat: ["$AssignPerson.FirstName", " ", "$AssignPerson.LastName"] } },
          ConfirmedWorkersDetails: { $first: "$ConfirmedWorkersDetails" },
          ConfirmCompleteWorkers: { $first: "$ConfirmCompleteWorkers" },
          IsConfirm: { $first: "$IsConfirm" },
          IsConfirmByWorker: { $first: "$IsConfirmByWorker" },
          ConfirmComplete: { $first: "$ConfirmComplete" },
          IsComplete: { $first: "$IsComplete" },
        },
      },
      {
        $project: {
          VisitId: 1,
          ContractId: 1,
          WorkerId: 1,
          ItemName: 1,
          Note: 1,
          StartDate: 1,
          EndDate: 1,
          AssignPersons: 1,
          ConfirmedWorkers: {
            $map: {
              input: "$ConfirmedWorkersDetails",
              as: "worker",
              in: {
                WorkerId: "$$worker.WorkerId",
                FullName: "$$worker.FullName",
              },
            },
          },
          IsConfirm: 1,
          IsConfirmByWorker: 1,
          IsComplete: 1,
          ConfirmComplete: {
            $map: {
              input: "$ConfirmCompleteWorkers",
              as: "worker",
              in: {
                WorkerId: "$$worker.WorkerId",
                FullName: "$$worker.FullName",
              },
            },
          },
        },
      },
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const Today = result.filter((visit) => {
      const visitDate = new Date(visit.StartDate);
      return visitDate.getTime() === today.getTime();
    });

    const Upcoming = result.filter((visit) => {
      const visitDate = new Date(visit.StartDate);
      return visitDate > today;
    });

    const Past = result.filter((visit) => {
      const visitDate = new Date(visit.StartDate);
      return visitDate < today;
    });

    Today.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
    Upcoming.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
    Past.sort((a, b) => new Date(b.StartDate) - new Date(a.StartDate));

    const sortedVisits = [...Today, ...Upcoming, ...Past];

    if (!result || result.length === 0) {
      return {
        statusCode: 204,
        message: "No data found for ContractId and CompanyId.",
      };
    }

    return {
      statusCode: 200,
      message: "Data fetched successfully",
      data: sortedVisits,
    };
  } catch (error) {
    return {
      statusCode: 400,
      message: "Failed to fetch data.",
      error: error.message,
    };
  }
};

router.get("/:ContractId/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { ContractId, CompanyId } = req.params;
    const result = await getVisitDetails(ContractId, CompanyId);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------GET CUSTOMER DATA----------------------------------------
//5206 code start
const getCustomerVisits = async (CompanyId, CustomerId) => {
  try {
    const result = await Visits.aggregate([
      {
        $match: {
          CompanyId,
          CustomerId,
          IsDelete: false,
        },
      },
      {
        $lookup: {
          from: "workers",
          localField: "WorkerId",
          foreignField: "WorkerId",
          as: "AssignPerson",
        },
      },
      {
        $lookup: {
          from: "locations",
          localField: "LocationId",
          foreignField: "LocationId",
          as: "Location",
        },
      },
      {
        $lookup: {
          from: "contracts",
          localField: "ContractId",
          foreignField: "ContractId",
          as: "ContractData",
        },
      },
      {
        $addFields: {
          AssignPerson: { $arrayElemAt: ["$AssignPerson", 0] },
          Location: { $arrayElemAt: ["$Location", 0] },
          ContractData: { $arrayElemAt: ["$ContractData", 0] },
        },
      },
      {
        $project: {
          VisitId: 1,
          CompanyId: 1,
          ContractId: 1,
          CustomerId: 1,
          StartDate: 1,
          StartTime: 1,
          EndTime: 1,
          EndDate: 1,
          IsConfirm: 1,
          LocationId: 1,
          "AssignPerson.WorkerId": 1,
          "AssignPerson.FullName": 1,
          "Location.LocationId": 1,
          "Location.Address": 1,
          "Location.City": 1,
          "Location.State": 1,
          "Location.Country": 1,
          "ContractData.ContractNumber": 1,
        },
      },
    ]);

    if (!result || result.length === 0) {
      return {
        statusCode: 204,
        message: `No visits found for the given CompanyId and CustomerId.`,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const Today = result.filter((visit) => {
      const visitDate = new Date(visit.StartDate);
      return visitDate.getTime() === today.getTime();
    });

    const Upcoming = result.filter((visit) => {
      const visitDate = new Date(visit.StartDate);
      return visitDate > today;
    });

    const Past = result.filter((visit) => {
      const visitDate = new Date(visit.StartDate);
      return visitDate < today;
    });

    Today.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
    Upcoming.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
    Past.sort((a, b) => new Date(b.StartDate) - new Date(a.StartDate));

    const sortedVisits = [...Today, ...Upcoming, ...Past];

    return {
      statusCode: 200,
      message: "Data fetched successfully.",
      data: sortedVisits,
    };
  } catch (error) {
    return {
      statusCode: 400,
      message: "Failed to fetch data.",
      error: error.message,
    };
  }
};

//5206 code end
router.get(
  "/customer_visits/:CompanyId/:CustomerId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { CompanyId, CustomerId } = req.params;
      const result = await getCustomerVisits(CompanyId, CustomerId);

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

//-------------------------------GET VISITS DATA----------------------------------------

// const getWorkerVisits = async (CompanyId, WorkerId, query) => {
//   const pageSize = parseInt(query.pageSize) || 10;
//   const pageNumber = parseInt(query.pageNumber) || 0;
//   const search = query.search;

//   const sortField = query.sortField || "StartDate";
//   const sortOrder = query.sortOrder === "desc" ? -1 : 1;

//   let visitSearchQuery = {
//     CompanyId,
//     WorkerId,
//     IsDelete: false,
//   };

//   if (search) {
//     const searchRegex = new RegExp(search, "i");
//     visitSearchQuery = {
//       ...visitSearchQuery,
//       $or: [
//         { StartDate: { $regex: searchRegex } },
//         { ItemName: { $regex: searchRegex } },
//         { "AssignPerson.FullName": { $regex: searchRegex } },
//         { "Location.Address": { $regex: searchRegex } },
//         { "Location.City": { $regex: searchRegex } },
//         { "Location.State": { $regex: searchRegex } },
//         { "Location.Country": { $regex: searchRegex } },
//       ],
//     };
//   }

//   const pipeline = [
//     { $match: visitSearchQuery },
//     {
//       $lookup: {
//         from: "workers",
//         localField: "WorkerId",
//         foreignField: "WorkerId",
//         as: "AssignPerson",
//       },
//     },
//     {
//       $addFields: {
//         AssignPerson: {
//           $filter: {
//             input: "$AssignPerson",
//             as: "person",
//             cond: { $eq: ["$$person.WorkerId", WorkerId] },
//           },
//         },
//       },
//     },
//     {
//       $lookup: {
//         from: "locations",
//         localField: "LocationId",
//         foreignField: "LocationId",
//         as: "Location",
//       },
//     },
//     {
//       $lookup: {
//         from: "contracts",
//         localField: "ContractId",
//         foreignField: "ContractId",
//         as: "ContractData",
//       },
//     },
//     { $unwind: { path: "$AssignPerson", preserveNullAndEmptyArrays: true } },
//     { $unwind: { path: "$Location", preserveNullAndEmptyArrays: true } },
//     { $unwind: { path: "$ContractData", preserveNullAndEmptyArrays: true } },
//     { $sort: { [sortField]: sortOrder } },
//     { $skip: pageNumber * pageSize },
//     { $limit: pageSize },
//     {
//       $project: {
//         VisitId: 1,
//         CompanyId: 1,
//         ContractId: 1,
//         WorkerId: 1,
//         CustomerId: 1,
//         ItemName: 1,
//         StartDate: 1,
//         StartTime: 1,
//         EndTime: 1,
//         EndDate: 1,
//         IsConfirm: 1,
//         ConfirmWorker: 1,
//         IsConfirmByWorker: 1,
//         LocationId: 1,
//         "AssignPerson.WorkerId": 1,
//         "AssignPerson.FullName": 1,
//         "Location.LocationId": 1,
//         "Location.Address": 1,
//         "Location.City": 1,
//         "Location.State": 1,
//         "Location.Country": 1,
//         "ContractData.ContractNumber": 1,
//       },
//     },
//   ];

//   const totalPipeline = [
//     { $match: visitSearchQuery },
//     { $count: "totalCount" },
//   ];

//   const totalResults = await Visits.aggregate(totalPipeline);
//   const totalCount = totalResults.length > 0 ? totalResults[0].totalCount : 0;
//   const visitData = await Visits.aggregate(pipeline);

//   return {
//     statusCode: visitData.length > 0 ? 200 : 204,
//     data: visitData,
//     totalCount,
//     totalPages: Math.ceil(totalCount / pageSize),
//     currentPage: pageNumber,
//     message:
//       visitData.length > 0 ? "Data fetched successfully." : "No visits found.",
//   };
// };
const getWorkerVisits = async (CompanyId, WorkerId, query) => {
  const pageSize = parseInt(query.pageSize) || 10;
  const pageNumber = parseInt(query.pageNumber) || 0;
  const search = query.search;
  const sortField = query.sortField || "StartDate";
  const sortOrder = query.sortOrder === "desc" ? -1 : 1;
  const statusFilter = query.statusFilter?.toLowerCase() || "all";

  let visitSearchQuery = {
    CompanyId,
    WorkerId,
    IsDelete: false,
  };

  if (statusFilter === "confirmed") {
    visitSearchQuery.IsConfirmByWorker = true;
  } else if (statusFilter === "pending") {
    visitSearchQuery.IsConfirmByWorker = false;
  }
  if (search) {
    const searchRegex = new RegExp(search, "i");
    visitSearchQuery = {
      ...visitSearchQuery,
      $or: [
        { StartDate: { $regex: searchRegex } },
        { ItemName: { $regex: searchRegex } },
        { "AssignPerson.FullName": { $regex: searchRegex } },
        { "Location.Address": { $regex: searchRegex } },
        { "Location.City": { $regex: searchRegex } },
        { "Location.State": { $regex: searchRegex } },
        { "Location.Country": { $regex: searchRegex } },
      ],
    };
  }

  const pipeline = [
    { $match: visitSearchQuery },
    {
      $lookup: {
        from: "workers",
        localField: "WorkerId",
        foreignField: "WorkerId",
        as: "AssignPerson",
      },
    },
    {
      $addFields: {
        AssignPerson: {
          $filter: {
            input: "$AssignPerson",
            as: "person",
            cond: { $eq: ["$$person.WorkerId", WorkerId] },
          },
        },
      },
    },
    {
      $lookup: {
        from: "locations",
        localField: "LocationId",
        foreignField: "LocationId",
        as: "Location",
      },
    },
    {
      $lookup: {
        from: "contracts",
        localField: "ContractId",
        foreignField: "ContractId",
        as: "ContractData",
      },
    },
    { $unwind: { path: "$AssignPerson", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$Location", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$ContractData", preserveNullAndEmptyArrays: true } },

    { $sort: { [sortField]: sortOrder } },
    { $skip: pageNumber * pageSize },
    { $limit: pageSize },
    {
      $project: {
        VisitId: 1,
        CompanyId: 1,
        ContractId: 1,
        WorkerId: 1,
        CustomerId: 1,
        ItemName: 1,
        StartDate: 1,
        StartTime: 1,
        EndTime: 1,
        EndDate: 1,
        IsConfirm: 1,
        ConfirmWorker: 1,
        IsConfirmByWorker: 1,
        LocationId: 1,
        IsComplete: 1,
        ConfirmComplete: 1,
        "AssignPerson.WorkerId": 1,
        "AssignPerson.FullName": 1,
        "Location.LocationId": 1,
        "Location.Address": 1,
        "Location.City": 1,
        "Location.State": 1,
        "Location.Country": 1,
        "ContractData.ContractNumber": 1,
      },
    },
  ];

  const totalPipeline = [
    { $match: visitSearchQuery },
    { $count: "totalCount" },
  ];

  try {
    const totalResults = await Visits.aggregate(totalPipeline);
    const totalCount = totalResults.length > 0 ? totalResults[0].totalCount : 0;
    const visitData = await Visits.aggregate(pipeline);

    return {
      statusCode: visitData.length > 0 ? 200 : 204,
      data: visitData,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: pageNumber,
      message:
        visitData.length > 0
          ? "Data fetched successfully."
          : "No visits found.",
    };
  } catch (error) {
    console.error("Error in getWorkerVisits:", error);
    throw new Error("Database query failed");
  }
};

router.get(
  "/worker_visits/:CompanyId/:WorkerId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { CompanyId, WorkerId } = req.params;
      const query = req.query;
      query.sortField = "StartDate";
      query.sortOrder = "asc";
      const result = await getWorkerVisits(CompanyId, WorkerId, query);

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

//-------------------------------GET VISITS DATA----------------------------------------

const getVisitsData = async (VisitId, ContractId) => {
  if (!VisitId || !ContractId) {
    return {
      statusCode: 400,
      message: "VisitId and ContractId are required!",
    };
  }

  const labourData = await Visits.findOne({
    VisitId,
    ContractId,
    IsDelete: false,
  });

  if (!labourData) {
    return {
      statusCode: 404,
      message: "No data found for the given VisitId and ContractId.",
    };
  }

  return {
    statusCode: 200,
    data: labourData,
    message: "Data retrieved successfully.",
  };
};
//5206 code end
router.get(
  "/visits/:VisitId/:ContractId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { VisitId, ContractId } = req.params;
      const result = await getVisitsData(VisitId, ContractId);
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

//-------------------------------CUSTOMER VISIT GET DATA----------------------------------------

// const getCustomerVisitsData = async (VisitId, ContractId) => {
//   if (!VisitId || !ContractId) {
//     return {
//       statusCode: 400,
//       message: "VisitId and ContractId are required!",
//     };
//   }

//   const labourData = await Visits.findOne({
//     VisitId,
//     ContractId,
//     IsDelete: false,
//   });

//   if (!labourData) {
//     return {
//       statusCode: 404,
//       message: "No data found for the given VisitId and ContractId.",
//     };
//   }

//   const contractData = await Contract.findOne({ ContractId });

//   if (!contractData) {
//     return {
//       statusCode: 404,
//       message: "Contract not found for the given ContractId.",
//     };
//   }

//   const resultWithLocation = [];
//   const locationData = await Location.findOne({
//     LocationId: labourData?.LocationId,
//   });
//   if (locationData) {
//     resultWithLocation.push({
//       ...labourData.toObject(),
//       Location: locationData.toObject(),
//       ContractNumber: contractData.ContractNumber,
//     });
//   } else {
//     resultWithLocation.push({
//       ...labourData.toObject(),
//       Location: "Location not found",
//       ContractNumber: contractData.ContractNumber,
//     });
//   }

//   return {
//     statusCode: 200,
//     data: resultWithLocation,
//     message: "Data retrieved successfully.",
//   };
// };
// //5206 code end

// router.get("/customervisits/:VisitId/:ContractId", async (req, res) => {
//   try {
//     const { VisitId, ContractId } = req.params;
//     const result = await getCustomerVisitsData(VisitId, ContractId);
//     return res.status(result.statusCode).json(result);
//   } catch (error) {
//     console.error(error.message);
//     return res.status(500).json({
//       statusCode: 500,
//       message: "Something went wrong, please try later!",
//     });
//   }
// });
const getCustomerVisitsData = async (VisitId, ContractId) => {
  if (!VisitId || !ContractId) {
    return {
      statusCode: 400,
      message: "VisitId and ContractId are required!",
    };
  }

  const result = await Visits.aggregate([
    {
      $match: {
        VisitId: VisitId,
        ContractId: ContractId,
        IsDelete: false,
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
      $lookup: {
        from: "contracts",
        localField: "ContractId",
        foreignField: "ContractId",
        as: "contractData",
      },
    },
    {
      $unwind: {
        path: "$locationData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: "$contractData",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        _id: 1,
        VisitId: 1,
        ContractId: 1,
        CompanyId: 1,
        CustomerId: 1,
        LocationId: 1,
        WorkerId: 1,
        ItemName: 1,
        Note: 1,
        StartDate: 1,
        StartTime: 1,
        EndDate: 1,
        EndTime: 1,
        IsConfirm: 1,
        IsConfirmByWorker: 1,
        ConfirmWorker: 1,
        IsDelete: 1,
        createdAt: 1,
        updatedAt: 1,
        IsComplete: 1,
        ConfirmComplete: 1,
        Location: {
          $cond: {
            if: { $ifNull: ["$locationData", null] },
            then: {
              _id: "$locationData._id",
              CustomerId: "$locationData.CustomerId",
              CompanyId: "$locationData.CompanyId",
              LocationId: "$locationData.LocationId",
              Address: "$locationData.Address",
              City: "$locationData.City",
              State: "$locationData.State",
              Zip: "$locationData.Zip",
              Country: "$locationData.Country",
              IsDelete: "$locationData.IsDelete",
              createdAt: "$locationData.createdAt",
              updatedAt: "$locationData.updatedAt",
            },
            else: "Location not found",
          },
        },
        ContractNumber: "$contractData.ContractNumber",
      },
    },
  ]);

  if (!result || !result.length) {
    return {
      statusCode: 404,
      message: "No data found for the given VisitId and ContractId.",
    };
  }

  return {
    statusCode: 200,
    data: result,
    message: "Data retrieved successfully.",
  };
};

router.get(
  "/customervisits/:VisitId/:ContractId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { VisitId, ContractId } = req.params;
      const result = await getCustomerVisitsData(VisitId, ContractId);
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

//-------------------------WORKER VISITS GET--------------------------------------

const getWorkerVisitsData = async (
  VisitId,
  ContractId,
  WorkerId,
  CompanyId
) => {
  if (!VisitId || !ContractId || !WorkerId || !CompanyId) {
    return {
      statusCode: 400,
      message: "VisitId, ContractId, WorkerId, and CompanyId are required!",
    };
  }

  const result = await Visits.aggregate([
    {
      $match: {
        VisitId: VisitId,
        ContractId: ContractId,
        WorkerId: WorkerId,
        CompanyId: CompanyId,
        IsDelete: false,
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
        _id: 1,
        VisitId: 1,
        ContractId: 1,
        CompanyId: 1,
        CustomerId: 1,
        LocationId: 1,
        WorkerId: 1,
        ItemName: 1,
        Note: 1,
        StartDate: 1,
        StartTime: 1,
        EndDate: 1,
        EndTime: 1,
        IsConfirm: 1,
        IsConfirmByWorker: 1,
        ConfirmWorker: 1,
        IsDelete: 1,
        IsComplete: 1,
        createdAt: 1,
        updatedAt: 1,
        Location: {
          $cond: {
            if: { $ifNull: ["$locationData", null] },
            then: {
              _id: "$locationData._id",
              CustomerId: "$locationData.CustomerId",
              CompanyId: "$locationData.CompanyId",
              LocationId: "$locationData.LocationId",
              Address: "$locationData.Address",
              City: "$locationData.City",
              State: "$locationData.State",
              Zip: "$locationData.Zip",
              Country: "$locationData.Country",
              IsDelete: "$locationData.IsDelete",
              createdAt: "$locationData.createdAt",
              updatedAt: "$locationData.updatedAt",
            },
            else: "Location not found",
          },
        },
      },
    },
  ]);

  if (!result || !result.length) {
    return {
      statusCode: 404,
      message:
        "No data found for the given VisitId, ContractId, WorkerId, and CompanyId.",
    };
  }

  return {
    statusCode: 200,
    data: result,
    message: "Data retrieved successfully.",
  };
};

router.get(
  "/workervisits/:VisitId/:ContractId/:WorkerId/:CompanyId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { VisitId, ContractId, WorkerId, CompanyId } = req.params;
      const result = await getWorkerVisitsData(
        VisitId,
        ContractId,
        WorkerId,
        CompanyId
      );
      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Error in /workervisits route:", error.message);
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//-------------------------------GET SCHEDULE DATA----------------------------------------

const getContractScheduleData = async (CompanyId) => {
  try {
    const contracts = await Visits.aggregate([
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
          as: "CustomerData",
        },
      },
      // {
      //   $lookup: {
      //     from: "visits",
      //     localField: "ContractId",
      //     foreignField: "ContractId",
      //     as: "contractData",
      //   },
      // },
      {
        $lookup: {
          from: "locations",
          localField: "LocationId",
          foreignField: "LocationId",
          as: "LocationData",
        },
      },
      {
        $unwind: {
          path: "$CustomerData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$LocationData",
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //   $unwind: {
      //     path: "$contractData",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
      {
        $project: {
          ItemName: 1,
          Note: 1,
          VisitId: 1,
          ContractId: 1,
          StartDate: 1,
          StartTime: 1,
          Status: 1,
          // ContractId: "$contractData.ContractId",
          // ContractNumber: "$contractData.ContractNumber",
          FirstName: "$CustomerData.FirstName",
          LastName: "$CustomerData.LastName",
          Address: "$LocationData.Address",
          City: "$LocationData.City",
          State: "$LocationData.State",
          Zip: "$LocationData.Zip",
          Country: "$LocationData.Country",
          // Visits: 1,
        },
      },
    ]);
    return {
      statusCode: 200,
      data: contracts,
      message: "Read All Contracts and Visits",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Something went wrong, please try later!",
    };
  }
};

router.get("/visit-schedule/:CompanyId", async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const result = await getContractScheduleData(CompanyId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------GET WORKER DATA----------------------------------------

const getWorkerVisitsDatas = async (VisitId, WorkerId) => {
  if (!VisitId || !WorkerId) {
    return {
      statusCode: 400,
      message: "VisitId, ContractId, WorkerId  are required!",
    };
  }

  const visitData = await Visits.aggregate([
    {
      $match: {
        VisitId: VisitId,

        WorkerId: WorkerId,
        IsDelete: false,
      },
    },
    {
      $lookup: {
        from: "locations",
        localField: "LocationId",
        foreignField: "LocationId",
        as: "LocationData",
      },
    },
    {
      $lookup: {
        from: "contractitems",
        localField: "ContractId",
        foreignField: "ContractId",
        as: "ContractItemData",
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "CustomerId",
        foreignField: "CustomerId",
        as: "CustomerData",
      },
    },
    {
      $lookup: {
        from: "contracts",
        localField: "ContractId",
        foreignField: "ContractId",
        as: "ContractData",
      },
    },
    {
      $unwind: {
        path: "$LocationData",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  if (!visitData || visitData.length === 0) {
    return {
      statusCode: 404,
      message: "No data found for the given VisitId, ContractId, WorkerId.",
    };
  }

  const resultWithLocation = visitData[0];

  return {
    statusCode: 200,
    data: resultWithLocation,
    message: "Data retrieved successfully.",
  };
};

router.get(
  "/workervisits/:VisitId/:WorkerId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { VisitId, WorkerId } = req.params;
      const result = await getWorkerVisitsDatas(VisitId, WorkerId);

      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Error in /workervisits route:", error.message);
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//-------------------------------PUT DATA----------------------------------------

router.put(
  "/confirm/:VisitId/:ContractId",
  verifyLoginToken,
  async (req, res) => {
    const { VisitId, ContractId } = req.params;
    const updateData = req.body;

    try {
      const updatedVisit = await Visits.findOneAndUpdate(
        { VisitId, ContractId, IsDelete: false },
        {
          $set: {
            IsConfirm: true,
            updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
          },
        },
        { new: true, runValidators: true }
      );

      if (!updatedVisit) {
        return res.status(404).json({
          statusCode: 404,
          message: "Visit not found.",
        });
      }

      await addNotification({
        CompanyId: updateData.CompanyId,
        ContractId: updateData.ContractId,
        VisitId: updateData.VisitId,
        CustomerId: updateData.CustomerId,
        CreatedBy: "confirm",
        AddedAt: updateData.AddedAt,
      });

      await Activities.create({
        ActivityId: `${Date.now()}`,
        CompanyId: req.tokenData.CompanyId,
        Action: "UPDATE",
        Entity: "Appointment Confirm By Customer",
        EntityId: VisitId,
        ActivityBy: req.Role,
        ActivityByUsername: req.userName,
        Activity: {
          description: `Updated an Appointment`,
        },
        Reason: "Appointment confirm",
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
      return res.status(200).json({
        statusCode: 200,
        message: "Visit updated successfully.",
        data: updatedVisit,
        // notification: notificationResult,
      });
    } catch (error) {
      console.error("Error updating visit:", error.message);
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//-------------------------------PUT CONFIRMBYWORKER DATA----------------------------------------

router.put("/ConfirmByWorker/:VisitId/:ContractId", async (req, res) => {
  const { VisitId, ContractId } = req.params;
  const updateData = req.body;

  try {
    const updatedVisit = await Visits.findOneAndUpdate(
      { VisitId, ContractId, IsDelete: false },
      {
        $set: {
          IsConfirmByWorker: true,
          IsConfirm: true,
          updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        },
        $addToSet: { ConfirmWorker: updateData.WorkerId },
      },
      { new: true, runValidators: true }
    );

    if (!updatedVisit) {
      return res.status(404).json({
        statusCode: 404,
        message: "Visit not found.",
      });
    }

    const latestWorkerId =
      updatedVisit.ConfirmWorker[updatedVisit.ConfirmWorker.length - 1];

    const notificationData = {
      ContractId,
      VisitId,
      WorkerId: latestWorkerId,
      CompanyId: updateData.companyId,
      CreatedBy: "Worker",
      AddedAt: updateData.AddedAt,
    };

    await addNotification(notificationData);

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: req.CompanyId,
      Action: "UPDATE",
      Entity: "Appointment Confirm By Worker",
      EntityId: VisitId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Updated an Appointment date is ${updatedVisit.StartDate}`,
      },
      Reason: "Appointment confirm",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return res.status(200).json({
      statusCode: 200,
      message: "Visit confirmed successfully.",
      data: updatedVisit,
    });
  } catch (error) {
    console.error("Error confirming visit:", error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});
router.put(
  "/ConfirmComplete/:VisitId/:ContractId",

  async (req, res) => {
    const { VisitId, ContractId } = req.params;
    const updateData = req.body;

    try {
      const updatedVisit = await Visits.findOneAndUpdate(
        {
          VisitId,
          ContractId,
          IsDelete: false,
        },
        {
          $set: {
            IsComplete: true,
          },
          $addToSet: { ConfirmComplete: updateData.WorkerId },
        },
        { new: true } // Ensure the updated document is returned
      );

      const latestWorkerId =
        updatedVisit.ConfirmComplete[updatedVisit.ConfirmComplete.length - 1];

      if (!updatedVisit) {
        return res.status(404).json({
          statusCode: 404,
          message: "Visit not found.",
        });
      }

      // const notificationData = {
      //   ContractId,
      //   VisitId,
      //   WorkerId: updateData.WorkerId,
      //   CompanyId: updateData.companyId,
      //   CreatedBy: "Worker",
      //   AddedAt: updateData.AddedAt,
      // };

      // await addNotification(notificationData);

      await Activities.create({
        ActivityId: `${Date.now()}`,
        CompanyId: req.CompanyId,
        Action: "UPDATE",
        Entity: "Appointment Confirm By Worker",
        EntityId: VisitId,
        ActivityBy: req.Role,
        ActivityByUsername: req.userName,
        Activity: {
          description: `Updated an Appointment date is ${updatedVisit.StartDate}`,
        },
        Reason: "Appointment confirm",
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      return res.status(200).json({
        statusCode: 200,
        message: "Visit confirmed successfully.",
        data: updatedVisit,
      });
    } catch (error) {
      console.error("Error confirming visit:", error.message);
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);
//-------------------------------PUT DATA----------------------------------------

router.put("/:VisitId/:ContractId", verifyLoginToken, async (req, res) => {
  const { VisitId, ContractId } = req.params;
  const { WorkerId, ...updateData } = req.body;

  try {
    let assignPersonArray = WorkerId;
    if (!Array.isArray(assignPersonArray)) {
      assignPersonArray = [WorkerId];
    }

    const updatedVisit = await Visits.findOneAndUpdate(
      { VisitId, ContractId },
      {
        $set: {
          ...updateData,
          WorkerId: assignPersonArray,
          updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedVisit) {
      return res.status(404).json({
        statusCode: 404,
        message: "Visit not found.",
      });
    }
    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: req.CompanyId,
      Action: "UPDATE",
      Entity: "Visit",
      EntityId: VisitId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Updated a Visit ${updateData.ItemName} `,
      },
      Reason: "Visit updating",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return res.status(200).json({
      statusCode: 200,
      message: "Visit updated successfully.",
      data: updatedVisit,
    });
  } catch (error) {
    console.error("Error during update:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------DELETE DATA----------------------------------------

const deleteVisitData = async (VisitId, ContractId, DeleteReason, req) => {
  try {
    const updatedVisit = await Visits.findOneAndUpdate(
      { VisitId, ContractId },
      {
        $set: {
          IsDelete: true,
          DeleteReason,
          updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedVisit) {
      return {
        statusCode: 404,
        message: `No Visit found `,
      };
    }
    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: req.CompanyId,
      Action: "DELETE",
      Entity: "Visit",
      EntityId: updatedVisit.VisitId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Deleted a Visit ${updatedVisit.ItemName}`,
      },
      Reason: req.body.DeleteReason,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      message: `Visit deleted successfully.`,
      data: updatedVisit,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Failed to soft delete Visit data.",
      error: error.message,
    };
  }
};
router.delete("/:VisitId/:ContractId", verifyLoginToken, async (req, res) => {
  try {
    const { DeleteReason } = req.body;
    const { VisitId, ContractId } = req.params;
    const response = await deleteVisitData(
      VisitId,
      ContractId,
      DeleteReason,
      req
    );
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//5206 code end

module.exports = router;

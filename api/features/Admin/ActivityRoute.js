const express = require("express");
const router = express.Router();
const Activities = require("./ActivitiesModel");

// const getActivities = async (CompanyId, query) => {
//   const pageSize = parseInt(query.pageSize, 10) || 10;
//   const pageNumber = parseInt(query.pageNumber, 10) || 0;
//   const sortField = query.sortField || "createdAt";
//   const sortOrder = query.sortOrder === "desc" ? -1 : 1;
//   const search = query.search ? query.search.trim() : null;

//   let sortOptions = {};
//   sortOptions[sortField] = sortField === "createdAt" ? -1 : sortOrder;

//   const matchQuery = { CompanyId };

//   if (search) {
//     const searchRegex = new RegExp(search, "i");
//     matchQuery.$or = [
//       { Action: { $regex: searchRegex } },
//       { ActivityBy: { $regex: searchRegex } },
//       { ActivityByUsername: { $regex: searchRegex } },
//       { Entity: { $regex: searchRegex } },
//       { Activity: { $regex: searchRegex } },
//     ];
//   }

//   try {
//     const totalRecords = await Activities.countDocuments(matchQuery);

//     const activityData = await Activities.aggregate([
//       { $match: matchQuery },
//       { $sort: sortOptions },
//       { $skip: pageSize * pageNumber },
//       { $limit: pageSize },
//     ]);

//     return {
//       statusCode: activityData.length > 0 ? 200 : 204,
//       data: activityData,
//       totalRecords,
//       totalPages: Math.ceil(totalRecords / pageSize),
//       currentPage: pageNumber,
//       message:
//         activityData.length > 0
//           ? "Activities retrieved successfully"
//           : "No activities found",
//     };
//   } catch (error) {
//     console.error("Error in getActivities:", error);
//     throw new Error("Database query failed");
//   }
// };

// const getActivities = async (CompanyId, query) => {
//   const pageSize = parseInt(query.pageSize, 10) || 10;
//   const pageNumber = parseInt(query.pageNumber, 10) || 0;
//   const sortField = query.sortField || "createdAt";
//   const sortOrder = query.sortOrder === "desc" ? -1 : 1;
//   const actionFilter = query.actionFilter?.toLowerCase() || "all";
//   const search = query.search ? query.search.trim() : null;

//   const matchQuery = { CompanyId, IsDelete: false };

//   if (actionFilter !== "all") {
//     matchQuery.Action = { $regex: new RegExp(`^${actionFilter}`, "i") };
//   }

//   if (search) {
//     const searchRegex = new RegExp(search, "i");
//     matchQuery.$or = [
//       { Action: { $regex: searchRegex } },
//       { ActivityBy: { $regex: searchRegex } },
//       { ActivityByUsername: { $regex: searchRegex } },
//       { Entity: { $regex: searchRegex } },
//       { Activity: { $regex: searchRegex } },
//     ];
//   }

//   try {
//     const totalRecords = await Activities.countDocuments(matchQuery);

//     const activityData = await Activities.aggregate([
//       { $match: matchQuery },

//       {
//         $addFields: {
//           actionWeight: {
//             $switch: {
//               branches: [
//                 { case: { $eq: ["$Action", "Add"] }, then: 1 },
//                 { case: { $eq: ["$Action", "CREATE"] }, then: 2 },
//                 { case: { $eq: ["$Action", "UPDATE"] }, then: 3 },
//                 { case: { $eq: ["$Action", "DELETE"] }, then: 4 },
//               ],
//               default: 5,
//             },
//           },
//         },
//       },

//       {
//         $sort: {
//           ...(sortField === "Action" ? { actionWeight: sortOrder } : {}),
//           [sortField]: sortOrder,
//         },
//       },

//       { $skip: pageSize * pageNumber },
//       { $limit: pageSize },

//       {
//         $project: {
//           actionWeight: 0,
//         },
//       },
//     ]);

//     return {
//       statusCode: activityData.length > 0 ? 200 : 204,
//       data: activityData,
//       totalRecords,
//       totalPages: Math.ceil(totalRecords / pageSize),
//       currentPage: pageNumber,
//       message:
//         activityData.length > 0
//           ? "Activities retrieved successfully"
//           : "No activities found",
//     };
//   } catch (error) {
//     console.error("Error in getActivities:", error);
//     throw new Error("Database query failed");
//   }
// };

// router.get("/:CompanyId", async (req, res) => {
//   const { CompanyId } = req.params;
//   const query = req.query;

//   try {
//     const result = await getActivities(CompanyId, query);
//     return res.status(result.statusCode).json(result);
//   } catch (error) {
//     console.error("Error in API:", error.message);
//     return res.status(500).json({
//       statusCode: 500,
//       message: "Something went wrong, please try later!",
//     });
//   }
// });

const getActivities = async (CompanyId, query) => {
  const pageSize = parseInt(query.pageSize, 10) || 10;
  const pageNumber = parseInt(query.pageNumber, 10) || 0;
  const sortField = query.sortField || "createdAt";
  const sortOrder = query.sortOrder === "desc" ? -1 : 1;
  const actionFilter = query.actionFilter?.toLowerCase() || "all";
  const search = query.search ? query.search.trim() : null;

  const matchQuery = { CompanyId, IsDelete: false };

  if (actionFilter !== "all") {
    matchQuery.Action = { $regex: new RegExp(`^${actionFilter}`, "i") };
  }

  if (search) {
    const searchRegex = new RegExp(search, "i");
    matchQuery.$or = [
      { Action: { $regex: searchRegex } },
      { ActivityBy: { $regex: searchRegex } },
      { ActivityByUsername: { $regex: searchRegex } },
      { Entity: { $regex: searchRegex } },
      { Activity: { $regex: searchRegex } },
    ];
  }

  try {
    const totalRecords = await Activities.countDocuments(matchQuery);

    const activityData = await Activities.aggregate([
      { $match: matchQuery },

      {
        $addFields: {
          // createdAtDate: { $toDate: "$createdAt" },
          actionWeight: {
            $switch: {
              branches: [
                { case: { $eq: ["$Action", "Add"] }, then: 1 },
                { case: { $eq: ["$Action", "CREATE"] }, then: 2 },
                { case: { $eq: ["$Action", "UPDATE"] }, then: 3 },
                { case: { $eq: ["$Action", "DELETE"] }, then: 4 },
              ],
              default: 5,
            },
          },
        },
      },

      {
        $sort: {
          createdAt: -1,
          ...(sortField === "Action" ? { actionWeight: sortOrder } : {}),
        },
      },

      { $skip: pageSize * pageNumber },
      { $limit: pageSize },

      {
        $project: {
          actionWeight: 0,
          // createdAtDate: 0,
        },
      },
    ]);

    return {
      statusCode: activityData.length > 0 ? 200 : 204,
      data: activityData,
      totalRecords,
      totalPages: Math.ceil(totalRecords / pageSize),
      currentPage: pageNumber,
      message:
        activityData.length > 0
          ? "Activities retrieved successfully"
          : "No activities found",
    };
  } catch (error) {
    console.error("Error in getActivities:", error);
    throw new Error("Database query failed");
  }
};

router.get("/:CompanyId", async (req, res) => {
  const { CompanyId } = req.params;
  const query = req.query;

  try {
    const result = await getActivities(CompanyId, query);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error in API:", error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

module.exports = router;

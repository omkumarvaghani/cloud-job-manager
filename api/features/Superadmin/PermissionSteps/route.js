var express = require("express");
var router = express.Router();
const moment = require("moment");
const PermissionSteps = require("./model");
const { verifyLoginToken } = require("../../../authentication");
const {
  validatePermissionStepsBody,
  permissionStepsValidationSchema,
} = require("./validation");

const setTimestamps = () => ({
  createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
  updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
});

const findPermissionByTitle = async (title) => {
  return await PermissionSteps.findOne({
    Title: {
      $regex: new RegExp("^" + title + "$", "i"),
    },
  });
};

const addPermissionStep = async (req) => {
  const findTitle = await findPermissionByTitle(req.body.Title);

  if (!findTitle) {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;
    req.body["PermissionId"] = uniqueId;
    Object.assign(req.body, setTimestamps());

    const data = await PermissionSteps.create(req.body);
    return {
      statusCode: 200,
      message: "PermissionSteps added successfully.",
      data: data,
    };
  } else {
    return {
      statusCode: 201,
      message: `${req.body.Title} is already added.`,
    };
  }
};

router.post(
  "/",
  verifyLoginToken,
  validatePermissionStepsBody(permissionStepsValidationSchema),
  async (req, res) => {
    try {
      const result = await addPermissionStep(req);
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

//-------------------------------------------------------------------------------------

// Get Permission (Superadmin)
// const getPermissionSteps = async (queryParams) => {
//   const pageSize = parseInt(queryParams.pageSize) || 10;
//   const pageNumber = parseInt(queryParams.pageNumber) || 0;
//   const searchQuery = queryParams.search;
//   const sortOrder = query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;

//   const allowedSortFields = ["Title", "Description", "updatedAt", "createdAt"];

//   const sortField = allowedSortFields.includes(query.sortField)
//     ? query.sortField
//     : "updatedAt";
//   const collation = { locale: "en", strength: 2 };
//   let query = { IsDelete: false };
//   if (searchQuery) {
//     //5206 code start: "Search filter all permission get deleted also"
//     query.$and = [
//       { IsDelete: false },
//       {
//         $or: [
//           { Title: { $regex: searchQuery, $options: "i" } },
//           { Description: { $regex: searchQuery, $options: "i" } },
//         ],
//       },
//     ];
//   }
//   //5206 code end: "Search filter all permission get deleted also"

//   // let sortOptions = {};
//   // if (sortField) {
//   //   sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
//   // }

//   const sortOptions = {
//     [sortField]: sortOrder,
//   };

//   const totalDataCount = await PermissionSteps.countDocuments(query);
//   const data = await PermissionSteps.find(query)
//     .sort(sortOptions)
//     .skip(pageNumber * pageSize)
//     .limit(pageSize);

//   return {
//     statusCode: 200,
//     data,
//     count: totalDataCount,
//   };
// };

// router.get("/", verifyLoginToken, async (req, res) => {
//   try {
//     const result = await getPermissionSteps(req.query);
//     query.sortField = query.sortField || "updatedAt";
//     query.sortOrder = query.sortOrder || "desc";
//     return res.status(result.statusCode).json(result);
//   } catch (error) {
//     console.error(error.message);
//     return res.status(500).json({
//       statusCode: 500,
//       message: "Something went wrong, please try later!",
//     });
//   }
// });

const getPermissionSteps = async (queryParams) => {
  const pageSize = parseInt(queryParams.pageSize) || 10;
  const pageNumber = parseInt(queryParams.pageNumber) || 0;
  const searchQuery = queryParams.search;
  const sortOrder = queryParams.sortOrder?.toLowerCase() === "desc" ? -1 : 1;

  const allowedSortFields = ["Title", "Description", "updatedAt", "createdAt"];

  const sortField = allowedSortFields.includes(queryParams.sortField)
    ? queryParams.sortField
    : "updatedAt";

  const collation = { locale: "en", strength: 2 };
  let query = { IsDelete: false };

  if (searchQuery) {
    query.$and = [
      { IsDelete: false },
      {
        $or: [
          { Title: { $regex: searchQuery, $options: "i" } },
          { Description: { $regex: searchQuery, $options: "i" } },
        ],
      },
    ];
  }

  const sortOptions = {
    [sortField]: sortOrder,
  };

  const totalDataCount = await PermissionSteps.countDocuments(query);
  const data = await PermissionSteps.find(query)
    .sort(sortOptions)
    .skip(pageNumber * pageSize)
    .limit(pageSize)
    .collation(collation);

  return {
    statusCode: 200,
    data,
    count: totalDataCount,
  };
};

router.get("/", verifyLoginToken, async (req, res) => {
  try {
    const result = await getPermissionSteps(req.query);

    req.query.sortField = req.query.sortField || "updatedAt";
    req.query.sortOrder = req.query.sortOrder || "desc";

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

// Update Permission (Superadmin)
const updatePermissionStep = async (PermissionId, updateData) => {
  updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  const existingTitle = await findPermissionByTitle(updateData.Title);
  if (existingTitle && PermissionId !== existingTitle.PermissionId) {
    return {
      statusCode: 201,
      message: `${updateData.Title} name already exists`,
    };
  }

  const result = await PermissionSteps.findOneAndUpdate(
    { PermissionId: PermissionId },
    { $set: updateData },
    { new: true }
  );

  if (result) {
    return {
      statusCode: 200,
      message: "Permission updated successfully",
    };
  } else {
    return {
      statusCode: 404,
      message: "Permission not found",
    };
  }
};

router.put("/:PermissionId", verifyLoginToken, async (req, res) => {
  try {
    const { PermissionId } = req.params;
    const updateData = req.body;

    const result = await updatePermissionStep(PermissionId, updateData);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

// Delete Permission (Superadmin)
const deletePermissionStep = async (PermissionId) => {
  const result = await PermissionSteps.findOneAndUpdate(
    { PermissionId: PermissionId },
    { $set: { IsDelete: true } },
    { new: true }
  );

  if (result) {
    return {
      statusCode: 200,
      message: "Permission Deleted Successfully",
    };
  } else {
    return {
      statusCode: 201,
      message: "Data not found",
    };
  }
};

router.delete("/:PermissionId", verifyLoginToken, async (req, res) => {
  try {
    const { PermissionId } = req.params;

    const result = await deletePermissionStep(PermissionId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

// Get Permission (Company)
const getPermissionStep = async (PermissionId) => {
  const permission = await PermissionSteps.findOne({
    PermissionId,
    IsDelete: false,
  });

  if (permission) {
    return {
      statusCode: 200,
      message: "PermissionStep retrieved successfully",
      data: permission,
    };
  } else {
    return {
      statusCode: 201,
      message: "No permission step found",
    };
  }
};
router.get("/get/:PermissionId", async (req, res) => {
  try {
    const { PermissionId } = req.params;

    const result = await getPermissionStep(PermissionId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

// Get All Permission (Company)
const getAllPermissionSteps = async () => {
  const permissionSteps = await PermissionSteps.find({
    IsDelete: false,
  }).select(
    "-_id -updatedAt -createdAt -UpdatedAt -CreatedAt -__v -IsDelete -PermissionId"
  );

  if (permissionSteps.length === 0) {
    return {
      statusCode: 200,
      message: "Permission steps not found or already deleted",
    };
  }

  const formattedSteps = permissionSteps.map((item) => {
    const permissions = Object.entries(item.toObject()).filter(
      ([key]) => key !== "Title" && key !== "Description"
    );     

    return {
      Title: item.Title,
      Description: item.Description,
      permissions: Object.fromEntries(permissions),
    };
  });

  return {
    statusCode: 200,
    message: "Permission steps retrieved successfully",
    data: formattedSteps,
  };
};

router.get("/get", async (req, res) => {
  try {
    const result = await getAllPermissionSteps();
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

module.exports = router;

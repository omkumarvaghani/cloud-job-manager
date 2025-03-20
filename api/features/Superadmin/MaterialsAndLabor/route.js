var express = require("express");
var router = express.Router();
var MaterialsAndLabor = require("./model");
const moment = require("moment");
const { verifyLoginToken } = require("../../../authentication");
const Activities = require("../../Admin/ActivitiesModel");
const { addNotification } = require("../../Notification/notification");
const Notification = require("../../Notification/model");
const {
  validateMaterialsAndLaborBody,
  materialsAndLaborValidationSchema,
} = require("./validation");

// Post Product and Service (Superadmin && Company)
const handleMaterialsAndLabor = async (materialsAndLaborData, req) => {
  const {
    Name,
    Type,
    superAdminId,
    companyId,
    Cost,
    Markup,
    CostPerUnit,
    Attachment,
  } = materialsAndLaborData;
  const query = {
    Name: { $regex: new RegExp(`^${Name}$`, "i") },
    Type,
    IsDelete: false,
  };

  if (superAdminId) {
    query.IsSuperadminAdd = true;
  } else if (companyId) {
    query.IsSuperadminAdd = false;
    query.companyId = companyId;
  } else {
    return {
      statusCode: 400,
      message: "Either superAdminId or CompanyId must be provided",
    };
  }

  const existingProduct = await MaterialsAndLabor.findOne(query);

  if (!existingProduct) {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    const product = {
      ...materialsAndLaborData,
      ProductId: uniqueId,
      IsSuperadminAdd: !!superAdminId,
      createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
    };

    const data = await MaterialsAndLabor.create(product);
    if (req.Role !== "Superadmin") {
      await addNotification({
        CompanyId: req.body.companyId,
        ProductId: product.ProductId,
        CreatedBy: "MaterialsAndLabor",
        AddedAt: req.body.AddedAt,
      });
    }
    if (req.Role !== "Superadmin") {
      await Activities.create({
        ActivityId: `${Date.now()}`,
        CompanyId: req.CompanyId,
        Action: "CREATE",
        Entity: "Materials&Labour",
        EntityId: materialsAndLaborData.ProductId,
        ActivityBy: req.Role,
        ActivityByUsername: req.userName,
        Activity: {
          description: `Created a new ${materialsAndLaborData.Type}, Name:${materialsAndLaborData.Name}`,
        },
        Reason: "Materials&Labour creation",
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
    }
    return {
      statusCode: 200,
      message: "Product added successfully",
      data,
    };
  } else {
    return {
      statusCode: 201,
      message: `${Name} name already added`,
    };
  }
};
router.post("/", verifyLoginToken, async (req, res) => {
  try {
    const result = await handleMaterialsAndLabor(req.body, req);
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

// Get Product and Service (Superadmin)
const getMaterialsAndLabor = async (
  query,
  sortOptions,
  pageSize,
  pageNumber
) => {
  const totalDataCount = await MaterialsAndLabor.countDocuments(query);

  const data = await MaterialsAndLabor.find(query)
    .sort(sortOptions)
    .skip(pageNumber * pageSize)
    .limit(pageSize);

  return {
    statusCode: 200,
    data,
    count: totalDataCount,
  };
};

router.get("/", verifyLoginToken, async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const pageNumber = parseInt(req.query.pageNumber) || 0;
    const searchQuery = req.query.search;
    const sortField = req.query.sortField || "updatedAt";
    const sortOrder = req.query.sortOrder || "desc";

    let query = { IsDelete: false, IsSuperadminAdd: true };

    if (searchQuery) {
      query = {
        $or: [
          { Name: { $regex: searchQuery, $options: "i" } },
          { Description: { $regex: searchQuery, $options: "i" } },
          { Type: { $regex: searchQuery, $options: "i" } },
        ],
        IsDelete: false,
        IsSuperadminAdd: true,
      };
    }

    const sortOptions = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
    }

    const result = await getMaterialsAndLabor(
      query,
      sortOptions,
      pageSize,
      pageNumber
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

//-------------------------------------------------------------------------------------

// Put Product and Service (Superadmin)
const updateMaterialsAndLabor = async (productId, updateData, req) => {
  const { Name, Type } = updateData;

  updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  const existingProduct = await MaterialsAndLabor.findOne({
    Name: { $regex: new RegExp("^" + Name + "$", "i") },
    Type,
    IsSuperadminAdd: true,
    IsDelete: false,
  });

  if (existingProduct && productId !== existingProduct.ProductId) {
    return {
      statusCode: 201,
      message: `${Name} name already exists`,
    };
  }

  const result = await MaterialsAndLabor.findOneAndUpdate(
    { ProductId: productId, IsSuperadminAdd: true, IsDelete: false },
    { $set: updateData },
    { new: true }
  );

  if (req.Role !== "Superadmin") {
    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: req.CompanyId,
      Action: "UPDATE",
      Entity: "Materials&Labour",
      EntityId: updateData.ProductId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Updated a Materials&Labour #${updateData.Type} ${updateData.Name}`,
      },
      Reason: "Materials&Labour updating",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });
  }

  if (result) {
    return {
      statusCode: 200,
      message: "Product updated successfully",
    };
  } else {
    return {
      statusCode: 404,
      message: "Product not found",
    };
  }
};

router.put("/:ProductId", verifyLoginToken, async (req, res) => {
  try {
    const { ProductId } = req.params;
    const updateData = req.body;

    const result = await updateMaterialsAndLabor(ProductId, updateData, req);
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

// Delete Product and Service (Superadmin)
const deleteMaterialsAndLabor = async (productId, DeleteReason, req) => {
  const result = await MaterialsAndLabor.findOneAndUpdate(
    { ProductId: productId },
    { $set: { IsDelete: true, DeleteReason } },
    { new: true }
  );

  await Notification.updateMany(
    { ProductId: productId },
    { $set: { IsDelete: true } }
  );

  if (req.Role !== "Superadmin") {
    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: req.CompanyId,
      Action: "DELETE",
      Entity: "Materials&Labour",
      EntityId: result.ProductId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Deleted a ${result.Type} ${result.Name}`,
      },
      Reason: req.body.DeleteReason,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });
  }

  if (result) {
    return {
      statusCode: 200,
      message: "Materia & Labour deleted successfully",
    };
  } else {
    return {
      statusCode: 404,
      message: "Material & Labour not found",
    };
  }
};

router.delete("/:ProductId", verifyLoginToken, async (req, res) => {
  try {
    const { ProductId } = req.params;
    const { DeleteReason } = req.body;

    const result = await deleteMaterialsAndLabor(ProductId, DeleteReason, req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

// -------------------  Company  ----------------------------------------
// Put to Create Product and Service (Company)
const updateMaterialsAndLaborOrCreateAdminMaterialsAndLabor = async (
  productId,
  updateData,
  companyId,
  req
) => {
  updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  const existingProduct = await MaterialsAndLabor.findOne({
    ProductId: productId,
    IsDelete: false,
  });

  if (!existingProduct) {
    return {
      statusCode: 404,
      message: "Product not found",
    };
  }
  await Activities.create({
    ActivityId: `${Date.now()}`,
    CompanyId: req.CompanyId,
    Action: "UPDATE",
    Entity: "Materials&Labour",
    EntityId: updateData.ContractId,
    ActivityBy: req.Role,
    ActivityByUsername: req.userName,
    Activity: {
      description: `Updated a ${updateData.Type} Name that is ${updateData.Name}`,
    },
    Reason: "Materials&Labour updating",
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  });

  if (existingProduct.IsSuperadminAdd) {
    const adminProduct = await MaterialsAndLabor.findOne({
      CompanyId: companyId,
      ProductId: productId,
      IsSuperadminAdd: false,
      IsDelete: false,
    });

    if (adminProduct) {
      const updatedProduct = await MaterialsAndLabor.findOneAndUpdate(
        { ProductId: adminProduct.ProductId },
        { $set: updateData },
        { new: true }
      );

      return {
        statusCode: 200,
        message: "Product updated successfully",
      };
    } else {
      const newProduct = new MaterialsAndLabor({
        OldProductId: existingProduct.ProductId,
        CompanyId: companyId,
        ProductId: updateData.ProductId,
        Name: updateData.Name,
        Type: updateData.Type,
        ...updateData,
        createdAt: updateData.updatedAt,
        updatedAt: updateData.updatedAt,
        IsSuperadminAdd: false,
        IsDelete: false,
      });

      await newProduct.save();

      return {
        statusCode: 200,
        message: "Product created successfully",
      };
    }
  } else {
    const updatedProduct = await MaterialsAndLabor.findOneAndUpdate(
      { ProductId: existingProduct.ProductId },
      { $set: updateData },
      { new: true }
    );

    if (updatedProduct) {
      return {
        statusCode: 200,
        message: "Product updated successfully",
      };
    } else {
      return {
        statusCode: 404,
        message: "Product not found",
      };
    }
  }
};

router.put("/product/:ProductId", verifyLoginToken, async (req, res) => {
  try {
    const { ProductId } = req.params;
    const { CompanyId, Name, Type, ...rest } = req.body;

    // const timestamp = Date.now();
    // const uniqueId = `${timestamp}`;

    // req.body["ProductId"] = uniqueId;

    const result = await updateMaterialsAndLaborOrCreateAdminMaterialsAndLabor(
      ProductId,
      req.body,
      CompanyId,
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

//-------------------------------------------------------------------------------------

// Product Get from Company side in Table
// const getMaterialsAndLabors = async (companyId, queryParams) => {
//   const {
//     pageSize = 10,
//     pageNumber = 0,
//     searchQuery,
//     sortField = "updatedAt",
//     sortOrder = "dsc",
//     sortOptions,
//     selectedStatus,
//   } = queryParams;

//   // Initialize query with default structure
//   let query = {
//     $and: [
//       { IsDelete: false },
//       { $or: [{ companyId }, { IsSuperadminAdd: true }] },
//     ],
//   };

//   // Add search conditions if searchQuery exists
//   if (searchQuery) {
//     query.$and.push({
//       $or: [
//         { Type: { $regex: searchQuery, $options: "i" } },
//         { Name: { $regex: searchQuery, $options: "i" } },
//         { Description: { $regex: searchQuery, $options: "i" } },
//       ],
//     });
//   }

//   // Add selectedStatus conditions
//   if (selectedStatus) {
//     const statusCondition = {
//       Hourly: { Hourly: { $ne: null } },
//       Unit: { Unit: { $ne: null } },
//       SqFt: { Square: { $ne: null } },
//     }[selectedStatus];

//     if (statusCondition) {
//       query.$and.push(statusCondition);
//     }
//   }

//   // Remove $and if it's empty
//   if (query.$and.length === 0) {
//     delete query.$and;
//   }

//   // Build sort options
//   let sortOptionsField = {};
//   if (sortOptions === "Hourly") {
//     sortOptionsField["CostPerHour"] = sortOrder === "asc" ? 1 : -1;
//   } else if (sortOptions === "Unit") {
//     sortOptionsField["CostPerUnit"] = sortOrder === "asc" ? 1 : -1;
//   } else if (sortOptions === "SqFt") {
//     sortOptionsField["CostPerSquare"] = sortOrder === "asc" ? 1 : -1;
//   } else if (sortOptions === "Fixed") {
//     sortOptionsField["CostPerFixed"] = sortOrder === "asc" ? 1 : -1;
//   } else {
//     sortOptionsField[sortField] = sortOrder === "asc" ? 1 : -1;
//   }

//   // Query database
//   const allData = await MaterialsAndLabor.find(query)
//     .sort(sortOptionsField)
//     .skip(pageNumber * pageSize)
//     .limit(pageSize);

//   // Admin modified records mapping
//   const adminModifiedRecordsMap = new Map();
//   allData.forEach((item) => {
//     if (item.OldProductId && !item.IsSuperadminAdd) {
//       adminModifiedRecordsMap.set(item.OldProductId, item);
//     }
//   });

//   // Filter out admin-modified records
//   const filteredData = allData.filter((item) => {
//     if (item.IsSuperadminAdd) {
//       return !adminModifiedRecordsMap.has(item.ProductId);
//     }
//     return true;
//   });

//   // Get the total count of items
//   const totalItems = await MaterialsAndLabor.countDocuments(query);

//   return {
//     statusCode: totalItems > 0 ? 200 : 204,
//     data: filteredData,
//     count: totalItems,
//     message:
//       totalItems > 0 ? "Products retrieved successfully" : "No products found",
//   };
// };
const getMaterialsAndLabors = async (companyId, queryParams) => {
  const {
    pageSize = 10,
    pageNumber = 0,
    searchQuery,
    sortField = "updatedAt",
    sortOrder = "desc",
    selectedStatus,
  } = queryParams;

  const sortDirection = sortOrder?.toLowerCase() === "desc" ? -1 : 1;

  // Define allowed sort fields
  const allowedSortFields = [
    "Name",
    "Type",
    "Description",
    "CostPerHour",
    "CostPerUnit",
    "CostPerSquare",
    "CostPerFixed",
    "updatedAt",
    "createdAt",
  ];

  const sortOptionsField = allowedSortFields.includes(sortField)
    ? { [sortField]: sortDirection }
    : { updatedAt: -1 };

  let query = {
    $and: [
      { IsDelete: false },
      { $or: [{ companyId }, { IsSuperadminAdd: true }] },
    ],
  };

  // Add search conditions if searchQuery exists
  if (searchQuery) {
    const searchParts = searchQuery.split(" ").filter(Boolean);
    const searchConditions = searchParts.map((part) => {
      const searchRegex = new RegExp(part, "i");
      return {
        $or: [
          { Type: { $regex: searchRegex } },
          { Name: { $regex: searchRegex } },
          { Description: { $regex: searchRegex } },
        ],
      };
    });
    query.$and.push({ $and: searchConditions });
  }

  // Add selectedStatus conditions
  if (selectedStatus) {
    const statusCondition = {
      Hourly: { Hourly: { $ne: null } },
      Unit: { Unit: { $ne: null } },
      SqFt: { Square: { $ne: null } },
    }[selectedStatus];

    if (statusCondition) {
      query.$and.push(statusCondition);
    }
  }

  if (query.$and.length === 0) {
    delete query.$and;
  }
  const collation = { locale: "en", strength: 2 };

  const allData = await MaterialsAndLabor.find(query)
    .sort(sortOptionsField)
    .skip(pageNumber * pageSize)
    .limit(pageSize)
    .collation(collation);

  const adminModifiedRecordsMap = new Map();
  allData.forEach((item) => {
    if (item.OldProductId && !item.IsSuperadminAdd) {
      adminModifiedRecordsMap.set(item.OldProductId, item);
    }
  });

  const filteredData = allData.filter((item) => {
    if (item.IsSuperadminAdd) {
      return !adminModifiedRecordsMap.has(item.ProductId);
    }
    return true;
  });

  const totalItems = await MaterialsAndLabor.countDocuments(query);

  return {
    statusCode: totalItems > 0 ? 200 : 204,
    data: filteredData,
    count: totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
    currentPage: pageNumber,
    message:
      totalItems > 0 ? "Products retrieved successfully" : "No products found",
  };
};

router.get("/get/:companyId", verifyLoginToken, async (req, res) => {
  try {
    const { companyId } = req.params;
    const queryParams = {
      pageSize: parseInt(req.query.pageSize) || 10,
      pageNumber: parseInt(req.query.pageNumber) || 0,
      searchQuery: req.query.search,
      sortField: req.query.sortField,
      sortOrder: req.query.sortOrder,
      selectedStatus: req.query.selectedStatus,
    };

    const result = await getMaterialsAndLabors(companyId, queryParams);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

// Let me know if you want me to tweak anything else or add more features! 🚀

// router.get("/get/:companyId", verifyLoginToken, async (req, res) => {
//   try {
//     const { companyId } = req.params;
//     const queryParams = {
//       pageSize: parseInt(req.query.pageSize) || 10,
//       pageNumber: parseInt(req.query.pageNumber) || 0,
//       searchQuery: req.query.search,
//       sortField: req.query.sortField,
//       sortOrder: req.query.sortOrder,
//       selectedStatus: req.query.selectedStatus,
//     };

//     // Get the results using the above helper function
//     const result = await getMaterialsAndLabors(companyId, queryParams);

//     res.status(result.statusCode).json(result);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({
//       statusCode: 500,
//       message: "Something went wrong, please try later!",
//     });
//   }
// });
//-------------------------------------------------------------------------------------

// Product Get in dropdawn (Company)
const getMaterialsAndLaborDropdown = async (companyId) => {
  let query = {
    IsDelete: false,
    $or: [{ companyId }, { IsSuperadminAdd: true }],
  };

  const allData = await MaterialsAndLabor.find(query).select("-_id");

  const adminModifiedRecordsMap = new Map();
  allData.forEach((item) => {
    if (item.OldProductId && !item.IsSuperadminAdd) {
      adminModifiedRecordsMap.set(item.OldProductId, item);
    }
  });

  const filteredData = allData.filter((item) => {
    if (item.IsSuperadminAdd) {
      return !adminModifiedRecordsMap.has(item.ProductId);
    }
    return true;
  });

  const data = [
    {
      label: "Materials",
      options: filteredData
        .filter((product) => product.Type === "Materials")
        .map((product) => ({
          ...product.toObject(),
          label: `${product.Name}`,
          value: product.ProductId,
        })),
    },
    {
      label: "Labor",
      options: filteredData
        .filter((product) => product.Type === "Labor")
        .map((product) => ({
          ...product.toObject(),
          label: `${product.Name}`,
          value: product.ProductId,
        })),
    },
  ];

  return {
    statusCode: data.length > 0 ? 200 : 204,
    data,
    message:
      data.length > 0
        ? "Materials And Labor retrieved successfully"
        : "No data found",
  };
};

router.get("/get_materialslabor/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const result = await getMaterialsAndLaborDropdown(companyId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

module.exports = router;

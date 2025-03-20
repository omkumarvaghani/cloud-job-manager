var express = require("express");
var router = express.Router();
var Revenue = require("./model");
// var Admin = require("../../../model/Admin/Admin");
const moment = require("moment");
const { verifyLoginToken } = require("../../../../authentication");

// Revenue Post (Superadmin)
const addRevenue = async (revenue) => {
  const findRevenueName = await Revenue.findOne({
    revenue: {
      $regex: new RegExp("^" + revenue.revenue + "$", "i"),
    },
    IsDelete: false,
  });

  if (findRevenueName) {
    return {
      status: false,
      statusCode: 409,
      message: `${revenue.revenue} name already added`,
    };
  }

  const timestamp = Date.now();
  const uniqueId = `${timestamp}`;
  revenue["revenueId"] = uniqueId;
  revenue["createdAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  revenue["updatedAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  await Revenue.create(revenue);

  return {
    status: true,
    statusCode: 200,
    message: "Revenue added successfully",
  };
};

router.post("/", verifyLoginToken, async (req, res) => {
  try {
    const result = await addRevenue(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

// Revenue Get (Superadmin)
const getRevenues = async (queryOptions) => {
  const { searchQuery, sortField, sortOrder, pageSize, pageNumber } =
    queryOptions;

  let query = { IsDelete: false };

  if (searchQuery) {
    query = {
      $or: [
        { revenue: { $regex: searchQuery, $options: "i" } },
        { updatedAt: { $regex: searchQuery, $options: "i" } },
      ],
    };
  }

  let sortOptions = {};
  if (sortField) {
    sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
  }

  const totalDataCount = await Revenue.countDocuments(query);
  const data = await Revenue.find(query)
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
    const sortOrder = req.query.sortOrder || "dsc";

    const queryOptions = {
      searchQuery,
      sortField,
      sortOrder,
      pageSize,
      pageNumber,
    };

    const result = await getRevenues(queryOptions);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

// Revenue Put (Superadmin)
const updateRevenue = async (revenueId, updateData) => {
  updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  const existingRevenue = await Revenue.findOne({
    revenue: {
      $regex: new RegExp("^" + updateData.revenue + "$", "i"),
    },
    IsDelete: false,
  });

  if (existingRevenue) {
    return {
      statusCode: 201,
      message: `${updateData.revenue} name already exists`,
    };
  }

  const result = await Revenue.findOneAndUpdate(
    { revenueId, IsDelete: false },
    { $set: updateData },
    { new: true }
  );

  if (result) {
    return {
      statusCode: 200,
      message: "Revenue updated successfully",
    };
  } else {
    return {
      statusCode: 404,
      message: "Revenue not found",
    };
  }
};
router.put("/:revenueId", verifyLoginToken, async (req, res) => {
  try {
    const { revenueId } = req.params;
    const updateData = req.body;

    const result = await updateRevenue(revenueId, updateData);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

// Revenue Delete (Superadmin)
const deleteRevenue = async (revenueId) => {
  // Check if the revenue is currently in use
  // const revenueExists = await Admin.findOne({
  //   revenueId: revenueId,
  //   IsDelete: false,
  // });

  // if (revenueExists) {
  //   return {
  //     statusCode: 201,
  //     message: "This revenue is currently in use and cannot be deleted.",
  //   };
  // }

  const result = await Revenue.findOneAndUpdate(
    { revenueId },
    { $set: { IsDelete: true } },
    { new: true }
  );

  if (!result) {
    return {
      statusCode: 404,
      message: "Revenue not found",
    };
  }

  return {
    statusCode: 200,
    message: "Revenue Deleted Successfully",
  };
};
router.delete("/:revenueId", verifyLoginToken, async (req, res) => {
  try {
    const { revenueId } = req.params;
    const result = await deleteRevenue(revenueId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

//  Revenue Get (Company Signup)
const getAllRevenue = async () => {
  const data = await Revenue.find({ IsDelete: false }).sort({ createdAt: -1 });
  return {
    statusCode: 200,
    data: data,
    message: "Read All Revenue",
  };
};

router.get("/revenue", async (req, res) => {
  try {
    const result = await getAllRevenue();
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;

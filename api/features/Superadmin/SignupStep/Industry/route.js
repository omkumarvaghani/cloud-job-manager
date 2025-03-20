var express = require("express");
var router = express.Router();
var Industry = require("./model");
const moment = require("moment");
const {
  encryptData,
  decryptData,
  createToken,
  verifyToken,
  verifyLoginToken,
} = require("../../../../authentication");

// Industry Post (Superadmin)
const addIndustry = async (industry) => {
  const findIndustryName = await Industry.findOne({
    Industry: {
      $regex: new RegExp("^" + industry.Industry + "$", "i"),
    },
    IsDelete: false,
  });

  if (findIndustryName) {
    return {
      status: false,
      statusCode: 201,
      message: `${industry.Industry} name already added`,
    };
  }

  const timestamp = Date.now();
  const uniqueId = `${timestamp}`;
  industry["industryId"] = uniqueId;
  industry["createdAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  industry["updatedAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  await Industry.create(industry);

  return {
    status: true,
    statusCode: 200,
    message: "Industry added successfully",
  };
};

router.post("/", verifyLoginToken, async (req, res) => {
  try {
    const result = await addIndustry(req.body);
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

// Industry Get (Superadmin)
const getIndustries = async (queryOptions) => {
  const { pageSize, pageNumber, searchQuery, sortField, sortOrder } =
    queryOptions;

  let query = { IsDelete: false };

  if (searchQuery) {
    query = {
      $or: [
        { industry: { $regex: searchQuery, $options: "i" } },
        { updatedAt: { $regex: searchQuery, $options: "i" } },
      ],
    };
  }

  let sortOptions = {};
  if (sortField) {
    sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
  }

  const totalDataCount = await Industry.countDocuments(query);

  const data = await Industry.find(query)
    .sort(sortOptions)
    .skip(pageNumber * pageSize)
    .limit(pageSize || 10);

  return {
    statusCode: 200,
    data,
    count: totalDataCount,
  };
};

router.get("/", verifyLoginToken, async (req, res) => {
  try {
    const queryOptions = {
      pageSize: parseInt(req.query.pageSize) || 10,
      pageNumber: parseInt(req.query.pageNumber) || 0,
      searchQuery: req.query.search,
      sortField: req.query.sortField || "updatedAt",
      sortOrder: req.query.sortOrder || "dsc",
    };

    const result = await getIndustries(queryOptions);

    res.json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

// Industry Put (Superadmin)
const updateIndustry = async (industryId, industryData) => {
  try {
    industryData.updatedAt = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");

    const existingIndustry = await Industry.findOne({
      industry: { $regex: new RegExp("^" + industryData.industry + "$", "i") },
      IsDelete: false,
    });

    if (existingIndustry) {
      return {
        statusCode: 409,
        message: `${industryData.industry} name already exists`,
      };
    }

    const result = await Industry.findOneAndUpdate(
      { industryId: industryId, IsDelete: false },
      { $set: industryData },
      { new: true }
    );

    return {
      statusCode: result ? 200 : 404,
      message: result ? "Industry updated successfully" : "Industry not found",
    };
  } catch (error) {
    console.error(error.message);
    return {
      statusCode: 500,
      message: "Something went wrong, please try later!",
    };
  }
};

router.put("/:industryId", verifyLoginToken, async (req, res) => {
  try {
    const { industryId } = req.params;
    const industryData = req.body;

    const result = await updateIndustry(industryId, industryData);

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

// Industry Delete (Superadmin)
const deleteIndustry = async (industryId) => {
  try {
    // Check if the industry is currently in use
    // const industryExists = await Admin.findOne({
    //   industryId: industryId,
    //   IsDelete: false,
    // });

    // if (industryExists) {
    //   return {
    //     statusCode: 201,
    //     message: "This industry is currently in use and cannot be deleted.",
    //   };
    // }

    // Attempt to delete the industry
    const result = await Industry.findOneAndUpdate(
      { industryId: industryId },
      { $set: { IsDelete: true } },
      { new: true }
    );

    return {
      statusCode: result ? 200 : 404,
      message: result ? "Industry deleted successfully" : "Industry not found",
    };
  } catch (error) {
    console.error(error.message);
    return {
      statusCode: 500,
      message: "Something went wrong, please try later!",
    };
  }
};

router.delete("/:industryId", verifyLoginToken, async (req, res) => {
  try {
    const { industryId } = req.params;

    const result = await deleteIndustry(industryId);

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

//  Industry Get (Company Signup)
const getIndustrie = async () => {
  const data = await Industry.find({ IsDelete: false }).sort({ createdAt: -1 });
  return {
    statusCode: 200,
    data: data,
    message: "Read All Industry",
  };
};

router.get("/industry", async (req, res) => {
  try {
    const result = await getIndustrie();
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

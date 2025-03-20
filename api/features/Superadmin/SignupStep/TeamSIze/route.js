var express = require("express");
var router = express.Router();
var Teamsize = require("./model");
// var Admin = require("../../../model/Admin/Admin");
const moment = require("moment");
const { verifyLoginToken } = require("../../../../authentication");

// Teamsize Post (Superadmin)
const addTeamSize = async (teamSizeData) => {
  const findTeamSizeName = await Teamsize.findOne({
    teamSize: {
      $regex: new RegExp("^" + teamSizeData.teamSize + "$", "i"),
    },
    IsDelete: false,
  });

  if (findTeamSizeName) {
    return {
      statusCode: 409,
      message: `${teamSizeData.teamSize} name already added`,
    };
  }

  const timestamp = Date.now();
  const uniqueId = `${timestamp}`;

  teamSizeData["teamSizeId"] = uniqueId;
  teamSizeData["createdAt"] = moment()
    .utcOffset(330)
    .format("YYYY-MM-DD HH:mm:ss");
  teamSizeData["updatedAt"] = moment()
    .utcOffset(330)
    .format("YYYY-MM-DD HH:mm:ss");

  await Teamsize.create(teamSizeData);

  return {
    statusCode: 200,
    message: "Teamsize added successfully",
  };
};

router.post("/", verifyLoginToken, async (req, res) => {
  try {
    const result = await addTeamSize(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//-------------------------------------------------------------------------------------

// Teamsize Get (Superadmin)
const getTeamsizeData = async (query, sortOptions, pageNumber, pageSize) => {
  try {
    const totalDataCount = await Teamsize.countDocuments(query);
    const data = await Teamsize.find(query)
      .sort(sortOptions)
      .skip(pageNumber * pageSize)
      .limit(pageSize);

    return {
      statusCode: 200,
      data,
      count: totalDataCount,
      totalPages: Math.ceil(totalDataCount / pageSize),
      currentPage: pageNumber,
      pageSize,
    };
  } catch (error) {
    throw new Error("Something went wrong, please try later!");
  }
};
router.get("/", verifyLoginToken, async (req, res) => {
  try {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const pageNumber = parseInt(req.query.pageNumber) || 0;
    const searchQuery = req.query.search;
    const sortField = req.query.sortField || "updatedAt";
    const sortOrder = req.query.sortOrder || "dsc";

    let query = { IsDelete: false };

    if (searchQuery) {
      query = {
        $or: [
          { teamSize: { $regex: searchQuery, $options: "i" } },
          { updatedAt: { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const sortOptions = {};
    if (sortField) {
      sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
    }

    const result = await getTeamsizeData(
      query,
      sortOptions,
      pageNumber,
      pageSize
    );
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//-------------------------------------------------------------------------------------

// Teamsize Put (Superadmin)
const updateTeamSize = async (teamSizeId, updateData) => {
  updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  const existingTeamSize = await Teamsize.findOne({
    teamSize: {
      $regex: new RegExp("^" + updateData.teamSize + "$", "i"),
    },
    IsDelete: false,
  });

  if (existingTeamSize && existingTeamSize.teamSizeId !== teamSizeId) {
    return {
      statusCode: 409,
      message: `${updateData.teamSize} name already exists`,
    };
  }

  const result = await Teamsize.findOneAndUpdate(
    { teamSizeId: teamSizeId, IsDelete: false },
    { $set: updateData },
    { new: true }
  );

  if (result) {
    return {
      statusCode: 200,
      message: "Teamsize updated successfully",
    };
  } else {
    return {
      statusCode: 404,
      message: "Teamsize not found",
    };
  }
};
router.put("/:teamSizeId", verifyLoginToken, async (req, res) => {
  try {
    const { teamSizeId } = req.params;
    const updateData = req.body;

    const result = await updateTeamSize(teamSizeId, updateData);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//-------------------------------------------------------------------------------------

// Teamsize Delete (Superadmin)
const deleteTeamSize = async (teamSizeId) => {
  // Check if the teamSize is currently in use
  // Uncomment and adjust this block if you need to check if the teamSize is in use
  // const teamsizeExists = await Admin.findOne({
  //   teamSizeId: teamSizeId,
  //   IsDelete: false,
  // });

  // if (teamsizeExists) {
  //   return {
  //     statusCode: 201,
  //     message: "This teamsize is currently in use and cannot be deleted.",
  //   };
  // }

  // Perform the "soft delete"
  const result = await Teamsize.findOneAndUpdate(
    { teamSizeId: teamSizeId },
    { $set: { IsDelete: true } },
    { new: true }
  );

  if (result) {
    return {
      statusCode: 200,
      message: "Teamsize Deleted Successfully",
    };
  } else {
    return {
      statusCode: 404,
      message: "Teamsize not found",
    };
  }
};
router.delete("/:teamSizeId", verifyLoginToken, async (req, res) => {
  try {
    const { teamSizeId } = req.params;

    const result = await deleteTeamSize(teamSizeId);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

//-------------------------------------------------------------------------------------

//  Teamsize Get (Company Signup)
const getTeamsizes = async () => {
  const data = await Teamsize.find({ IsDelete: false }).sort({ createdAt: -1 });
  return {
    statusCode: 200,
    data: data,
    message: "Read All Teamsize",
  };
};

router.get("/teamsize", async (req, res) => {
  try {
    const result = await getTeamsizes();
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

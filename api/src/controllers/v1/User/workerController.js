const User = require("../../../models/User/User");
const UserProfile = require("../../../models/User/UserProfile");

//**GET ALL WORKER FOR COMPANY**
exports.getAllWorkers = async (req, res) => {
  try {
    const { CompanyId } = req.user;

    if (!CompanyId) {
      return res.status(400).json({
        statusCode: 400,
        message: "CompanyId is required",
      });
    }

    const workers = await User.aggregate([
      {
        $match: {
          CompanyId: CompanyId,
          Role: "Worker",
          IsDelete: false,
        },
      },
      {
        $lookup: {
          from: "user-profiles",
          localField: "UserId",
          foreignField: "UserId",
          as: "profile",
        },
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          UserId: 1,
          EmailAddress: 1,
          FirstName: "$profile.FirstName",
          LastName: "$profile.LastName",
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json({
      statusCode: 200,
      message: "Workers retrieved successfully",
      data: workers,
    });
  } catch (error) {
    console.error("Error fetching workers:", error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
      error: error.message,
    });
  }
};

// **GET USER BY ID API**
exports.getWorkerData = async (req, res) => {
  try {
    const { UserId } = req.params;

    if (!UserId) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized or missing information.",
      });
    }

    const user = await User.findOne({
      UserId: { $in: [UserId] },
      Role: "Worker",
      IsDelete: false,
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found for the provided UserId.",
      });
    }

    const userProfile = await UserProfile.findOne({
      UserId,
      IsDelete: false,
    });

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Worker data fetched successfully.",
      data: {
        user,
        userProfile,
      },
    });
  } catch (error) {
    console.error("Error fetching company data:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// **PUT WORKER PROFILE API**
exports.updateWorkerProfile = async (req, res) => {
  const { UserId } = req.params;
  const updateData = req.body;

  console.log(req.body, "Request Body");

  if (!updateData) {
    return res.status(400).json({
      statusCode: 400,
      message: "Update data is required.",
    });
  }

  const { CompanyId, ...dataToUpdate } = updateData;

  try {
    const admin = await User.findOneAndUpdate(
      { UserId, IsDelete: false },
      { $set: dataToUpdate },
      { new: true }
    );

    if (!admin) {
      return res.status(404).json({
        statusCode: 404,
        message: "Worker not found!",
      });
    }

    const userProfileUpdate = await UserProfile.findOneAndUpdate(
      { UserId },
      {
        $set: {
          ...dataToUpdate,
        },
      },
      { new: true, upsert: true }
    );

    if (!userProfileUpdate) {
      return res.status(404).json({
        statusCode: 404,
        message: "Worker Profile not found!",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Profile updated successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Error updating company profile:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

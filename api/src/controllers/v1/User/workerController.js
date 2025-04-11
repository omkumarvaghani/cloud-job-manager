const {
  createResetToken,
  decryptData,
} = require("../../../middleware/authMiddleware");
const User = require("../../../models/User/User");
const UserProfile = require("../../../models/User/UserProfile");
const Location = require("../../../models/User/Location");
const { handleTemplate } = require("./templateController");
const AppUrl = process.env.REACT_APP;
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

    const workerAggregation = [
      {
        $match: {
          CompanyId,
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
        $addFields: {
          FirstName: {
            $cond: {
              if: { $ifNull: ["$profile.FirstName", false] },
              then: "$profile.FirstName",
              else: {
                $arrayElemAt: [{ $split: ["$profile.OwnerName", " "] }, 0],
              },
            },
          },
          LastName: {
            $cond: {
              if: { $ifNull: ["$profile.LastName", false] },
              then: "$profile.LastName",
              else: {
                $reduce: {
                  input: {
                    $slice: [
                      { $split: ["$profile.OwnerName", " "] },
                      1,
                      { $size: { $split: ["$profile.OwnerName", " "] } },
                    ],
                  },
                  initialValue: "",
                  in: {
                    $cond: [
                      { $eq: ["$$value", ""] },
                      "$$this",
                      { $concat: ["$$value", " ", "$$this"] },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          UserId: 1,
          CompanyId: 1,
          EmailAddress: 1,
          Role: 1,
          IsActive: 1,
          FirstName: 1,
          LastName: 1,
          PhoneNumber: "$profile.PhoneNumber",
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const ownerAggregation = [
      {
        $match: {
          CompanyId,
          Role: "Company",
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
        $addFields: {
          FirstName: {
            $cond: {
              if: { $ifNull: ["$profile.FirstName", false] },
              then: "$profile.FirstName",
              else: {
                $arrayElemAt: [{ $split: ["$profile.OwnerName", " "] }, 0],
              },
            },
          },
          LastName: {
            $cond: {
              if: { $ifNull: ["$profile.LastName", false] },
              then: "$profile.LastName",
              else: {
                $reduce: {
                  input: {
                    $slice: [
                      { $split: ["$profile.OwnerName", " "] },
                      1,
                      { $size: { $split: ["$profile.OwnerName", " "] } },
                    ],
                  },
                  initialValue: "",
                  in: {
                    $cond: [
                      { $eq: ["$$value", ""] },
                      "$$this",
                      { $concat: ["$$value", " ", "$$this"] },
                    ],
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          UserId: 1,
          CompanyId: 1,
          EmailAddress: 1,
          Role: { $literal: "Company" },
          IsActive: 1,
          FirstName: 1,
          LastName: 1,
          PhoneNumber: "$profile.PhoneNumber",
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const [workers, accountOwner] = await Promise.all([
      User.aggregate(workerAggregation),
      User.aggregate(ownerAggregation),
    ]);

    const allUsers = [...accountOwner, ...workers];

    return res.status(200).json({
      statusCode: 200,
      message: "Workers and account owner retrieved successfully",
      data: allUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
      error: error.message,
    });
  }
};

exports.getWorkerData = async (req, res) => {
  try {
    const { UserId } = req.params;
    const CompanyId = Array.isArray(req.user.CompanyId)
      ? req.user.CompanyId
      : [req.user.CompanyId];

    if (!UserId) {
      return res.status(400).json({
        success: false,
        message: "Unauthorized or missing information.",
      });
    }

    const user = await User.findOne({
      UserId: { $in: [UserId] },
      CompanyId: CompanyId,
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

  if (!updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({
      statusCode: 400,
      message: "Update data is required.",
    });
  }

  try {
    // First find the user to check their Role
    const user = await User.findOne({ UserId, IsDelete: false });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found!",
      });
    }

    const role = user.Role;

    // Fields that belong to the User collection
    const userFields = [
      "Address",
      "City",
      "State",
      "ZipCode",
      "Country",
      "Location",
      "EmailAddress",
      "CompanyId", // if present
    ];

    // Split update data into user & profile specific fields
    const userUpdateData = {};
    const profileUpdateData = {};

    for (const key in updateData) {
      if (userFields.includes(key)) {
        userUpdateData[key] = updateData[key];
      } else {
        profileUpdateData[key] = updateData[key];
      }
    }

    // If role is Company (i.e., Account Owner from Worker table), allow both updates
    if (role === "Company") {
      // Push everything into both models
      const updatedUser = await User.findOneAndUpdate(
        { UserId, IsDelete: false },
        { $set: updateData },
        { new: true }
      );

      const updatedProfile = await UserProfile.findOneAndUpdate(
        { UserId },
        { $set: updateData },
        { new: true, upsert: true }
      );

      return res.status(200).json({
        statusCode: 200,
        message: "Company profile updated successfully",
        data: updatedUser,
      });
    }

    // If role is Worker
    const updatedWorkerUser = await User.findOneAndUpdate(
      { UserId, IsDelete: false },
      { $set: userUpdateData },
      { new: true }
    );

    const updatedWorkerProfile = await UserProfile.findOneAndUpdate(
      { UserId },
      { $set: profileUpdateData },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      statusCode: 200,
      message: "Worker profile updated successfully",
      data: updatedWorkerUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// **CHANGE PASSWORD IN PROFILE**
exports.updateWorkerChangePass = async (req, res) => {
  const {
    oldPassword,
    Password: newPassword,
    confirmpassword: confirmPassword,
  } = req.body;
  const { UserId } = req.params;
  try {
    // if (!oldPassword || !newPassword || !confirmPassword) {
    //   return res
    //     .status(400)
    //     .json({ message: "All password fields are required" });
    // }

    const user = await User.findOne({ UserId });
    if (!user || !user.Password) {
      return res
        .status(404)
        .json({ message: "User not found or missing password" });
    }

    const isOldPasswordCorrect = await decryptData(oldPassword, user.Password);
    if (!isOldPasswordCorrect) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const isSameAsOld = await decryptData(newPassword, user.Password);
    if (isSameAsOld) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    // const enPass = await encryptData(newPassword);

    const allUsers = await User.find({
      EmailAddress: user.EmailAddress,
      IsDelete: false,
      Password: { $ne: null },
    });

    for (const user of allUsers) {
      user.Password = newPassword;
      await user.save();
    }

    return res.status(200).json({ message: "Password successfully changed" });
  } catch (error) {
    console.error("Password Update Error:", error);
    return res
      .status(500)
      .json({ message: "Server error, please try again later" });
  }
};

// **SEND WELCOME MAIL TO WORKER**
exports.sendWelcomeEmailToWorkerLogic = async (UserId) => {
  const findCustomer = await User.findOne({ UserId, Role: "Worker" });
  if (!findCustomer) return { statusCode: 404, message: "Customer Not Found" };

  const findCustomerProfile = await UserProfile.findOne({
    UserId,
    Role: "Worker",
  });
  if (!findCustomerProfile)
    return { statusCode: 404, message: "Customer Profile Not Found" };

  const findCompany = await User.findOne({ CompanyId: findCustomer.CompanyId });
  if (!findCompany) return { statusCode: 404, message: "Company Not Found" };

  const findCompanyProfile = await UserProfile.findOne({
    CompanyId: findCustomer.CompanyId,
  });
  if (!findCompanyProfile)
    return { statusCode: 404, message: "Company Profile Not Found" };

  const allSameEmailCustomers = await User.find({
    EmailAddress: findCustomer.EmailAddress,
    Role: "Worker",
    IsDelete: false,
  });

  const isAnyPasswordSet = allSameEmailCustomers.some(
    (cust) => cust.Password && cust.Password.trim().length > 0
  );

  let buttonHtml = "";
  if (!isAnyPasswordSet) {
    const resetToken = await createResetToken({
      EmailAddress: findCustomer.EmailAddress,
      IsPassSet: false,
    });
    const resetUrl = `http://localhost:4985/auth/new-password?token=${resetToken}`;

    buttonHtml = `
      <p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; border: 1px solid #e88c44; border-radius: 8px; background-color: #e88c44; color: #fff; text-decoration: none; text-align: center; font-size: 15px; font-weight: 500; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
          Set Your Password
        </a>
      </p>
    `;
  } else {
    const loginUrl = `http://localhost:4985/auth/login`;

    buttonHtml = `
      <p>
        <a href="${loginUrl}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; border: 1px solid #063164; border-radius: 8px; background-color: #063164; color: #fff; text-decoration: none; text-align: center; font-size: 15px; font-weight: 500; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
          Login to your Account
        </a>
      </p>
    `;
  }

  const data = [
    {
      FirstName: findCustomerProfile.FirstName || "",
      LastName: findCustomerProfile.LastName || "",
      EmailAddress: findCustomer.EmailAddress || "",
      PhoneNumber: findCustomerProfile.PhoneNumber || "",
      CompanyName: findCompanyProfile.CompanyName || "",
      Url: buttonHtml || "",
    },
  ];

  const defaultSubject = `Welcome To ${findCompanyProfile.CompanyName}`;
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
          <h2 style="font-size: 25px; font-weight: 700; color: #063164; margin-bottom: 20px; letter-spacing: 1px;margin-top:20px;">Welcome to ${findCompanyProfile.CompanyName}</h2>
          <p style="font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 20px; font-weight: 400;">
              Dear ${findCustomerProfile.FirstName} ${findCustomerProfile.LastName},<br>
            We are pleased to provide you with your login credentials for accessing our Contract Management System. Below are your details:
          </p>
          <p><strong>Email:</strong> ${findCustomer.EmailAddress}</p>

         
      ${buttonHtml}
          
          <p style="font-size: 14px; color: #888888; margin-top: 30px; line-height: 1.6;">
            For security reasons, we recommend changing your password upon first login. If you have any questions or need assistance, please do not hesitate to reach out to our support team at <a href="mailto:${findCompany.EmailAddress}" style="color: #063164; font-weight: 600;">${findCompany.EmailAddress}</a> or ${findCompanyProfile.PhoneNumber}.
          </p>

          <p style="font-size: 14px; color: #888888; margin-top: 30px; font-weight: 400;">
            Thank you for choosing ${findCompanyProfile.CompanyName}. We are committed to providing you with a seamless and efficient experience.
          </p>

          <p style="font-size: 14px; color: #888888; margin-top: 30px; font-weight: 400;">Best regards,<br>The ${findCompanyProfile.CompanyName} Team</p>
        </td>
      </tr>

      <!-- Footer Section -->
      <tr>
        <td style="padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f4f4f7; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
          ${findCompanyProfile.CompanyName}, Inc. | All rights reserved.<br>
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
    defaultSubject,
    defaultBody,
    findCustomer.UserId
  );

  return emailStatus
    ? {
        statusCode: 200,
        message: `Email sent to ${findCustomer.EmailAddress}`,
        defaultBody,
      }
    : { statusCode: 500, message: "Failed to send email" };
};

// **SEND EMAIL TO WORKER**
exports.sendWelcomeEmailToWorker = async (req, res) => {
  const { UserId } = req.params;
  try {
    const result = await exports.sendWelcomeEmailToWorkerLogic(UserId);
    return res.status(result.statusCode).json(result);
  } catch (err) {
    console.error("Error in sendWelcomeEmailToCustomer:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// **GET WORKER BY USERID**
exports.getCompleteWorkerByUserId = async (req, res) => {
  try {
    const { UserId } = req.params;
    const CompanyId = Array.isArray(req.user.CompanyId)
      ? req.user.CompanyId
      : [req.user.CompanyId];

    const user = await User.findOne({ UserId, IsDelete: false });

    if (!user) {
      return res.status(404).json({
        statusCode: "404",
        message: "User not found",
      });
    }

    const role = user.Role;

    let pipeline = [];

    if (role === "Company") {
      pipeline = [
        {
          $match: {
            UserId,
            Role: "Company",
            CompanyId: { $in: CompanyId },
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
        { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            UserId: 1,
            EmailAddress: 1,
            IsPassSet: 1,
            IsActive: 1,
            Role: 1,
            CompanyId: 1,
            PasswordUpdatedAt: 1,

            FirstName: "$profile.FirstName",
            LastName: "$profile.LastName",
            OwnerName: "$profile.OwnerName",
            PhoneNumber: "$profile.PhoneNumber",
            ProfileImage: "$profile.ProfileImage",
            LocationId: "$profile.LocationId",
            LaborCost: "$profile.LaborCost",
            ScheduleTime: "$profile.ScheduleTime",
            IsPlanActive: "$profile.IsPlanActive",
            CreatedAt: "$profile.createdAt",

            Address: "$profile.Address",
            City: "$profile.City",
            State: "$profile.State",
            Country: "$profile.Country",
            Zip: "$profile.Zip",
          },
        },
      ];
    } else {
      pipeline = [
        {
          $match: {
            UserId,
            Role: "Worker",
            IsDelete: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "UserId",
            foreignField: "UserId",
            as: "userData",
          },
        },
        {
          $unwind: {
            path: "$userData",
            preserveNullAndEmptyArrays: false,
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
            _id: 0,
            UserId: "$userData.UserId",
            EmailAddress: "$userData.EmailAddress",
            IsPassSet: "$userData.IsPassSet",
            IsActive: "$userData.IsActive",
            Role: "$userData.Role",
            CompanyId: "$userData.CompanyId",
            PasswordUpdatedAt: "$userData.PasswordUpdatedAt",

            FirstName: 1,
            LastName: 1,
            OwnerName: 1,
            PhoneNumber: 1,
            ProfileImage: 1,
            LocationId: 1,
            LaborCost: 1,
            ScheduleTime: 1,
            IsPlanActive: 1,
            CreatedAt: "$createdAt",

            Address: "$locationData.Address",
            City: "$locationData.City",
            State: "$locationData.State",
            Country: "$locationData.Country",
            Zip: "$locationData.Zip",
          },
        },
      ];
    }

    const result = await (role === "Company"
      ? User.aggregate(pipeline)
      : UserProfile.aggregate(pipeline));

    if (!result || result.length === 0) {
      return res.status(404).json({
        statusCode: "404",
        message: "Worker not found",
      });
    }

    return res.status(200).json({
      statusCode: "200",
      message: "User data fetched successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({
      statusCode: "500",
      message: "Something went wrong",
    });
  }
};

// **UPDATE WORKER BY ID**
exports.updateUserByUserId = async (req, res) => {
  const { UserId } = req.params;
  const updateData = req.body;
  delete updateData.Role;
  if (updateData.CompanyId && Array.isArray(updateData.CompanyId)) {
    updateData.CompanyId = updateData.CompanyId[0];
  }

  if (!updateData) {
    return res.status(400).json({
      statusCode: 400,
      message: "Update data is required.",
    });
  }

  try {
    const user = await User.findOne({ UserId, IsDelete: false });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: "User not found!",
      });
    }

    const role = user.Role;
    const companyIdToCheck = updateData.CompanyId || user.CompanyId;

    if (updateData.EmailAddress) {
      const emailExists = await User.findOne({
        EmailAddress: updateData.EmailAddress,
        CompanyId: companyIdToCheck,
        UserId: { $ne: UserId },
        IsDelete: false,
      });

      if (emailExists) {
        return res.status(400).json({
          statusCode: 400,
          message: "Email already exists in this company.",
        });
      }
    }

    // if (["Customer", "Worker"].includes(role)) {
    //   const existingUser = await User.findOne({
    //     CompanyId: companyIdToCheck,
    //     Role: role,
    //     UserId: { $ne: UserId },
    //     IsDelete: false,
    //   });

    //   if (existingUser) {
    //     return res.status(400).json({
    //       statusCode: 400,
    //       message: `Another ${role} already exists under this company.`,
    //     });
    //   }
    // }
    const {
      EmailAddress,
      Address,
      City,
      State,
      Zip,
      Country,
      ...profileFields
    } = updateData;

    const userUpdateFields = {};
    if (EmailAddress) userUpdateFields.EmailAddress = EmailAddress;

    let userUpdatePromise = null;
    let userProfileUpdatePromise = null;
    let locationUpdatePromise = null;

    if (Object.keys(userUpdateFields).length > 0) {
      userUpdatePromise = User.findOneAndUpdate(
        { UserId },
        { $set: userUpdateFields },
        { new: true }
      );
    }

    if (role === "Company") {
      userProfileUpdatePromise = UserProfile.findOneAndUpdate(
        { UserId },
        { $set: { ...profileFields, Address, City, State, Zip, Country } },
        { new: true, upsert: true }
      );
    } else {
      const userProfile = await UserProfile.findOne({ UserId });

      userProfileUpdatePromise = UserProfile.findOneAndUpdate(
        { UserId },
        { $set: profileFields },
        { new: true, upsert: true }
      );

      if (userProfile?.LocationId) {
        locationUpdatePromise = Location.findOneAndUpdate(
          { LocationId: userProfile.LocationId },
          {
            $set: {
              Address,
              City,
              State,
              Zip,
              Country,
            },
          },
          { new: true }
        );
      }
    }

    const [userUpdate, profileUpdate, locationUpdate] = await Promise.all([
      userUpdatePromise,
      userProfileUpdatePromise,
      locationUpdatePromise,
    ]);

    return res.status(200).json({
      statusCode: "200",
      message: "User updated successfully",
      data: {
        user: userUpdate,
        profile: profileUpdate,
        location: locationUpdate,
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// **DELETE WORKER BY ID**
exports.deleteWorkerByUserId = async (req, res) => {
  try {
    const { UserId } = req.params;
    const { CompanyId } = req.user;

    const worker = await UserProfile.findOne({
      UserId,
      CompanyId,
      Role: "Worker",
      IsDelete: false,
    });

    if (!worker) {
      return res.status(404).json({
        statusCode: "404",
        message: "Worker not found",
      });
    }

    await UserProfile.updateOne({ UserId }, { $set: { IsDelete: true } });

    await User.updateOne({ UserId }, { $set: { IsDelete: true } });

    await Location.updateOne(
      { CustomerId: UserId },
      { $set: { IsDelete: true } }
    );

    res.status(200).json({
      statusCode: "200",
      message: "Worker deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting worker:", error);
    res.status(500).json({
      statusCode: "500",
      message: "Something went wrong",
    });
  }
};

// **ACTIVE DEACTIVE WORKER**
exports.updateUserActiveStatus = async (req, res) => {
  try {
    const { UserId } = req.params;
    const { IsActive } = req.body;

    if (typeof IsActive !== "boolean") {
      return res.status(400).json({
        statusCode: "400",
        message: "IsActive must be a boolean value (true or false)",
      });
    }

    const user = await User.findOne({ UserId });

    if (!user) {
      return res.status(404).json({
        statusCode: "404",
        message: "User not found",
      });
    }

    await User.updateOne({ UserId }, { $set: { IsActive } });

    res.status(200).json({
      statusCode: "200",
      message: `Worker is now ${IsActive ? "Active" : "Inactive"}`,
    });
  } catch (error) {
    console.error("Error updating IsActive:", error);
    res.status(500).json({
      statusCode: "500",
      message: "Something went wrong",
    });
  }
};

// **ACTIVE AND DEACTIVE WORKER COUNT**
exports.getActiveWorkerStats = async (req, res) => {
  const CompanyId = Array.isArray(req.user.CompanyId)
    ? req.user.CompanyId
    : [req.user.CompanyId];

  try {
    const [allWorkerCount, activeWorkerCount, companyCount] = await Promise.all(
      [
        User.countDocuments({
          CompanyId: { $in: CompanyId },
          Role: "Worker",
          IsDelete: false,
        }).lean(),

        User.countDocuments({
          CompanyId: { $in: CompanyId },
          Role: "Worker",
          IsActive: true,
          IsDelete: false,
        }).lean(),

        User.countDocuments({
          CompanyId: req.user.CompanyId,
          Role: "Company",
          IsDelete: false,
        }).lean(),
      ]
    );

    return res.status(200).json({
      statusCode: 200,
      message: "Active worker stats retrieved successfully!",
      AllWorker: allWorkerCount + companyCount,
      activeWorkerCount: activeWorkerCount + companyCount,
    });
  } catch (error) {
    console.error("Error getting worker stats:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

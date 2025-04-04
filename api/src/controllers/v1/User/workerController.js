const { createResetToken } = require("../../../middleware/authMiddleware");
const User = require("../../../models/User/User");
const UserProfile = require("../../../models/User/UserProfile");
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

exports.sendWelcomeEmailToWorker = async (req, res) => {
  const { UserId } = req.params;

  const findCustomer = await User.findOne({ UserId, Role: "Worker" });

  if (!findCustomer) {
    return { statusCode: 404, message: "Worker Not Found" };
  }
  const findCustomerProfile = await UserProfile.findOne({
    UserId,
    Role: "Worker",
  });

  if (!findCustomer) {
    return { statusCode: 404, message: "Worker Not Found" };
  }

  const findCompany = await User.findOne({
    CompanyId: findCustomer.CompanyId,
  });

  if (!findCompany) {
    return { statusCode: 404, message: "Company Not Found" };
  }
  const findCompanyProfile = await UserProfile.findOne({
    CompanyId: findCustomer.CompanyId,
  });

  if (!findCompanyProfile) {
    return { statusCode: 404, message: "Company Not Found" };
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
      FirstName: findCustomerProfile.FirstName || "",
      LastName: findCustomerProfile.LastName || "",
      EmailAddress: findCustomer.EmailAddress || "",
      PhoneNumber: findCustomerProfile.PhoneNumber || "",
      CompanyName: findCompanyProfile.CompanyName || "",
      EmailAddress: findCompany.EmailAddress || "",
      companyPhoneNumber: findCompanyProfile.PhoneNumber || "",
      Url: button || "",
    },
  ];
  console.log(data, "data");
  const defaultSubject = "Welcome to our service";
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
  
            <!-- Set Password Button -->
            <p>
              <a href="${url}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; border: 1px solid #e88c44 ; border-radius: 8px; background-color: #e88c44 ; color: #fff; text-decoration: none; text-align: center; font-size: 15px; font-weight: 500; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
                Set Your Password    
              </a> 
            </p> 
            
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
  if (emailStatus) {
    return res.status(200).json({
      statusCode: 200,
      message: `Email was sent to ${findCustomer.EmailAddress}`,
      defaultBody,
    });
  } else {
    return res.status(203).json({
      statusCode: 203,
      message: "Issue sending email",
    });
  }
};

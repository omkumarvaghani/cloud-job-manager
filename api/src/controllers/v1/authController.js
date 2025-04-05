const User = require("../../models/User/User");
const UserProfile = require("../../models/User/UserProfile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const { logUserEvent } = require("../../middleware/eventMiddleware");
const {
  verifyToken,
  createResetToken,
} = require("../../middleware/authMiddleware");
const SuperAdmin = require("../../models/Admin/Super-Admin");
const { handleTemplate } = require("./User/templateController");
const { sendWelcomeEmail } = require("../../Helpers/EmailServices");

const generateToken = (user) => {
  return jwt.sign(
    {
      UserId: user.UserId,
      Role: user.Role,
      CompanyId: user.CompanyId,
      EmailAddress: user.EmailAddress,
      OwnerName: user.OwnerName,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || "4h" }
  );
};

// **REGISTER API**
exports.register = async (req, res) => {
  try {
    const { Role, EmailAddress, Password, CompanyName, ...profileDetails } =
      req.body;

    const existingUser = await User.findOne({ EmailAddress, IsDelete: false });

    if (existingUser) {
      return res.status(400).json({ error: "Email is already taken." });
    }

    let CompanyId = profileDetails.CompanyId;
    if (Role === "Company") {
      CompanyId = uuidv4();
      if (CompanyName) {
        profileDetails.CompanyName = CompanyName.split(" ").join("");
      }
    } else if (!CompanyId) {
      return res
        .status(400)
        .json({ error: "CompanyId is required for Worker/Customer" });
    }

    const newUser = new User({
      UserId: uuidv4(),
      Role,
      CompanyId,
      EmailAddress,
      Password,
    });
    await newUser.save();

    const newUserProfile = new UserProfile({
      UserId: newUser.UserId,
      CompanyId,
      Role,
      ...profileDetails,
    });

    await newUserProfile.save();

    const token = generateToken(newUser);

    logUserEvent(
      newUser.CompanyId,
      "REGISTRATION",
      `User ${newUser.EmailAddress} registered in`
    );
    const emailStatus = await sendWelcomeEmailToCompanyLogic(newUser.UserId);
    return res.status(200).json({
      statusCode: "200",
      message: "Company created successfully",
      emailStatus,
      user: {
        UserId: newUser.UserId,
        EmailAddress: newUser.EmailAddress,
        Role: newUser.Role,
        CompanyId: newUser.CompanyId || null,
      },
      token,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

// **WELCOME MAIL**
const sendWelcomeEmailToCompanyLogic = async (UserId) => {
  const findUser = await User.findOne({ UserId, Role: "Company" });
  if (!findUser) return { statusCode: 404, message: "Company User Not Found" };

  const findProfile = await UserProfile.findOne({ UserId, Role: "Company" });
  if (!findProfile)
    return { statusCode: 404, message: "Company Profile Not Found" };

  const data = [
    {
      CompanyName: findProfile.CompanyName || "",
      OwnerName: findProfile.OwnerName || "",
      EmailAddress: findUser.EmailAddress || "",
      PhoneNumber: findProfile.PhoneNumber || "",
      IndustryId: findProfile.IndustryId || "",
      TeamSizeId: findProfile.TeamSizeId || "",
      RevenueId: findProfile.RevenueId || "",
    },
  ];

  const defaultSubject = `Welcome To Cloud Job Manager`;
  const defaultBody = `
  <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff;">
    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 1px solid #e88c44;">
      
      <tr>
        <td style="padding: 20px 0; text-align: center; background-color: #063164;">
          <div style="display: inline-block; padding: 20px; background-color: white; border-radius: 12px;">
            <img src="https://app.cloudjobmanager.com/cdn/upload/20250213103016_site-logo2.png" alt="CloudJobManager Logo" style="width: 160px; max-width: 100%; display: block; margin: auto;" />
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding: 0px 20px; text-align: center; color: #333333; background-color: #ffffff; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
          <h2 style="font-size: 25px; font-weight: 700; color: #063164; margin-bottom: 20px; letter-spacing: 1px;margin-top:20px;">Welcome To Cloud Job Manager</h2>
          <p style="font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 20px; font-weight: 400;">
            Dear ${findProfile.OwnerName},<br>
            Thank you for signing up with us! We are excited to have you and your company onboard. Below are your details:
          </p>
          
          <p><strong>Company Name:</strong> ${findProfile.CompanyName}</p>
          <p><strong>Email:</strong> ${findUser.EmailAddress}</p>
          <p><strong>Phone Number:</strong> ${findProfile.PhoneNumber}</p>

          <p style="font-size: 14px; color: #888888; margin-top: 30px; font-weight: 400;">
            Thanks again for choosing Cloud Job Manager. We’re here to support your growth.
          </p>

          <p style="font-size: 14px; color: #888888; margin-top: 30px; font-weight: 400;">Best regards,<br>The Cloud Job Manager Team</p>
        </td>
      </tr>

      <tr>
        <td style="padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f4f4f7; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
          Cloud Job Manager, Inc. | All rights reserved.<br>
          <a href="#" style="color: #e88c44; text-decoration: none;">Unsubscribe</a> if you no longer wish to receive these emails.
        </td>
      </tr>
    </table>
  </div>
  `;
  const emailStatus = await sendWelcomeEmail(
    findUser.EmailAddress,
    defaultSubject,
    defaultBody,
    [],
    findUser.UserId
  );

  return emailStatus
    ? {
        statusCode: 200,
        message: `Email sent to ${findUser.EmailAddress}`,
        defaultBody,
      }
    : { statusCode: 500, message: "Failed to send email" };
};

// **LOGIN API**

exports.checkEmail = async (req, res) => {
  try {
    const { EmailAddress } = req.body;
    const companiesData = [];

    const users = await User.find({ EmailAddress, IsDelete: false });
    for (const user of users) {
      const companyIds = Array.isArray(user.CompanyId)
        ? user.CompanyId
        : [user.CompanyId];
      for (const companyId of companyIds) {
        const userProfile = await UserProfile.findOne({
          CompanyId: companyId,
          Role: "Company",
        });
        console.log(userProfile, "userProfile");
        companiesData.push({
          CompanyId: companyId,
          CompanyName: userProfile?.CompanyName || "Unknown Company",
          Role: user.Role,
        });
      }
    }

    const superAdmin = await SuperAdmin.findOne({
      EmailAddress,
      IsDelete: false,
    });
    if (superAdmin) {
      companiesData.push({
        CompanyId: null,
        CompanyName: "Super Admin",
        Role: "Admin",
      });
    }

    if (companiesData.length === 0) {
      return res.status(404).json({
        statusCode: "404",
        message: "Email not found",
      });
    }

    if (companiesData.length === 1) {
      return res.status(200).json({
        statusCode: "200",
        message: "Email found",
        multipleCompanies: false,
        data: {
          EmailAddress,
          CompanyId: companiesData[0].CompanyId,
          Role: companiesData[0].Role,
          CompanyName: companiesData[0].CompanyName,
        },
      });
    }

    return res.status(200).json({
      statusCode: "200",
      message: "Email found in multiple companies",
      multipleCompanies: true,
      data: {
        EmailAddress,
        companies: companiesData,
      },
    });
  } catch (error) {
    console.error("Check Email Error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try later!" });
  }
};
exports.login = async (req, res) => {
  try {
    const { EmailAddress, Password, CompanyId } = req.body;

    let user = null;
    let role = null;
    let tokenData = {};
    let userProfile = null;

    const superAdmin = await SuperAdmin.findOne({
      EmailAddress,
      IsDelete: false,
    });
    if (superAdmin) {
      const isMatchSuper = await bcrypt.compare(Password, superAdmin.Password);
      if (!isMatchSuper) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      role = "Admin";
      tokenData = {
        AdminId: superAdmin.AdminId,
        EmailAddress: superAdmin.EmailAddress,
        FullName: superAdmin.FullName,
        ProfileImage: superAdmin.ProfileImage,
        Role: role,
      };

      const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
        expiresIn: "4h",
      });

      logUserEvent("SYSTEM", "LOGIN", `SuperAdmin ${EmailAddress} logged in.`);

      return res.status(200).json({
        statusCode: "300",
        message: "Super-admin Login Successful!",
        token,
        data: {
          AdminId: superAdmin.AdminId,
          EmailAddress: superAdmin.EmailAddress,
          Role: role,
        },
      });
    }

    // Now check in User collection
    const query = { EmailAddress, IsDelete: false };
    if (CompanyId) query.CompanyId = CompanyId;

    user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    console.log(isMatch, "isMatch");

    if (!user.IsActive) {
      return res.status(400).json({
        message: "Account is deactivated. Please contact support.",
      });
    }

    role = user.Role;
    userProfile = await UserProfile.findOne({
      UserId: user.UserId,
      CompanyId: user.CompanyId,
    });

    tokenData = {
      UserId: user.UserId,
      EmailAddress: user.EmailAddress,
      Role: user.Role,
      CompanyId: user.CompanyId,
      CompanyName: userProfile?.CompanyName || "Unknown Company",
      OwnerName: userProfile?.OwnerName || "",
      ProfileImage: userProfile?.ProfileImage || null,
    };

    logUserEvent(
      user.CompanyId,
      "LOGIN",
      `User ${user.EmailAddress} logged in.`
    );

    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });

    let statusCode, message, roleSpecificId;

    switch (role) {
      case "Company":
        roleSpecificId = user.CompanyId;
        statusCode = "200";
        message = "Company Login Successful!";
        break;
      case "Worker":
        roleSpecificId = user.UserId;
        statusCode = "302";
        message = "Worker Login Successful!";
        break;
      case "Customer":
        roleSpecificId = user.UserId;
        statusCode = "303";
        message = "Customer Login Successful!";
        break;
      default:
        return res.status(400).json({
          statusCode: "204",
          message: "Invalid Role. Please contact support.",
        });
    }

    res.status(200).json({
      statusCode,
      message,
      token,
      data: {
        UserId: roleSpecificId,
        EmailAddress: user.EmailAddress,
        CompanyName: userProfile?.CompanyName || "",
        Role: user.Role,
        IsActive: user.IsActive,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong, please try later!" });
  }
};

// **Check if User Exists Function**
exports.checkUserExists = async (req, res) => {
  try {
    const { EmailAddress } = req.body;
    const user = await User.findOne({
      EmailAddress,
      IsDelete: false,
    });

    if (user) {
      return res.status(302).json({
        message: "E-mail Already Exists!",
      });
    } else {
      return res.status(200).json({
        statusCode: "200",
        message: "E-mail is available.",
      });
    }
  } catch (error) {
    console.error("Error checking user existence:", error);
    return res.status(500).json({
      message: "Something went wrong, please try later!",
    });
  }
};

// // Token Decode
const decodeToken = async (token) => {
  if (!token) {
    return { statusCode: 400, message: "Token is required" };
  }

  let data;
  try {
    data = verifyToken(token);
  } catch (error) {
    console.error("Error during token verification:", error.message);
    return { statusCode: 401, message: error.message };
  }

  const userProfile = await UserProfile.findOne({ UserId: data.UserId });

  if (userProfile) {
    data = {
      ...data,
      ...userProfile.toObject(),
      FirstName: userProfile.FirstName,
      LastName: userProfile.LastName,
    };
  }

  return { statusCode: 200, data };
};

// Endpoint to get token data
exports.getTokenData = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;
    const response = await decodeToken(token);

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Error in getTokenData:", error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
};

exports.checkTokenData = async (req, res, next) => {
  try {
    const { token } = req.body;
    const response = await decodeToken(token);
    if (response.statusCode !== 200) {
      return res.status(response.statusCode).json(response);
    }

    if (response?.data?.CompanyId) {
      const companyFind = await User.findOne({
        CompanyId: response.data.CompanyId,
        Role: "Company",
      });

      if (companyFind && !companyFind.IsActive) {
        return res.status(401).json({
          statusCode: 401,
          message: "Company is inactive. Please log in again.",
        });
      }
    }
    req.tokenData = response.data;
    next();
  } catch (error) {
    console.error("Error in checkTokenData:", error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
};

// Auth (Check Logged-in Company)
exports.verifyAndFetchCompany = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;
    const tokenResult = verifyToken(token);

    if (!tokenResult.success) {
      return res
        .status(tokenResult.statusCode)
        .json({ message: tokenResult.message });
    }

    const user = tokenResult.data;

    const company = await User.findOne({
      CompanyId: user.CompanyId,
      IsDelete: false,
    });

    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Company found",
      Role: company.Role,
      data: company,
    });
  } catch (error) {
    console.error("Error in verifyAndFetchCompany:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

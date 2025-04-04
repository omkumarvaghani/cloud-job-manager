const User = require("../../models/User/User");
const UserProfile = require("../../models/User/UserProfile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const { logUserEvent } = require("../../middleware/eventMiddleware");
const { verifyToken } = require("../../middleware/authMiddleware");

const generateToken = (user) => {
  return jwt.sign(
    { UserId: user.UserId, Role: user.Role, CompanyId: user.CompanyId, EmailAddress: user.EmailAddress, OwnerName: user.OwnerName },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || "4h" }
  );
};

// **REGISTER API**
exports.register = async (req, res) => {
  try {
    const { Role, EmailAddress, Password, CompanyName, ...profileDetails } = req.body;

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

    return res.status(200).json({
      statusCode: "200",
      message: "Company created successfully",
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

// // **LOGIN API**
// exports.login = async (req, res) => {
//   try {
//     const { EmailAddress, Password } = req.body;

//     const user = await User.findOne({ EmailAddress, IsDelete: false });

//     if (!user) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     if (!user.IsActive) {
//       return res
//         .status(400)
//         .json({ message: "Account is deactivated. Please contact support." });
//     }

//     const isMatch = await bcrypt.compare(Password, user.Password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const userProfile = await UserProfile.findOne({ UserId: user.UserId });

//     const tokenData = {
//       UserId: user.UserId,
//       EmailAddress: user.EmailAddress,
//       Role: user.Role,
//       ProfileImage: userProfile?.ProfileImage || null,
//       CompanyId: user.CompanyId,
//       CompanyName: userProfile?.CompanyName || "",
//       OwnerName: userProfile?.OwnerName || "",
//     };

//     logUserEvent(user.CompanyId, "LOGIN", `User ${user.EmailAddress} logged in.`);

//     const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
//       expiresIn: "24h",
//     });

//     let statusCode, message, roleSpecificId;

//     switch (user.Role) {
//       case "Company":
//         roleSpecificId = user.CompanyId;
//         statusCode = "200";
//         message = "Company Login Successful!";
//         break;
//       case "Superadmin":
//         roleSpecificId = user.UserId;
//         statusCode = "300";
//         message = "Superadmin Login Successful!";
//         break;
//       case "Worker":
//         roleSpecificId = user.UserId;
//         statusCode = "302";
//         message = "Worker Login Successful!";
//         break;
//       case "Customer":
//         roleSpecificId = user.UserId;
//         statusCode = "303";
//         message = "Customer Login Successful!";
//         break;
//       default:
//         return res.status(400).json({ statusCode: "204", message: "Invalid Role. Please contact support." });
//     }

//     res.status(200).json({
//       statusCode,
//       message,
//       token,
//       data: {
//         UserId: roleSpecificId,
//         EmailAddress: user.EmailAddress,
//         CompanyName: userProfile?.CompanyName || "",
//         Role: user.Role,
//         IsActive: user.IsActive,
//       },
//     });

//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ message: "Something went wrong, please try later!" });
//   }
// };


exports.checkEmail = async (req, res) => {
  try {
    const { EmailAddress } = req.body

    // Find all users with this email across different companies
    const users = await User.find({ EmailAddress, IsDelete: false })

    if (!users || users.length === 0) {
      return res.status(404).json({
        statusCode: "404",
        message: "Email not found",
      })
    }

    // If only one company, return simple response
    if (users.length === 1) {
      return res.status(200).json({
        statusCode: "200",
        message: "Email found",
        multipleCompanies: false,
        data: {
          EmailAddress,
        },
      })
    }

    // Get company details for each user
    const companiesData = []
    for (const user of users) {
      // Get company details
      const userProfile = await UserProfile.findOne({ UserId: user.UserId })
      const company = await Company.findOne({ CompanyId: user.CompanyId })

      companiesData.push({
        CompanyId: user.CompanyId,
        CompanyName: company?.CompanyName || userProfile?.CompanyName || "Unknown Company",
        Role: user.Role,
      })
    }

    return res.status(200).json({
      statusCode: "200",
      message: "Email found in multiple companies",
      multipleCompanies: true,
      data: {
        EmailAddress,
        companies: companiesData,
      },
    })
  } catch (error) {
    console.error("Check Email Error:", error)
    res.status(500).json({ message: "Something went wrong, please try later!" })
  }
}

exports.login = async (req, res) => {
  try {
    const { EmailAddress, Password, CompanyId } = req.body

    // Find user query - add CompanyId if provided
    const query = { EmailAddress, IsDelete: false }
    if (CompanyId) {
      query.CompanyId = CompanyId
    }

    const user = await User.findOne(query)

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    if (!user.IsActive) {
      return res.status(400).json({ message: "Account is deactivated. Please contact support." })
    }

    const isMatch = await bcrypt.compare(Password, user.Password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    const userProfile = await UserProfile.findOne({ UserId: user.UserId })

    const tokenData = {
      UserId: user.UserId,
      EmailAddress: user.EmailAddress,
      Role: user.Role,
      ProfileImage: userProfile?.ProfileImage || null,
      CompanyId: user.CompanyId,
      CompanyName: userProfile?.CompanyName || "",
      OwnerName: userProfile?.OwnerName || "",
    }

    logUserEvent(user.CompanyId, "LOGIN", `User ${user.EmailAddress} logged in.`)

    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })

    let statusCode, message, roleSpecificId

    switch (user.Role) {
      case "Company":
        roleSpecificId = user.CompanyId
        statusCode = "200"
        message = "Company Login Successful!"
        break
      case "Superadmin":
        roleSpecificId = user.UserId
        statusCode = "300"
        message = "Superadmin Login Successful!"
        break
      case "Worker":
        roleSpecificId = user.UserId
        statusCode = "302"
        message = "Worker Login Successful!"
        break
      case "Customer":
        roleSpecificId = user.UserId
        statusCode = "303"
        message = "Customer Login Successful!"
        break
      default:
        return res.status(400).json({ statusCode: "204", message: "Invalid Role. Please contact support." })
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
    })
  } catch (error) {
    console.error("Login Error:", error)
    res.status(500).json({ message: "Something went wrong, please try later!" })
  }
}

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
    console.error('Error during token verification:', error.message);
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
      return res.status(tokenResult.statusCode).json({ message: tokenResult.message });
    }

    const user = tokenResult.data;

    const company = await User.findOne({ CompanyId: user.CompanyId, IsDelete: false });

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Company found",
      Role: company.Role,
      data: company,
    });
  } catch (error) {
    console.error("Error in verifyAndFetchCompany:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
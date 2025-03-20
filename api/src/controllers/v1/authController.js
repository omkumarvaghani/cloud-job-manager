const User = require("../../models/User/User");
const UserProfile = require("../../models/User/UserProfile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const { logUserEvent } = require("../../middleware/eventMiddleware");
const { verifyToken } = require("../../middleware/authMiddleware");

const secretKey = process.env.SECRET_KEY;

const generateToken = (user) => {
  return jwt.sign(
    { id: user.UserId, role: user.Role, CompanyId: user.CompanyId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || "7d" }
  );
};

// **REGISTER API**
exports.register = async (req, res) => {
  try {
    const { Role, EmailAddress, Password, ...profileDetails } = req.body;

    const existingUser = await User.findOne({ EmailAddress, IsDelete: false });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already taken." });
    }

    let CompanyId = profileDetails.CompanyId;
    if (Role === "Company") {
      CompanyId = uuidv4();
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
      message: "User created successfully",
      user: {
        id: newUser.UserId,
        email: newUser.EmailAddress,
        role: newUser.Role,
        CompanyId: newUser.CompanyId || null,
      },
      token,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

// **LOGIN API**
exports.login = async (req, res) => {
  try {
    const { EmailAddress, Password } = req.body;

    // **Find user**
    const user = await User.findOne({ EmailAddress, IsDelete: false });
    console.log(user, "user");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // const isMatch = await bcrypt.compare(Password, user.Password);
    // console.log("Password Match:", isMatch);
    // if (!isMatch) {
    //   return res.status(401).json({ message: "Invalid email or password" });
    // }

    if (!user.IsActive) {
      return res
        .status(400)
        .json({ message: "Account is deactivated. Please contact support." });
    }
    console.log(user, "user");

    // **Fetch user profile**
    const userProfile = await UserProfile.findOne({ UserId: user.UserId });
    console.log(userProfile, "userProfile");
    const tokenData = {
      UserId: user.UserId,
      EmailAddress: user.EmailAddress,
      Role: user.Role,
      ProfileImage: userProfile?.ProfileImage || null,
      CompanyId: user.CompanyId,
      OwnerName: userProfile?.OwnerName || "",
    };

    logUserEvent(user.CompanyId, "LOGIN", `User ${user.EmailAddress} logged in.`);

    const token = generateToken(tokenData);
    console.log("Token Data:", tokenData);
    return res.status(200).json({
      statusCode: "200",
      message: `${user.Role} Authenticated`,
      token,
      user: tokenData,
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
// exports.getTokenData = async (req, res) => {
//   try {
//     const token = req.query.token || req.body.token;

//     if (!token) {
//       return res.status(400).json({
//         statusCode: 400,
//         message: "Token is required",
//       });
//     }

//     let data = verifyToken(token, secretKey);

//     if (data.Role === "Admin") {
//       const superadminData = await UserProfile.findOne({
//         UserId: data?.UserId,
//       });

//       if (superadminData) {
//         data = {
//           ...data,
//           ...superadminData.toObject(),
//           FirstName: superadminData.FirstName,
//           LastName: superadminData.LastName,
//         };
//       }
//     }

//     return res.status(200).json({
//       statusCode: 200,
//       data,
//     });
//   } catch (error) {
//     console.error(error.message);
//     return res.status(500).json({
//       statusCode: 500,
//       message: "Something went wrong, please try later!",
//     });
//   }
// };

// // Middleware to check token and company status
// exports.checkTokenData = async (req, res, next) => {
//   try {
//     const { token } = req.body;
//     const response = await getTokenData({ query: { token } }, res);

//     if (response?.data?.CompanyId) {
//       const companyFind = await User.findOne({
//         CompanyId: response?.data?.CompanyId,
//       });

//       if (companyFind && !companyFind.IsActive) {
//         return res.status(401).json({
//           statusCode: 401,
//           message: "Company is inactive. Please log in again.",
//         });
//       }
//     }

//     req.tokenData = response.data;
//     next();
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({
//       statusCode: 500,
//       message: "Something went wrong, please try later!",
//     });
//   }
// };

const decodeToken = async (token) => {
  if (!token) {
    return { statusCode: 400, message: "Token is required" };
  }

  let data;
  try {
    data = verifyToken(token);
  } catch (error) {
    console.error("Error in verifyToken:", error);
    return { statusCode: 401, message: "Invalid token" };
  }

  if (!data) {
    return { statusCode: 401, message: "Invalid token" };
  }

  if (data.Role === "Admin") {
    const superadminData = await UserProfile.findOne({
      UserId: data?.UserId,
    });

    if (superadminData) {
      data = {
        ...data,
        ...superadminData.toObject(),
        FirstName: superadminData.FirstName,
        LastName: superadminData.LastName,
      };
    }
  }

  return { statusCode: 200, data };
};

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

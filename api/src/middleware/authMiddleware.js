const jwt = require("jsonwebtoken");
const crypto = require("crypto-js");
require("dotenv").config();

const secretKey = process.env.JWT_SECRET || "f00e2fb1a87d0663bfc7f38cbab5091e0326e6e668a315a587b54ac2ee98456e";

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization
  ) {
    token = req.headers.authorization.split(" ")[1];
  }


  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET ||
      "f00e2fb1a87d0663bfc7f38cbab5091e0326e6e668a315a587b54ac2ee98456e"
    );
    req.user = {
      UserId: decoded.UserId,
      Role: decoded.Role,
      CompanyId: decoded.CompanyId,
    };

    next();
  } catch (error) {
    console.log(token, '222')
    res.status(401).json({ error: "Not authorized, token failed" });
  }
};

// const protect = async (req, res, next) => {
//   try {
//     const authHeader = req.headers["authorization"];
//     const idHeader = req.headers["id"];
//     const token = authHeader && authHeader.split(" ")[1];
//     const id = idHeader && idHeader.split(" ")[1];

//     if (!token || !id) {
//       return res.status(401).json({
//         statusCode: 401,
//         message: "Authorization token and Id are required",
//       });
//     }

//     let decoded; // Declare decoded before using it
//     try {
//       decoded = jwt.verify(
//         token,
//         process.env.JWT_SECRET ||
//         "f00e2fb1a87d0663bfc7f38cbab5091e0326e6e668a315a587b54ac2ee98456e"
//       );
//     } catch (error) {
//       return res.status(401).json({
//         statusCode: 401,
//         message: "Invalid or expired token",
//       });
//     }

//     console.log(decoded, "decoded");

//     // Fix for Company role comparison
//     if (
//       (decoded.Role === "Admin" && id !== decoded.UserId) ||
//       (decoded.Role === "Company" && !(Array.isArray(decoded.CompanyId) ? decoded.CompanyId.includes(id) : id === decoded.CompanyId)) ||
//       (decoded.Role === "Customer" && id !== decoded.UserId) ||
//       (decoded.Role === "Worker" && id !== decoded.UserId)
//     ) {
//       return res.status(401).json({
//         statusCode: 401,
//         error: "User is not verified or does not have the correct ID for the role",
//       });
//     }

//     req.user = {
//       UserId: decoded.UserId,
//       Role: decoded.Role,
//       CompanyId: decoded.CompanyId,
//     };

//     next();
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       statusCode: 500,
//       message: "Authorization token is expired or invalid",
//     });
//   }
// };

const decryptData = (ciphertext) => {
  const bytes = crypto.AES.decrypt(ciphertext, secretKey);
  const originalText = bytes.toString(crypto.enc.Utf8);
  return originalText;
};

const verifyToken = (token) => {
  try {
    const decodedData = jwt.verify(token, secretKey);
    return decodedData;
  } catch (err) {
    console.error('Token verification error:', err.message);
    if (err.name === 'JsonWebTokenError') {
      throw new Error("Invalid token");
    }
    if (err.name === 'TokenExpiredError') {
      throw new Error("Token expired");
    }
    throw new Error("Token verification failed");
  }
};


module.exports = {
  decryptData,
  verifyToken,
  protect,
};

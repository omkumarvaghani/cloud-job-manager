const jwt = require("jsonwebtoken");
const User = require("../models/User/User");
require("dotenv").config();
const bcrypt = require("bcryptjs");

var SECRET_KEY =
  "fuirfgerug^%GF(Fijrijgrijgidjg#$@#$TYFSD()*$#%^&S(*^uk8olrgrtg#%^%#gerthr%B&^#eergege*&^#gg%*B^";

const secretKey =
  process.env.JWT_SECRET ||
  "f00e2fb1a87d0663bfc7f38cbab5091e0326e6e668a315a587b54ac2ee98456e";

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization) {
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
    const companyExists = await User.findOne({ CompanyId: decoded.CompanyId });

    if (!companyExists) {
      return res
        .status(401)
        .json({ error: "Not authorized, invalid CompanyId" });
    }

    next();
  } catch (error) {
    res.status(401).json({ error: "Not authorized, token failed" });
  }
};

const createResetToken = async (data) => {
  let token = await jwt.sign(data, SECRET_KEY, {
    expiresIn: "4h",
  });
  return token;
};

const encryptData = async (data) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(data, saltRounds);
  return hashedPassword;
};

const decryptData = async (plainText, hashedPassword) => {
  const isMatch = await bcrypt.compare(plainText, hashedPassword);
  return isMatch;
};

const verifyToken = (token) => {
  try {
    const decodedData = jwt.verify(token, secretKey);
    return decodedData;
  } catch (err) {
    console.error("Token verification error:", err.message);
    if (err.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    if (err.name === "TokenExpiredError") {
      throw new Error("Token expired");
    }
    throw new Error("Token verification failed");
  }
};
const verifyResetToken = async (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log(decoded, "878878");
    const currentTimestamp = Date.now() / 1000;

    if (currentTimestamp >= decoded.exp) {
      return { status: false, data: null };
    }

    return { status: true, data: decoded };
  } catch (err) {
    console.log(err);
    return { status: false, data: null };
  }
};

module.exports = {
  decryptData,
  verifyToken,
  protect,
  createResetToken,
  verifyResetToken,
  encryptData,
};

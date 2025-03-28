const jwt = require("jsonwebtoken");
const crypto = require("crypto-js");
require("dotenv").config();

var SECRET_KEY =
  "fuirfgerug^%GF(Fijrijgrijgidjg#$@#$TYFSD()*$#%^&S(*^uk8olrgrtg#%^%#gerthr%B&^#eergege*&^#gg%*B^";

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

const createResetToken = async (data) => {
  let token = await jwt.sign(data, SECRET_KEY, {
    expiresIn: "4h",
  });
  return token;
};

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
  createResetToken
};

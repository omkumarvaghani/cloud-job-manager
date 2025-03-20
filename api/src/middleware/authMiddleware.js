const jwt = require("jsonwebtoken");
const crypto = require("crypto-js");
const secretKey = process.env.SECRET_KEY;

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
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

    console.log("Decoded Token:", decoded);
    req.user = {
      id: decoded.id,
      Role: decoded.role,
      CompanyId: decoded.CompanyId,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Not authorized, token failed" });
  }
};

const decryptData = (ciphertext) => {
  const bytes = crypto.AES.decrypt(ciphertext, secretKey);
  const originalText = bytes.toString(crypto.enc.Utf8);
  return originalText;
};

const verifyToken = (token) => {
  const decryptedData = decryptData(token, secretKey);

  if (!decryptedData) {
    return { message: "Token invalid" };
  }

  const parsedData = JSON.parse(decryptedData);

  if (Date.now() > parsedData.exp) {
    return { message: "Token expired" };
  }

  return parsedData;
};

module.exports = {
  decryptData,
  verifyToken,
  protect,
};

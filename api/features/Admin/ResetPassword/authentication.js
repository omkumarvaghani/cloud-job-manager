var JWT = require("jsonwebtoken");

var SECRET_KEY =
  "fuirfgerug^%GF(Fijrijgrijgidjg#$@#$TYFSD()*$#%^&S(*^uk8olrgrtg#%^%#gerthr%B&^#eergege*&^#gg%*B^";

const   createResetToken = async (data) => {
  let token = await JWT.sign(data, SECRET_KEY, {
    expiresIn: "4h",
  });
  return token;
};

const verifyResetToken = async (token) => {
  try {
    const decoded = JWT.verify(token, SECRET_KEY);
    const currentTimestamp = Date.now() / 1000;

    if (currentTimestamp >= decoded.exp) {
      return { status: false, data: null };
    }

    return { status: true, data: decoded };
  } catch (err) {
    return { status: false, data: null };
  }
};

module.exports = {
  createResetToken,
  verifyResetToken,
};

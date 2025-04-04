const express = require("express");
const {
  forgetPaswordMail,
  updatePassword,
  checkTokenStatus,
} = require("../../controllers/v1/User/resetPasswordController");
const router = express.Router();

router.post("/resetpasswordmail", forgetPaswordMail);

router.get("/check_token_status/:token", checkTokenStatus);

router.put("/reset_passwords/:mail", updatePassword);

module.exports = router;

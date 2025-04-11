const express = require("express");
const {
  forgetPaswordMail,
  updatePassword,
  checkTokenStatus,
  checkForgetTokenStatus,
  updateForgetPassword,
} = require("../../controllers/v1/User/resetPasswordController");
const router = express.Router();

router.post("/resetpasswordmail", forgetPaswordMail);

router.get("/check_forget_token_status/:token", checkForgetTokenStatus);
router.get("/check_token_status/:token", checkTokenStatus);

router.put("/reset_passwords/:mail", updatePassword);
router.put("/reset_forget_passwords/:mail", updateForgetPassword);

module.exports = router;

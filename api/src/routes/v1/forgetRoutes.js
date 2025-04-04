const express = require("express");
const {
  forgetPaswordMail,
  updatePassword,
} = require("../../controllers/v1/User/resetPasswordController");
const router = express.Router();

router.post("/resetpasswordmail", forgetPaswordMail);

router.put("/reset_passwords/:mail", updatePassword);

module.exports = router;

const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { getMailPreference, updateMailPreference } = require("../../controllers/v1/User/mail-preferenceController");

const router = express.Router();

router.get("/", protect, getMailPreference);

router.put("/", protect, updateMailPreference);

module.exports = router;

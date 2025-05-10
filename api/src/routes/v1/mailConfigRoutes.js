const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { createMailConfiguration, getMailConfigurationDetails, getMailConfigurations, updateMailConfiguration, deleteMailConfiguration, testMailConfiguration } = require("../../controllers/v1/Admin/mailConfigController");

const router = express.Router();

router.post("/", protect, createMailConfiguration);
router.post("/test_mail", protect, testMailConfiguration);

router.get("/", protect, getMailConfigurations);
router.get("/:MailConfigurationId", protect, getMailConfigurationDetails);

router.put("/:MailConfigurationId", protect, updateMailConfiguration);

router.delete("/:MailConfigurationId", protect, deleteMailConfiguration);

module.exports = router;

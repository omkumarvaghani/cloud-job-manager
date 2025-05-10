const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { getEmailLogs } = require("../../controllers/v1/User/emailLogController");
const router = express.Router();

router.get('/', getEmailLogs);


module.exports = router;

const express = require("express");
const {
  createSignatureRequest,
} = require("../../controllers/v1/User/dropboxController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/signature_request/send", protect, createSignatureRequest);

module.exports = router;

const express = require("express");
const {
    createInvoice,
} = require("../../controllers/v1/User/invoiceController");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createInvoice);

module.exports = router;

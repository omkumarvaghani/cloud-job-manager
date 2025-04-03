const express = require("express");
const {
    createInvoice,
    checkInvoiceNumber,
    getMaxInvoiceNumber,
    getScheduleData,
} = require("../../controllers/v1/User/invoiceController");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createInvoice);
router.post("/check_number", protect, checkInvoiceNumber);

router.get("/get_number", protect, getMaxInvoiceNumber);
router.get("/invoice_schedule", protect, getScheduleData);

module.exports = router;

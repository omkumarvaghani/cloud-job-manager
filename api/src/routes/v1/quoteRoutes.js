const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { createQuoteWithDetails, checkQuoteNumberExists, getCustomerQuotes, getQuotes, getQuoteDetails, getMaxQuoteNumber, updateQuote, deleteQuoteAndRelatedData } = require("../../controllers/v1/User/quoteController");
const router = express.Router();

router.post("/", protect, createQuoteWithDetails);
router.post("/check_number/:CompanyId", protect, checkQuoteNumberExists);
router.get("/get_number/:CompanyId", protect, getMaxQuoteNumber);
router.get("/quotes/:UserId", protect, getCustomerQuotes);
router.get("/quote_details/:QuoteId", protect, getQuoteDetails);
router.get("/get_quotes/:CompanyId", protect, getQuotes);
router.put("/:QuoteId", protect, updateQuote);
router.delete("/:QuoteId", protect, deleteQuoteAndRelatedData);

module.exports = router;

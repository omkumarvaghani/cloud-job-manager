const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { createQuoteWithDetails, checkQuoteNumberExists, getCustomerQuotes, getQuotes, getQuoteDetails, getMaxQuoteNumber, updateQuote, deleteQuoteAndRelatedData, approveQuote, getScheduleData, fetchQuoteDetails, getQuotesByCustomer } = require("../../controllers/v1/User/quoteController");
const router = express.Router();

router.post("/", protect, createQuoteWithDetails);
router.post("/check_number/:CompanyId", protect, checkQuoteNumberExists);

router.get("/get_number/:CompanyId", protect, getMaxQuoteNumber);
router.get("/quotes/:CustomerId", protect, getCustomerQuotes);
router.get("/quote_details/:QuoteId", protect, getQuoteDetails);
router.get("/get_quotes/:CompanyId", protect, getQuotes);
router.get("/approve/:QuoteId", protect, approveQuote);
router.get("/shedule/:CompanyId", protect, getScheduleData);
router.get("/detail/:QuoteId", protect, fetchQuoteDetails);
router.get("/get_quotes_customer/:CompanyId/:CustomerId", protect, getQuotesByCustomer);

router.put("/:QuoteId", protect, updateQuote);

router.patch("/approve/:QuoteId", protect, approveQuote);

router.delete("/:QuoteId", protect, deleteQuoteAndRelatedData);

module.exports = router;

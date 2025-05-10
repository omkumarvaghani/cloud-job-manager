const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { createCompanyMail, getCompanyMailDetails, getCompanyMail, updateCompanyMailDetails, deleteCompanyMailDetails } = require("../../controllers/v1/Admin/companyMailController");
const router = express.Router();

router.post("/", protect, createCompanyMail);

router.get("/:CompanyMailId", protect, getCompanyMailDetails);
router.get("/company/:CompanyId", protect, getCompanyMail);

router.put("/update-company-mail/:CompanyMailId", protect, updateCompanyMailDetails);

router.delete("/:CompanyMailId", protect, deleteCompanyMailDetails);

module.exports = router;

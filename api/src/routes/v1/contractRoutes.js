const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { createContract, checkContractNumber, } = require("../../controllers/v1/User/contractController");

const router = express.Router();

router.post("/", protect, createContract);
router.post("/check_number/:CompanyId", protect, checkContractNumber);

module.exports = router;

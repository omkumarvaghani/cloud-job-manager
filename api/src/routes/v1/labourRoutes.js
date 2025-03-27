const express = require("express");
const {
    createLabour,
    fetchLabourData,
} = require("../../controllers/v1/User/labourController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post('/', protect, createLabour);

router.get('/:ContractId/:CompanyId', protect, fetchLabourData);

module.exports = router;

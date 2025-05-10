const express = require("express");
const {
    createLabour,
    fetchLabourData,
    updateLabour,
    deleteLabourData,
} = require("../../controllers/v1/User/labourController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post('/', protect, createLabour);

router.get('/:ContractId/:CompanyId', protect, fetchLabourData);

router.put('/:LabourId/:ContractId', protect, updateLabour);

router.delete('/:LabourId/:ContractId', protect, deleteLabourData);

module.exports = router;

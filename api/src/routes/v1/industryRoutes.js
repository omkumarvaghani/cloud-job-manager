const express = require("express");
const {
    addIndustry,
    getIndustries,
    updateIndustry,
    deleteIndustry,
    getIndustrie
} = require("../../controllers/v1/Admin/industryController");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, addIndustry);
router.get("/", protect, getIndustries);
router.put("/:IndustryId", protect, updateIndustry);
router.delete("/:IndustryId", protect, deleteIndustry);
router.get("/dropdown", getIndustrie);

module.exports = router;

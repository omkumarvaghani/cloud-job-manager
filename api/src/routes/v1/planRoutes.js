const express = require("express");
const {
    createPlan,
    getPlans,
    getPlansGraphData,
    updatePlan,
    deletePlan,
    getAllPlans,
} = require("../../controllers/v1/Admin/planController");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPlan);
router.get("/", protect, getPlans);
router.get("/graph", protect, getPlansGraphData);
router.put("/:PlanId", protect, updatePlan);
router.delete("/:PlanId", protect, deletePlan);
router.get("/plan", protect, getAllPlans);

module.exports = router;

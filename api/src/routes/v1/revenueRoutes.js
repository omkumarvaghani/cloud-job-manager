const express = require("express");
const {
  addRevenue,
  getRevenues,
  updateRevenue,
  deleteRevenue,
  getAllRevenue,
} = require("../../controllers/v1/Admin/revenueController");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/", addRevenue);
router.get("/", protect, getRevenues);
router.put("/:RevenueId", protect, updateRevenue);
router.delete("/:RevenueId", protect, deleteRevenue);
router.get("/dropdown", getAllRevenue);

module.exports = router;

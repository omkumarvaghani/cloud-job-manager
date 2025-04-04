const express = require("express");
const {
  getAllWorkers,
  updateWorkerProfile,
  getWorkerData,
} = require("../../controllers/v1/User/workerController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.get("/get", protect, getAllWorkers);
router.get("/profile/:UserId", protect, getWorkerData);

router.put("/profile/:UserId", protect, updateWorkerProfile);

module.exports = router;

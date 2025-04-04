const express = require("express");
const {
  getAllWorkers,
  updateWorkerProfile,
  getWorkerData,
  sendWelcomeEmailToWorker,
} = require("../../controllers/v1/User/workerController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/send_mail/:UserId", protect, sendWelcomeEmailToWorker);

router.get("/get", protect, getAllWorkers);
router.get("/profile/:UserId", protect, getWorkerData);

router.put("/profile/:UserId", protect, updateWorkerProfile);

module.exports = router;

const express = require("express");
const {
  getAllWorkers,
  updateWorkerProfile,
  getWorkerData,
  sendWelcomeEmailToWorker,
  updateWorkerChangePass,
} = require("../../controllers/v1/User/workerController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/send_mail/:UserId", protect, sendWelcomeEmailToWorker);

router.get("/get", protect, getAllWorkers);
router.get("/profile/:UserId", protect, getWorkerData);

router.put("/profile/:UserId", protect, updateWorkerProfile);
router.put("/change-password/:UserId", protect, updateWorkerChangePass);

module.exports = router;

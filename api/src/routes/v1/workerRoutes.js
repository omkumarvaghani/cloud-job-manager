const express = require("express");
const {
    getAllWorkers,
} = require("../../controllers/v1/User/workerController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.get("/get", protect, getAllWorkers);


module.exports = router;

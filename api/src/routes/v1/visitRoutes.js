const express = require("express");
const {
    createVisit
} = require("../../controllers/v1/User/visitController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, createVisit);

module.exports = router;

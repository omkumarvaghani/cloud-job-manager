const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { addLocation, updateLocation, getPropertyByLocationId, deleteLocation } = require("../../controllers/v1/User/locationController");

const router = express.Router();

router.post("/", protect, addLocation);
router.put("/:LocationId", protect, updateLocation);
router.get("/properties/:LocationId", protect, getPropertyByLocationId);
router.delete("/:LocationId", protect, deleteLocation);

module.exports = router;

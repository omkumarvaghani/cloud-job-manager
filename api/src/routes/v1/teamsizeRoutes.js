const express = require("express");
const {
  addTeamSize,
  getTeamSizes,
  updateTeamSize,
  deleteTeamSize,
  getTeamSizesDropdown,
} = require("../../controllers/v1/Admin/teamsizeController");
const { protect } = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/", addTeamSize);
router.get("/", protect, getTeamSizes);
router.put("/:TeamSizeId", protect, updateTeamSize);
router.delete("/:TeamSizeId", protect, deleteTeamSize);
router.get("/dropdown", getTeamSizesDropdown);

module.exports = router;

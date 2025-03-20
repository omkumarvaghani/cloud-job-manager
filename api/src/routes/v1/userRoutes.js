const express = require("express");
const {
  createUser,
  companyProfile,
  getCompanyDropdown,
  updateCompanyProfile,
  getAllUsers,
  getUserById,
  updateUser
} = require("../../controllers/v1/User/userController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, createUser);
router.get("/:CompanyId", protect, getUserById);
router.put("/:UserId", protect, updateUser);
router.get("/", protect, getAllUsers);

router.get("/profile/:CompanyId", protect, companyProfile);
router.get("/dropdown", protect, getCompanyDropdown);
router.put("/update-profile/:CompanyId", protect, updateCompanyProfile);

module.exports = router;

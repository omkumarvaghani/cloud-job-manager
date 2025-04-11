const express = require("express");
const {
  createUser,
  companyProfile,
  getCompanyDropdown,
  updateCompanyProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCompanyData,
  updateChangeCompanyPass,
} = require("../../controllers/v1/User/userController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, createUser);

router.get("/:UserId", protect, getUserById);
router.get("/company-profile/:CompanyId", protect, getCompanyData);
router.get("/", protect, getAllUsers);
router.get("/profile/:CompanyId", protect, companyProfile);
router.get("/dropdown", protect, getCompanyDropdown);

router.put("/:UserId", protect, updateUser);
router.put("/change-password/:CompanyId", protect, updateChangeCompanyPass);
router.put("/update-profile/:CompanyId", protect, updateCompanyProfile);

router.delete("/:UserId", protect, deleteUser);

module.exports = router;

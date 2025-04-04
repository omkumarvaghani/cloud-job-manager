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
  getUserByCompanyId,
} = require("../../controllers/v1/User/userController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, createUser);
router.get("/:UserId", protect, getUserById);
router.put("/:UserId", protect, updateUser);
router.delete("/:UserId", protect, deleteUser);
router.get("/company-profile", protect, getUserByCompanyId);

router.get("/", protect, getAllUsers);

router.get("/profile/:CompanyId", protect, companyProfile);
router.get("/dropdown", protect, getCompanyDropdown);
router.put("/update-profile/:CompanyId", protect, updateCompanyProfile);


module.exports = router;

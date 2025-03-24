const express = require("express");
const {
  createUser,
  addLocation,
  companyProfile,
  getCompanyDropdown,
  updateCompanyProfile,
  getAllUsers,
  getUserById,
  updateUser,
  getCustomersByCompanyId,
  deleteUser,
  getUserByCompanyId,
  getCustomersWithLocations
} = require("../../controllers/v1/User/userController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, createUser);
router.post("/location", protect, addLocation);
router.get("/:UserId", protect, getUserById);
router.put("/:UserId", protect, updateUser);
router.delete("/:UserId", protect, deleteUser);
router.get("/:CompanyId", protect, getUserByCompanyId);

router.get("/", protect, getAllUsers);

router.get("/profile/:CompanyId", protect, companyProfile);
router.get("/dropdown", protect, getCompanyDropdown);
router.put("/update-profile/:CompanyId", protect, updateCompanyProfile);

router.get('/customers/:CompanyId', protect, getCustomersByCompanyId);
router.get('/get_customer/:CompanyId', protect, getCustomersWithLocations);

module.exports = router;

const express = require("express");
const {
  getCustomerDetail,
  getCustomersByCompanyId,
  getCustomersWithLocations,
  getUserDetailWithInvoices,
  sendWelcomeEmailToCustomer,
  updateCustomerProfile,
  getCustomerData,
} = require("../../controllers/v1/User/customerController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/send_mail/:UserId", protect, sendWelcomeEmailToCustomer);

router.get("/profile/:UserId", protect, getCustomerData);
router.get("/customers", protect, getCustomersByCompanyId);
router.get("/detail/:CustomerId", protect, getCustomerDetail);
router.get("/get_customer/:CompanyId", protect, getCustomersWithLocations);
router.get("/:UserId", protect, getUserDetailWithInvoices);

router.put("/profile/:UserId", protect, updateCustomerProfile);

module.exports = router;

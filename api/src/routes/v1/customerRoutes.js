const express = require("express");
const {
    getCustomerDetail,
    getCustomersByCompanyId,
    getCustomersWithLocations,
    getUserDetailWithInvoices,
    sendWelcomeEmailToCustomer
} = require("../../controllers/v1/User/customerController");
const { protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post('/send_mail/:UserId', protect, sendWelcomeEmailToCustomer);

router.get('/customers/:CompanyId', protect, getCustomersByCompanyId);
router.get('/detail/:UserId', protect, getCustomerDetail);
router.get('/get_customer/:CompanyId', protect, getCustomersWithLocations);
router.get('/:UserId', protect, getUserDetailWithInvoices);


module.exports = router;

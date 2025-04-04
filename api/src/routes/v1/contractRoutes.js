const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { createContract, checkContractNumber, getContracts, getContractDetails, getMaxContractNumber, getContractByCustomer, updateContract, deleteContract, getInvoiceDataByCustomerId, getContractCustomerProperty, generateContractPdf, sendContractEmail, } = require("../../controllers/v1/User/contractController");

const router = express.Router();

router.post("/", protect, createContract);
router.post("/check_number/:CompanyId", protect, checkContractNumber);
router.post("/contractpdf/:ContractId", protect, generateContractPdf);
router.post("/send_mail", protect, sendContractEmail);

router.get("/:CompanyId", protect, getContracts);
router.get("/contract_details/:ContractId", protect, getContractDetails);
router.get("/get_number/:CompanyId", protect, getMaxContractNumber);
router.get("/get_contract_customer/:CompanyId/:CustomerId", protect, getContractByCustomer);
router.get("/get_invoice_data/:CustomerId", protect, getInvoiceDataByCustomerId);
router.get("/get_contract_customer_property/:CustomerId/:LocationId", protect, getContractCustomerProperty);

router.put("/:ContractId", protect, updateContract);

router.delete("/:ContractId", protect, deleteContract);

module.exports = router;

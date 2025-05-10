const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { createContract, checkContractNumber, getContracts, getContractDetails, getMaxContractNumber, getContractByCustomer, updateContract, deleteContract, getInvoiceDataByCustomerId, } = require("../../controllers/v1/User/contractController");

const router = express.Router();

router.post("/", protect, createContract);
router.post("/check_number/:CompanyId", protect, checkContractNumber);

router.get("/:CompanyId", protect, getContracts);
router.get("/contract_details/:ContractId", protect, getContractDetails);
router.get("/get_number/:CompanyId", protect, getMaxContractNumber);
router.get("/get_contract_customer/:CompanyId/:CustomerId", protect, getContractByCustomer);
router.get("/get_invoice_data/:CustomerId", protect, getInvoiceDataByCustomerId);

router.put("/:ContractId", protect, updateContract);

router.delete("/:ContractId", protect, deleteContract);

module.exports = router;

const express = require("express");
const { protect } = require("../../middleware/authMiddleware");
const { createExpense, getExpenseData, updateExpense, deleteExpenseData } = require("../../controllers/v1/User/expenseController");
const router = express.Router();

router.post('/', protect, createExpense);

router.get('/:ExpenseId/:ContractId', protect, getExpenseData);

router.put('/:ExpenseId/:ContractId', protect, updateExpense);

router.delete('/:ExpenseId/:ContractId', protect, deleteExpenseData);

module.exports = router;

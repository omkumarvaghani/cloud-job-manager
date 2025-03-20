const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const expensesSchema = new Schema(
  {
    ContractId: { type: String },
    CompanyId: { type: String },
    ExpenseId: { type: String },
    WorkerId: { type: String },

    ItemName: { type: String },
    AccountingCode: { type: String },
    Description: { type: String },
    Date: { type: String },
    Total: { type: String },
    Attachment: { type: String },
    DeleteReason: {type: String}, 

    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Expenses", expensesSchema);

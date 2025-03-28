const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const expensesSchema = new Schema(
    {
        ContractId: { type: String },
        CompanyId: { type: String },
        ExpenseId: {
            type: String,
            default: uuidv4,
            unique: true,
        },
        WorkerId: { type: String },

        ItemName: { type: String },
        Description: { type: String },
        Date: { type: Date },
        Total: { type: String },
        Attachment: { type: String },
        DeleteReason: { type: String },

        IsDelete: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Expenses", expensesSchema);

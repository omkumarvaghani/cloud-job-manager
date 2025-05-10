const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const LedgerSchema = new mongoose.Schema({
    LedgerId: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    InvoiceId: { type: String, ref: "Invoice" },
    CompanyId: { type: String },
    CustomerId: { type: String },
    TotalCharge: { type: Number, default: 0 },
    TotalPayment: { type: Number, default: 0 },
    PaymentCount: { type: Number, default: 0 },
    Balance: { type: Number, default: 0 },
    ChargePayments: [{
        ChargeId: { type: String, ref: "Charge" },
        Amount: { type: Number },
        Type: { type: String, enum: ['charge', 'payment'] },
        Description: { type: String },
        CreatedAt: { type: Date, default: Date.now },
    }],
    IsDelete: { type: Boolean, default: false },
});

module.exports = mongoose.model("Ledger", LedgerSchema);

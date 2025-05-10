const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const InvoiceSchema = new Schema(
    {
        InvoiceId: {
            type: String,
            default: uuidv4,
            unique: true,
        },
        CompanyId: { type: String },
        ContractId: { type: String },
        CustomerId: { type: String },
        LocationId: { type: String },
        WorkerId: { type: Array },
        AccountId: { type: String },

        Subject: { type: String },
        InvoiceNumber: { type: String },
        IssueDate: { type: String },
        DueDate: { type: String },
        description: { type: String },
        PaymentDue: { type: String, default: "Upon Receipt" },

        Message: { type: String },
        Notes: { type: String },
        ContractDisclaimer: { type: String },
        Discount: { type: String },
        Tax: { type: String },
        subTotal: { type: String },
        Total: { type: String },
        Attachment: { type: Array },
        DeleteReason: { type: String },
        Status: {
            type: String,
            default: "Unpaid",
        },

        LinkNote: { type: Boolean, default: false },
        IsDelete: { type: Boolean, default: false },
        Ledger: {
            TotalCharge: {
                type: Number,
                default: 0,
            },
            TotalPayment: {
                type: Number,
                default: 0,
            },
            PaymentCount: {
                type: Number,
                default: 0,
            },
            Balance: {
                type: Number,
                default: 0,
            },
            ChargePayments: [{
                ChargeId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Charge',
                },
                Amount: Number,
                Type: String,
                Description: String,
            }],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Invoice", InvoiceSchema);

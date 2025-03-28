const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuoteSchema = new Schema(
    {
        CompanyId: {
            type: String,
            trim: true
        },
        UserId: {
            type: String,
            trim: true
        },
        QuoteId: {
            type: String,
            unique: true,
            trim: true
        },
        Title: {
            type: String,
            trim: true
        },
        QuoteNumber: {
            type: String,

            trim: true
        },
        SubTotal: {
            type: String,
        },
        Discount: {
            type: String,
        },
        Tax: {
            type: String,
        },
        Total: {
            type: String,
        },
        CustomerMessage: {
            type: String,
            trim: true
        },
        ContractDisclaimer: {
            type: String,
            trim: true
        },
        Notes: {
            type: String,
            trim: true
        },
        Attachment: {
            type: [String],
            default: []
        },
        Status: {
            type: String,
            default: "Draft",
            required: true
        },

        DeleteReason: {
            type: String,
            trim: true
        },
        ChangeRequest: {
            type: [String],
            default: []
        },
        // Signature
        SignatureType: {
            type: String,

        },
        Signature: {
            type: String,
            trim: true
        },
        ApproveDate: {
            type: String,
        },
        IsDelete: {
            type: Boolean,
            default: false
        },
        IsApprovedByCustomer: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Quote", QuoteSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuoteDetailsSchema = new Schema(
    {
        QuoteItemId: {
            type: String,
            unique: true,
            trim: true
        },
        QuoteId: {
            type: String,
            trim: true
        },
        CompanyId: {
            type: String,
            trim: true
        },
        UserId: {
            type: String,
            trim: true
        },
        Type: {
            type: String,
            trim: true
        },
        Name: {
            type: String,
            trim: true
        },
        Description: {
            type: String,
            trim: true
        },
        Unit: {
            type: String,
            trim: true
        },
        CostPerUnit: {
            type: String,
        },
        Hourly: {
            type: String,
        },
        CostPerHour: {
            type: String,
        },
        Square: {
            type: String,
        },
        CostPerSquare: {
            type: String,
        },
        Fixed: {
            type: String,
        },
        CostPerFixed: {
            type: String,
        },
        Total: {
            type: String,
        },
        Attachment: {
            type: String,
            trim: true
        },
        IsDelete: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true,
    }
);

QuoteDetailsSchema.index({ QuoteId: 1, CompanyId: 1 });
QuoteDetailsSchema.index({ UserId: 1 });
QuoteDetailsSchema.index({ IsDelete: 1 });


module.exports = mongoose.model("Quote-Items", QuoteDetailsSchema);

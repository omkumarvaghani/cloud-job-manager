const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ChargeSchema = new mongoose.Schema({
    ChargeId: {
        type: String,
        default: uuidv4,
        unique: true,
    },
    InvoiceId: { type: String, ref: "Invoice" },
    RecurringChargeId: { type: String },
    CompanyId: { type: String },
    CustomerId: { type: String },
    LocationId: { type: Array },
    ChargeAmount: { type: Number, required: true }, 
    PaymentAmount: { type: Number, default: 0 }, 
    Description: { type: String },
    ChargeDate: { type: Date, default: Date.now },
    IsDelete: { type: Boolean, default: false },
    IsRecurring: { type: Boolean, default: true }, 
});

module.exports = mongoose.model("Charge", ChargeSchema);

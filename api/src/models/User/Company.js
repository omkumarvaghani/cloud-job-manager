const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
    {
        CompanyId: { type: String, required: true, unique: true },
        CompanyName: { type: String, required: true },
        IsTrial: { type: Boolean, default: true },
        IsActive: { type: Boolean, default: true },
        IsDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Company", CompanySchema);

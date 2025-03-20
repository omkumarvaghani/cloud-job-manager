const mongoose = require("mongoose");

const IndustrySchema = new mongoose.Schema(
    {
        IndustryId: {
            type: String,
        },
        Industry: {
            type: String,
        },
        IsDelete: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("industries", IndustrySchema);

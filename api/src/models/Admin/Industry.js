const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const IndustrySchema = new mongoose.Schema(
    {
        IndustryId: {
            type: String,
            default: uuidv4,
            unique: true,
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

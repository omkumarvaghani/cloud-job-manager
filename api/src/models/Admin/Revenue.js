const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const RevenueSchema = new mongoose.Schema(
    {
        RevenueId: {
            type: String,
            default: uuidv4,
            unique: true,
        },
        Revenue: {
            type: String,
            required: true,
            trim: true,
        },
        IsDelete: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("revenues", RevenueSchema);

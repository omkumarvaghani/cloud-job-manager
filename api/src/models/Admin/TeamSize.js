const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const TeamSizeSchema = new mongoose.Schema(
    {
        TeamSizeId: {
            type: String,
            default: uuidv4,
            unique: true,
        },
        TeamSize: {
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

module.exports = mongoose.model("team-sizes", TeamSizeSchema);

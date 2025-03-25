const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const MaterialsAndLaborSchema = new mongoose.Schema(
    {
        AdminId: {
            type: String,
        },
        CompanyId: {
            type: String,
        },
        ProductId: {
            type: String,
            default: uuidv4,
            unique: true,
        },
        OldProductId: {
            type: String,
        },

        Type: {
            type: String,
        },
        Name: {
            type: String,
        },
        Description: {
            type: String,
        },

        Hourly: {
            type: Number,
            default: null,
        },
        CostPerHour: {
            type: Number,
            default: null,
        },

        CostPerSquare: {
            type: Number,
            default: null,
        },
        Square: {
            type: Number,
            default: null,
        },

        CostPerFixed: {
            type: Number,
            default: null,
        },
        Fixed: {
            type: Number,
            default: null,
        },

        Unit: {
            type: Number,
            default: null,
        },
        CostPerUnit: {
            type: Number,
            default: null,
        },

        Attachment: {
            type: String,
        },

        IsDelete: {
            type: Boolean,
            default: false,
        },
        DeleteReason: { type: String },
        IsSuperadminAdd: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("materials-and-labor", MaterialsAndLaborSchema);

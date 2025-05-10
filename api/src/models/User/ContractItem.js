const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const ContractItemSchema = new Schema(
    {
        ContractItemId: {
            type: String,
            default: uuidv4,
            unique: true,
        },
        ContractId: { type: String },
        CompanyId: { type: String },
        CustomerId: { type: String },
        LocationId: { type: String },

        Type: { type: String },
        Name: { type: String },
        Description: { type: String },
        Unit: { type: String, default: null },
        CostPerUnit: { type: String, default: null },
        Hourly: { type: String, default: null },
        CostPerHour: { type: String, default: null },
        Square: { type: String, default: null },
        CostPerSquare: { type: String, default: null },
        Fixed: { type: String, default: null },
        CostPerFixed: { type: String, default: null },
        Total: { type: String },
        Attachment: { type: String },
        IsDelete: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Contract-item", ContractItemSchema);

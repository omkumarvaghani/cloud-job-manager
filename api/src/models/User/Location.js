const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const LocationSchema = new Schema(
    {
        CustomerId: { type: String },
        WorkerId: { type: String },
        CompanyId: { type: String },
        LocationId: {
            type: String,
            default: uuidv4,
            unique: true,
        },

        Address: { type: String },
        City: { type: String },

        State: { type: String },
        Zip: { type: String },
        Country: { type: String },

        DeleteReason: { type: String },
        IsDelete: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

LocationSchema.index({ CustomerId: 1, CompanyId: 1 });
LocationSchema.index({ IsDelete: 1 });

module.exports = mongoose.model("Location", LocationSchema);

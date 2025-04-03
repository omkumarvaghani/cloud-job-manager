const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const emailSchema = new Schema(
    {
        EmailId: {
            type: String,
            default: uuidv4,
            unique: true,
        },
        CompanyId: { type: String },
        CustomerId: { type: String },
        WorkerId: { type: String },
        LocationId: { type: String },
        From: { type: String },
        To: { type: Array },
        Accepted: { type: Array },
        Rejected: { type: Array },
        Opens: [
            {
                OpenedBy: { type: String },
                OpenedAt: { type: String, default: null },
            },
        ],
        Subject: { type: String },
        Body: { type: String },
        SendByCompany: { type: Boolean, default: false },
        IsDelete: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);
module.exports = mongoose.model("Email-Log", emailSchema);

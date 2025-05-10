const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MailPreference = new Schema(
    {
        CompanyId: { type: String, required: true, ref: "Company-register" },
        MailType: { type: String, required: true },
        IsEnabled: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model("Mail-Preference", MailPreference); 
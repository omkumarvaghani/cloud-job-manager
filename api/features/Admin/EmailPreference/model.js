const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MailPreference = new Schema(
    {
      CompanyId: { type: String, required: true, ref: "Company-register" }, 
      MailType: { type: String, required: true },
      is_enabled: { type: Boolean, default: false }, 
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

module.exports = mongoose.model("MailPreferences", MailPreference); 
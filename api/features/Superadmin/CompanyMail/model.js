const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const companyMailSchema = new Schema(
  {
    CompanyMailId: { type: String },

    MailConfigurationId: { type: String },
    CompanyId: { type: String },

    CheckMail: { type: Boolean, default: false },
    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CompanyMail", companyMailSchema);

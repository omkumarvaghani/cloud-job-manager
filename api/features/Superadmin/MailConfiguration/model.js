const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mailConfigurationSchema = new Schema(
  {
    MailConfigurationId: { type: String },

    Host: { type: String },
    Port: { type: String },
    User: { type: String },
    Password: { type: String },
    Mail: { type: String },

    Secure: { type: Boolean, default: true },
    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MailConfiguration", mailConfigurationSchema);

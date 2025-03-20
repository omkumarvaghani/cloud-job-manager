const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const emailSchema = new Schema(
  {
    TemplateId: { type: String },
    CompanyId: { type: String },
    
    Name: { type: String },
    Subject: { type: String },
    Body: { type: String },

    Type: { type: String },
    MailType: { type: String },

    IsDelete: { type: Boolean, default: false },
    IsActive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("templates", emailSchema);

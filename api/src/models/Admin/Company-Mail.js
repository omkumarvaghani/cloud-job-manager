const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const companyMailSchema = new Schema(
    {
        CompanyMailId: {
            type: String,
            default: uuidv4,
            unique: true,
        },

        MailConfigurationId: { type: String },
        CompanyId: { type: String },

        CheckMail: { type: Boolean, default: false },
        IsDelete: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Company-Mail", companyMailSchema);

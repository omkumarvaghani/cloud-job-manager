const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const emailSchema = new Schema(
    {
        TemplateId: {
            type: String,
            default: uuidv4,
            unique: true,
        },
        CompanyId: { type: String, required: true },

        Name: { type: String, required: true },
        Subject: { type: String, required: true },
        Body: { type: String, required: true },

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

module.exports = mongoose.model("Template", emailSchema);

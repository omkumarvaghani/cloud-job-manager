const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const mailConfigurationSchema = new Schema(
    {
        MailConfigurationId: {
            type: String,
            default: uuidv4,
            unique: true,
        },

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

module.exports = mongoose.model("Mail-Configuration", mailConfigurationSchema);

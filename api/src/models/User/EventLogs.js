const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const eventLogSchema = new mongoose.Schema(
    {
        EventId: {
            type: String,
            default: () => uuidv4(),
        },

        CompanyId: {
            type: String,
            required: true,
            ref: "Company",
        },
        UserId: {
            type: String,
        },

        EventType: {
            type: String,
            required: true,
            enum: [
                "CREATE",
                "UPDATE",
                "DELETE",
                "REGISTRATION",
                "LOGIN",
                "LOGOUT",
                "UPDATE_PROFILE",
                "ADMIN_UPDATE",
                "ADMIN_DELETE",
                "ADMIN_ADD_COMPANY",
            ],
        },

        EventDescription: {
            type: String,
        },

        DeletedBy: {
            type: String,
        },

        Metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

eventLogSchema.index({ EventId: 1, createdAt: -1 });

module.exports = mongoose.model("EventLog", eventLogSchema);
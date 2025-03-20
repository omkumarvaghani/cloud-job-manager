const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const PermissionSchema = new mongoose.Schema(
    {
        PermissionId: {
            type: String,
            default: uuidv4,
            unique: true,
        },
        Title: {
            type: String,
            required: true,
        },
        IsDelete: { type: Boolean, default: false },
    },
    { timestamps: true }
);

PermissionSchema.index({ PermissionId: 1 });
PermissionSchema.index({ IsDelete: 1 });

module.exports = mongoose.model("Permission", PermissionSchema);

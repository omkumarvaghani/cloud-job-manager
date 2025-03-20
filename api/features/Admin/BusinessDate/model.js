const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const SettingSchema = new mongoose.Schema(
  {
    BusinessDateId: { type: String, default: () => uuidv4() },
    BusinessDateKey: { type: String, default: "BusinessDate" },
    BusinessDateValue: { type: String, required: true },
    LastModified: { type: Date, default: () => Date.now() },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Business-Date", SettingSchema);

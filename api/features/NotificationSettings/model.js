const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    NotificationSettingId: { type: String, default: () => Date.now() },

    IsCustomerCheck: { type: Boolean, default: true },
    IsQuoteCheck: { type: Boolean, default: true },
    IsContractCheck: { type: Boolean, default: true },
    IsInvoiceCheck: { type: Boolean, default: true },
    IsWorkerCheck: { type: Boolean, default: true },
    IsCustomerApprove: { type: Boolean, default: true },
    IsCustomerRequest: { type: Boolean, default: true },
    IsCustomerVisitConfirm: { type: Boolean, default: true },
    IsWorkerVisitConfirm: { type: Boolean, default: true },
    IsProductServices: { type: Boolean, default: true },

    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);

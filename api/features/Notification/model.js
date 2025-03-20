const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    NotificationId: { type: String },
    CompanyId: { type: String },
    CustomerId: { type: String },
    QuoteId: { type: String },
    TemplateId: { type: String },
    recurring_charge_id: { type: String },
    recurringId: { type: String },
    WorkerId: { type: String },
    account_id: { type: String },
    signatureRequestId: { type: String },
    ProductId: { type: String },
    ContractId: { type: String },
    InvoiceId: { type: String },
    RequestChangeId: { type: String },
    LocationId: { type: String },
    VisitId: { type: String },
    AddedAt: { type: Date },
    CreatedBy: { type: String },
    IsView: { type: Boolean, default: false },
    IsDelete: { type: Boolean, default: false },
    Is_Admin: { type: Boolean, default: false },
    Is_Superadmin: { type: Boolean, default: false },
    Is_Customer: { type: Boolean, default: false },
    Is_Staffmember: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", NotificationSchema);

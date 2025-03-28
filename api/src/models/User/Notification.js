const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const NotificationSchema = new Schema(
    {
        NotificationId: {
            type: String,
            default: uuidv4,
            unique: true,
        },
        CompanyId: { type: String },
        UserId: { type: String },
        QuoteId: { type: String },
        TemplateId: { type: String },
        RecurringChargeId: { type: String },
        RecurringId: { type: String },
        WorkerId: { type: String },
        AccountId: { type: String },
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
        Is_Company: { type: Boolean, default: false },
        Is_Admin: { type: Boolean, default: false },
        Is_Customer: { type: Boolean, default: false },
        Is_Worker: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

NotificationSchema.index({ CompanyId: 1, UserId: 1, IsDelete: 1 });
NotificationSchema.index({ Is_Company: 1, Is_Admin: 1, Is_Customer: 1, Is_Worker: 1 });
NotificationSchema.index({ CreatedBy: 1 });
NotificationSchema.index({ AddedAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);

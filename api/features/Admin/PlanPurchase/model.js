const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PlanPurchaseSchema = new Schema(
  {
    PlanPurchaseId: { type: String },
    CompanyId: { type: String },
    PlanId: { type: String },

    BillingDate: { type: String },
    SubscriptionId: { type: String },

    IsActive: { type: Boolean, default: true },
    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PlanPurchase", PlanPurchaseSchema);

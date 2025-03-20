const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chargeSchema = new Schema(
  {
    recurring_charge_id: { type: String },
    CompanyId: { type: String },
    CustomerId: { type: String },
    account_id: { type: String },
    description: { type: String },
    amount: { type: Number },
    frequency_interval: { type: Number },
    frequency: { type: String },
    nextDueDate: { type: String },
    IsDelete: { type: Boolean, default: false },
    day_of_month: { type: Number, default: null },
    weekday: { type: String, default: null },
    day_of_year: { type: Number, default: null },
    month: { type: Number, default: null },
    days_after_quarter: { type: Number, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("recurring-charge", chargeSchema);

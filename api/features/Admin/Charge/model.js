const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const chargeSchema = new Schema(
  {
    charge_id: { type: String, default: () => uuidv4() },
    recurring_charge_id: { type: String },
    CompanyId: { type: String },
    CustomerId: { type: String },
    account_id: { type: String },
    LocationId: { type: Array },
    amount: { type: Number },
    description:{type: String},
    IsDelete: { type: Boolean, default: false },
    IsRecurring: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("charge", chargeSchema);

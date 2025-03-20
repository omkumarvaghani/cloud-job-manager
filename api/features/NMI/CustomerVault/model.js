const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerValutSchema = new Schema(
  {
    CompanyId: { type: String },
    CustomerId: { type: String },
    customer_vault_id: { type: String },

    type: { type: String },
    billing_ids: [
      {
        billing_id: { type: String },
        IsDelete: { type: Boolean, default: false },
      },
    ],

    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("customer-vault", CustomerValutSchema);

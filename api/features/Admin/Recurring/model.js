const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reccuringSchema = new Schema(
  {
    recurringId: { type: String },
    CompanyId: { type: String },
    CustomerId: { type: String },
    customer_vault_id: { type: String },

    recurrings: [
      {
        date: { type: Number },
        card_type: { type: String },
        billing_id: { type: String },
        amount: { type: Number },
        account: { type: String },
        nValue: { type: String },
        frequency: { type: String },
      },
    ],

    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("recurring", reccuringSchema);

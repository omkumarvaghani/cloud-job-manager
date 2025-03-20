const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InvoicePaymentSchema = new Schema(
  {
    PaymentId: { type: String },
    CompanyId: { type: String },
    CustomerId: { type: String },
    account_id: { type: String },
    method: { type: String },
    customer_vault_id: { type: String },
    transactionid: { type: String },
    billing_id: { type: String },
    amount: { type: Number },
    date: { type: String },
    Total: { type: Number },
    responsetext: { type: String },
    recurringId: { type: String },
    IsDelete: { type: Boolean, default: false },
    IsPaymentSuccess: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Payment", InvoicePaymentSchema);

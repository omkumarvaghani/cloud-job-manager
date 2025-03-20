const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InvoicePaymentSchema = new Schema(
  {
    InvoicePaymentId: { type: String },
    InvoiceId: { type: String },
    InvoiceNumber: { type: String },
    CompanyId: { type: String },
    account_id: { type: String },
    CustomerId: { type: String },

    method: { type: String },
    customer_vault_id: { type: String },
    transactionid: { type: String },
    billing_id: { type: String },
    amount: { type: Number },
    date: { type: String },
    Total: { type: Number },
    dueDate: { type: String },

    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Invoice-Payment", InvoicePaymentSchema);

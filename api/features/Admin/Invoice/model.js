const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InvoiceSchema = new Schema(
  {
    InvoiceId: { type: String },
    CompanyId: { type: String },
    ContractId: { type: String },
    CustomerId: { type: String },
    LocationId: { type: String },
    WorkerId: { type: Array },
    account_id: { type: String },

    Subject: { type: String },
    InvoiceNumber: { type: String },
    IssueDate: { type: String },
    DueDate: { type: String },
    description: { type: String },
    // PaymentDue: { type: Boolean, default: false },
    PaymentDue: { type: String, default: "Upon Receipt" },

    Message: { type: String },
    Notes: { type: String },
    // CustomerMessage: { type: String },
    ContractDisclaimer: { type: String },
    Discount: { type: String },
    Tax: { type: String },
    subTotal: { type: String },
    Total: { type: String },
    Attachment: { type: Array },
    DeleteReason: { type: String },
    Status: {
      type: String,
      default: "Unpaid",
    },

    LinkNote: { type: Boolean, default: false },
    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Invoice", InvoiceSchema);

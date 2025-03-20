const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuoteSchema = new Schema(
  {
    CompanyId: { type: String },
    CustomerId: { type: String },
    QuoteId: { type: String },
    LocationId: { type: String },
    Title: { type: String },
    QuoteNumber: { type: String },
    SubTotal: { type: String },
    Discount: { type: String },
    Tax: { type: String },
    Total: { type: String },
    CustomerMessage: { type: String }, 
    ContractDisclaimer: { type: String },
    Notes: { type: String },
    Attachment: { type: [String] },
    status: {
      type: String,
      default: "Draft",
    },

    CompanyName: { type: String },
    DeleteReason: {type: String}, 

    ChangeRequest: { type: [String] },

    // Signature
    SignatureType: {
      type: String,
    },
    Signature: {
      type: String,
    },
    ApproveDate: {
      type: String,
    },

    IsDelete: { type: Boolean, default: false },
    IsApprovedByCustomer: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quote", QuoteSchema);

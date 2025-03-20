const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SignatureRequestSchema = new Schema(
  {
    CompanyId: { type: String },
    ContractId: { type: String },
    CustomerId: { type: String },
    InvoiceId: { type: String },
    LocationId: { type: String },
    QuoteId: { type: String },
    signatureRequestId: { type: String },
    signatureId: { type: String },
    title: { type: Array },
    signers: [{ email: { type: String }, name: { type: String } }],
    originalTitle: { type: Array },
    subject: { type: Array },
    requesterEmailAddress: { type: Array },
    message: { type: Array },
    filePath: { type: Array },
    Status: { type: String, default: "awaiting_signature" },
    signingUrl: { type: String },
    filesUrl: { type: String },
    isComplete: { type: Boolean, default: false },
    isDeclined: { type: Boolean, default: false },
    IsDeleted: { type: Boolean, default: false },
    Metadata: { type: Map },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Dropbox", SignatureRequestSchema);

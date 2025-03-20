const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nmiSchema = new Schema(
  {
    NmiKeyId: { type: String },
    CompanyId: { type: String },
    CompanyName: { type: String },
    SecurityKey: { type: String },
    PublicKey: { type: String },
    SigningKey: { type: String },
    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("NMIKey", nmiSchema);

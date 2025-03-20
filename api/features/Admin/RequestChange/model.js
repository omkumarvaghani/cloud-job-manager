const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RequestSchema = new Schema(
  {
    CompanyId: { type: String },
    ContractId: { type: String },
    CustomerId: { type: String },
    LocationId: { type: String },
    QuoteId: { type: String },
    RequestChangeId: { type: String },

    // Define RequestMessage as an array of objects with message and Date
    RequestMessage: [
      {
        message: { type: String },  // The message content
        Date: { type: String },     // The timestamp
      },
    ],

    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RequestChange", RequestSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const recurringSchema = new Schema(
  {
    CompanyId: {
      type: String,
    },
    TransactionId: {
      type: String,
    },
    PlanId: {
      type: String,
    },
    SubscriptionId: {
      type: String,
    },
    Merchant: {
      type: String,
    },
    Email: {
      type: String,
    },
    TransactionType: {
      type: String,
    },
    ProcessorId: {
      type: String,
    },
    Amount: {
      type: Number,
    },
    AuthCode: {
      type: String,
    },
    ActionType: { type: String },
    ResponseText: { type: String },
    ResponseCode: { type: Number },
    Description: {
      type: String,
    },
    TransactionDate: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("recurring-transactions", recurringSchema);

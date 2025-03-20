const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nmiwebhooksSchema = new Schema(
  {
    transaction_id: {
      type: String,
    },
    plan_id: {
      type: String,
    },
    subscription_id: {
      type: String,
    },
    subscription_type: {
      type: String,
    },
    merchant: {
      type: String,
    },
    email: {
      type: String,
    },
    transaction_type: {
      type: String,
    },
    processor_id: {
      type: String,
    },
    amount: {
      type: Number,
    },
    action_type: { type: String },
    response_code: { type: Number },
    response_text: { type: String },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("nmi-webhooks", nmiwebhooksSchema);

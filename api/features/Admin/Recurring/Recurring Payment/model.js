const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const reccuringSchema = new Schema(
//   {
//     recurringId: { type: String },
//     CompanyId: { type: String },
//     CustomerId: { type: String },
//     customer_vault_id: { type: String },

//     recurrings: [
//       {
//         card_type: { type: String },
//         billing_id: { type: String },
//         amount: { type: Number },
//         account_id: { type: String },
//         frequency_interval: { type: String },
//         frequency: { type: String },
//         nextDueDate: { type: String },
//         day_of_month: { type: Number, default: null },
//         weekday: { type: String, default: null },
//         day_of_year: { type: Number, default: null },
//         month: { type: Number, default: null },
//         days_after_quarter: { type: Number, default: null },
//       },
//     ],

//     IsDelete: { type: Boolean, default: false },
//   },
//   {
//     timestamps: true,
//   }
// );

const reccuringSchema = new Schema(
  {
    recurringId: { type: String },
    CompanyId: { type: String },
    CustomerId: { type: String },
    customer_vault_id: { type: String },
    card_type: { type: String },
    billing_id: { type: String },
    amount: { type: Number },
    account_id: { type: String },
    frequency_interval: { type: String },
    description: { type: String },
    cc_number: { type: String },
    frequency: { type: String },
    nextDueDate: { type: String },
    day_of_month: { type: Number, default: null },
    weekday: { type: String, default: null },
    day_of_year: { type: Number, default: null },
    month: { type: Number, default: null },
    days_after_quarter: { type: Number, default: null },
    IsDelete: { type: Boolean, default: false },
    IsRecurring: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("recurring-payment", reccuringSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const planSchema = new Schema(
  {
    PlanId: { type: String },
    PlanName: { type: String },
    PlanPrice: { type: String },
    PlanDetail: { type: String },
    MonthFrequency: { type: String },
    DayOfMonth: { type: Number },
    IsDelete: { type: Boolean, default: false },
    IsMostpopular: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Plan", planSchema);

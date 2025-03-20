const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const planSchema = new Schema(
    {
        PlanId: {
            type: String,
            default: uuidv4,
            unique: true,
        },
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

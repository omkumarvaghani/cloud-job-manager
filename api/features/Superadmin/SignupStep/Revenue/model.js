const mongoose = require("mongoose");

const RevenueSchema = new mongoose.Schema(
  {
    revenueId: {
      type: String,
    },
    revenue: {
      type: String,
    },
    IsDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("revenue", RevenueSchema);

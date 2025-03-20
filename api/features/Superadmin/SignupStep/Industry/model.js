const mongoose = require("mongoose");

const IndustrySchema = new mongoose.Schema(
  {
    industryId: {
      type: String,
    },
    industry: {
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

module.exports = mongoose.model("industry", IndustrySchema);

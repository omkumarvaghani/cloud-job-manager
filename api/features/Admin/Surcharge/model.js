const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const surchargeSchema = new Schema(
  {
    CompanyId: { type: String },
    surchargeId: { type: String },
    surchargePercent: { type: Number },
    surchargePercentDebit: { type: Number },
    surchargePercentACH: { type: Number },
    surchargeFlatACH: { type: Number },
    surchargeAccount: { type: String },

    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("surcharge", surchargeSchema);
 
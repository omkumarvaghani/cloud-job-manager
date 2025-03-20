const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const visitsSchema = new Schema(
  {
    VisitId: { type: String },
    ContractId: { type: String },
    CompanyId: { type: String },
    CustomerId: { type: String },
    LocationId: { type: String },
    WorkerId: { type: [String] },

    ItemName: { type: String },
    Note: { type: String },

    StartDate: { type: String },
    EndDate: { type: String },

    StartTime: { type: String },
    EndTime: { type: String },
    DeleteReason: { type: String },
    IsComplete: { type: Boolean, default: false },

    IsConfirm: { type: Boolean, default: false },
    IsConfirmByWorker: { type: Boolean, default: false },
    ConfirmWorker: { type: Array },
    ConfirmComplete: { type: Array },
    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Visits", visitsSchema);

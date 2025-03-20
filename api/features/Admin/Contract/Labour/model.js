const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const labourSchema = new Schema(
  {
    ContractId: { type: String },
    CompanyId: { type: String },
    WorkerId: { type: String },
    LabourId: { type: String },
    FirstName: { type: String },
    LastName: { type: String },

    StartTime: { type: String },
    EndTime: { type: String },
    Hours: { type: String },
    Minutes: { type: String },

    Notes: { type: String },
    DatePicker: { type: String },

    Country: { type: String },
    DeleteReason: {type: String}, 
    LabourCost: { type: String },
    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Labour", labourSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WorkerSchema = new Schema(
  {
    companyId: { type: String },
    WorkerId: { type: String },
    ContractId: { type: String },
    profileImage: { type: String },
    FirstName: { type: String },
    LastName: { type: String },
    EmailAddress: { type: String },
    PhoneNumber: { type: String },
    Address: { type: String },
    City: { type: String },
    State: { type: String },
    Country: { type: String },
    Zip: { type: String },
    LaborCost: { type: String },
    ScheduleTime: { type: String },
    DeleteReason: { type: String },

    IsDelete: { type: Boolean, default: false },
    IsActive: { type: Boolean, default: true },
    Role: { type: String, default: "Worker" },
    Password: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Worker", WorkerSchema);

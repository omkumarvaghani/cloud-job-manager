const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContreactTeamSchema = new Schema(
  {
    AssignPersonId: { type: String },
    CompanyId: { type: String },
    FullName: { type: String },
    Email: { type: String },
    PhoneNumber: { type: String },
    Password: { type: String },
    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ContractTeam", ContreactTeamSchema);

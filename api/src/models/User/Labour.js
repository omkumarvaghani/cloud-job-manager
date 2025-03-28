const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const labourSchema = new Schema(
    {
        ContractId: { type: String },
        CompanyId: { type: String },
        WorkerId: { type: String },
        LabourId: {
            type: String,
            default: () => uuidv4(),
        },
        FirstName: { type: String },
        LastName: { type: String },

        StartTime: { type: String },
        EndTime: { type: String },
        Hours: { type: String },
        Minutes: { type: String },

        DatePicker: { type: String },

        LabourCost: { type: String },
        TotalCost: { type: String },
        DeleteReason: { type: String },
        IsDelete: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Labour", labourSchema);

const mongoose = require("mongoose");
const moment = require("moment");
const Schema = mongoose.Schema;

const contractSchema = new Schema(
  {
    CompanyId: { type: String },
    ContractId: { type: String },
    CustomerId: { type: String },
    LocationId: { type: String },
    QuoteId: { type: String },
    WorkerId: { type: [String] },

    Title: { type: String },
    Description: { type: String },
    ContractNumber: { type: Number },
    StartDate: { type: String },
    CompletionDate: { type: String },
    Status: { type: String },
    EventLog: { type: String },
    DeleteReason: {type: String}, 


    IsOneoffJob: { type: Boolean, default: false },
    IsRecuringJob: { type: Boolean, default: false },

    OneoffJob: {
      StartDate: { type: String },
      EndDate: { type: String },
      StartTime: { type: String },
      EndTime: { type: String },
      ScheduleLetter: { type: Boolean, default: false },
      Repeats: { type: String },
    },
    RecuringJob: {
      StartDate: { type: String },
      StartTime: { type: String },
      EndTime: { type: String },
      Repeats: { type: String },
      Duration: { type: String },
      Frequency: { type: String },
    },

    Team: { type: [String] },
    RemindInvoice: { type: Boolean, default: false },
    IsDelete: { type: Boolean, default: false },

    Notes: { type: String },
    Discount: { type: String },
    Tax: { type: String },
    subTotal: { type: String },
    Attachment: { type: [String] },
    Total: { type: Number },

    LinkNoteToInvoice: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const getStatusBasedOnStartDate = (startDate) => {
  if (!startDate) {
    return "Unscheduled";
  }

  const today = moment().startOf("day");
  const startMoment = moment(startDate).startOf("day");

  if (startMoment.isSame(today, "day")) {
    return "Today";
  } else if (startMoment.isAfter(today)) {
    return "Upcoming";
  } else {
    return "Scheduled";
  }
};

contractSchema.pre("save", function (next) {
  let status = "Unscheduled";

  if (this.IsOneoffJob && this.OneoffJob && this.OneoffJob.StartDate) {
    status = getStatusBasedOnStartDate(this.OneoffJob.StartDate);
  } else if (
    this.IsRecuringJob &&
    this.RecuringJob &&
    this.RecuringJob.StartDate
  ) {
    status = getStatusBasedOnStartDate(this.RecuringJob.StartDate);
  } else if (this.StartDate) {
    status = getStatusBasedOnStartDate(this.StartDate);
  }

  this.Status = status;

  next();
});

module.exports = mongoose.model("Contract", contractSchema);

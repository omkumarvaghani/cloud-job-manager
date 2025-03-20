const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PermissionStepsSchema = new Schema(
  {
    PermissionId: { type: String },
    Title: { type: String },
    Description: { type: String },
//5206 code start: Permission 
    Schedule: {
      ViewTheirOwnSchedule: { type: Boolean, default: false },
      ViewAndCompleteTheirOwnSchedule: { type: Boolean, default: false },
      EditTheirOwnSchedule: { type: Boolean, default: false },
      EditEveryonesSchedule: { type: Boolean, default: false },
      EditAndDeleteEveryonesSchedule: { type: Boolean, default: false },
    },
//5206 code end: Permission 
    // Time tracking and timesheets
    TimeTrackingAndTimesheets: {
      ViewAndRecordTheirOwn: { type: Boolean, default: false },
      ViewRecordAndEditTheirOwn: { type: Boolean, default: false },
      ViewRecordAndEditEveryones: { type: Boolean, default: false },
    },

    // Notes
    Notes: {
      ViewNotesOnJobsAndVisitsOnly: { type: Boolean, default: false },
      ViewAllNotes: { type: Boolean, default: false },
      ViewAndEditAll: { type: Boolean, default: false },
      ViewEditAndDeleteAll: { type: Boolean, default: false },
    },

    // Expenses
    Expenses: {
      ViewRecordAndEditTheirOwn: { type: Boolean, default: false },
      ViewRecordAndEditEveryones: { type: Boolean, default: false },
    },

    // Show pricing
    ShowPricing: {
      AllowsEditingOfQuotesInvoicesAndLineItemsOnJobs: {
        type: Boolean,
        default: false,
      },
    },

    // Customers Properties
    CustomersProperties: {
      ViewCustomerNameAndAddressOnly: { type: Boolean, default: false },
      ViewFullCustomerAndPropertyInfo: { type: Boolean, default: false },
      ViewAndEditFullCustomerAndPropertyInfo: { type: Boolean, default: false },
      ViewEditAndDeleteFullCustomerAndPropertyInfo: {
        type: Boolean,
        default: false,
      },
    },

    // Request
    // Request: {
    //   ViewOnly: { type: Boolean, default: false },
    //   ViewCreateAndEdit: { type: Boolean, default: false },
    //   ViewCreateEditAndDelete: { type: Boolean, default: false },
    // },

    // Quotes
    Quotes: {
      ViewOnly: { type: Boolean, default: false },
      ViewCreateAndEdit: { type: Boolean, default: false },
      ViewCreateEditAndDelete: { type: Boolean, default: false },
    },
      
    // Contract
    Contract: {
      ViewOnly: { type: Boolean, default: false },
      ViewCreateAndEdit: { type: Boolean, default: false },
      ViewCreateEditAndDelete: { type: Boolean, default: false },
    },
    Invoice: {
      ViewOnly: { type: Boolean, default: false },
      ViewCreateAndEdit: { type: Boolean, default: false },
      ViewCreateEditAndDelete: { type: Boolean, default: false },
    },

    // Reports
    Reports: {
      UsersWillOnlyBeAbleToSeeReportsAvailableToThemBasedOnTheirOtherPermissions:
        { type: Boolean, default: false },
    },

    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Permission-Step", PermissionStepsSchema);

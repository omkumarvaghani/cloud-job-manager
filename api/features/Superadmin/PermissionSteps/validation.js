const Joi = require("joi");

const permissionStepsValidationSchema = Joi.object({
  PermissionId: Joi.optional(),
  Title: Joi.string().required(),  
  Description: Joi.string().required(), 
  
  // Permissions for Schedule
  Schedule: Joi.object({
    ViewTheirOwnSchedule: Joi.boolean().default(false),
    ViewAndCompleteTheirOwnSchedule: Joi.boolean().default(false),
    EditTheirOwnSchedule: Joi.boolean().default(false),
    EditEveryonesSchedule: Joi.boolean().default(false),
    EditAndDeleteEveryonesSchedule: Joi.boolean().default(false),
  }).optional(),

  // Permissions for TimeTracking and Timesheets
  TimeTrackingAndTimesheets: Joi.object({
    ViewAndRecordTheirOwn: Joi.boolean().default(false),
    ViewRecordAndEditTheirOwn: Joi.boolean().default(false),
    ViewRecordAndEditEveryones: Joi.boolean().default(false),
  }).optional(),

  // Permissions for Notes
  Notes: Joi.object({
    ViewNotesOnJobsAndVisitsOnly: Joi.boolean().default(false),
    ViewAllNotes: Joi.boolean().default(false),
    ViewAndEditAll: Joi.boolean().default(false),
    ViewEditAndDeleteAll: Joi.boolean().default(false),
  }).optional(),

  // Permissions for Expenses
  Expenses: Joi.object({
    ViewRecordAndEditTheirOwn: Joi.boolean().default(false),
    ViewRecordAndEditEveryones: Joi.boolean().default(false),
  }).optional(),

  // Permissions for ShowPricing
  ShowPricing: Joi.object({
    AllowsEditingOfQuotesInvoicesAndLineItemsOnJobs: Joi.boolean().default(false),
  }).optional(),

  // Permissions for CustomersProperties
  CustomersProperties: Joi.object({
    ViewCustomerNameAndAddressOnly: Joi.boolean().default(false),
    ViewFullCustomerAndPropertyInfo: Joi.boolean().default(false),
    ViewAndEditFullCustomerAndPropertyInfo: Joi.boolean().default(false),
    ViewEditAndDeleteFullCustomerAndPropertyInfo: Joi.boolean().default(false),
  }).optional(),

  // Permissions for Quotes
  Quotes: Joi.object({
    ViewOnly: Joi.boolean().default(false),
    ViewCreateAndEdit: Joi.boolean().default(false),
    ViewCreateEditAndDelete: Joi.boolean().default(false),
  }).optional(),

  // Permissions for Contract
  Contract: Joi.object({
    ViewOnly: Joi.boolean().default(false),
    ViewCreateAndEdit: Joi.boolean().default(false),
    ViewCreateEditAndDelete: Joi.boolean().default(false),
  }).optional(),

  // Permissions for Invoice
  Invoice: Joi.object({
    ViewOnly: Joi.boolean().default(false),
    ViewCreateAndEdit: Joi.boolean().default(false),
    ViewCreateEditAndDelete: Joi.boolean().default(false),
  }).optional(),

  // Permissions for Reports
  Reports: Joi.object({
    UsersWillOnlyBeAbleToSeeReportsAvailableToThemBasedOnTheirOtherPermissions: Joi.boolean().default(false),
  }).optional(),

  IsDelete: Joi.boolean().default(false),
});

// Middleware to validate request body for Permission Steps
const validatePermissionStepsBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    console.log(error, error.details.map((detail) => detail.message));
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

module.exports = { permissionStepsValidationSchema, validatePermissionStepsBody };

const Joi = require("joi");

const registerSchema = Joi.object({
  Role: Joi.string()
    .valid("Company", "Customer", "Worker", "Admin")
    .required(),

  // Common Fields
  EmailAddress: Joi.string().email().required(),
  Password: Joi.string().min(6),
  PhoneNumber: Joi.string().optional(),
  Address: Joi.string().optional(),

  // Company-Specific Fields
  CompanyName: Joi.when("Role", {
    is: "Company",
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  OwnerName: Joi.when("Role", {
    is: "Company",
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  IndustryId: Joi.when("Role", {
    is: "Company",
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  TeamSizeId: Joi.when("Role", {
    is: "Company",
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  RevenueId: Joi.when("Role", {
    is: "Company",
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),

  // Worker & Customer Fields
  FirstName: Joi.when("Role", {
    is: Joi.valid("Worker", "Customer"),
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  LastName: Joi.when("Role", {
    is: Joi.valid("Worker", "Customer"),
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  companyId: Joi.when("Role", {
    is: Joi.valid("Worker", "Customer"),
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),

  // Worker-Specific Fields
  LaborCost: Joi.when("Role", {
    is: "Worker",
    then: Joi.string().optional(),
    otherwise: Joi.forbidden(),
  }),
  ScheduleTime: Joi.when("Role", {
    is: "Worker",
    then: Joi.string().optional(),
    otherwise: Joi.forbidden(),
  }),

  // Admin Fields
  FullName: Joi.when("Role", {
    is: "Admin",
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),

  // Address Fields (Optional for Company & Customer)
  City: Joi.string().optional(),
  State: Joi.string().optional(),
  Country: Joi.string().optional(),
  Zip: Joi.string().optional(),
});

// 🔹 Login Validation Schema
const loginSchema = Joi.object({
  EmailAddress: Joi.string().email().lowercase().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Invalid email format.",
  }),

  Password: Joi.string().required().messages({
    "string.empty": "Password is required.",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};

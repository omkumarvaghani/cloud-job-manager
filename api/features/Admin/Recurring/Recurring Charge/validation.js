const Joi = require("joi");

// Recurring charge validation schema with Joi
const recurringChargeValidationSchema = Joi.object({
  recurring_charge_id: Joi.optional(),
  CompanyId: Joi.optional(),
  CustomerId: Joi.optional(),
  account_id: Joi.string().required(),
  description: Joi.optional(),
  account_name: Joi.optional(),
  amount: Joi.string().required(),
  frequency_interval: Joi.optional(),
  frequency: Joi.string().required(),
  nextDueDate: Joi.optional(),
  IsDelete: Joi.boolean().default(false),
  day_of_month: Joi.optional(),
  weekday: Joi.optional(),
  day_of_year: Joi.optional(),
  month: Joi.optional(),
  days_after_quarter: Joi.optional(),
});

// Middleware to validate request body for Recurring Charge
const validateRecurringChargeBody = (schema) => (req, res, next) => {
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

module.exports = { validateRecurringChargeBody, recurringChargeValidationSchema };

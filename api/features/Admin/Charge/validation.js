const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");

const chargeValidationSchema = Joi.object({
  charge_id: Joi.string().default(() => uuidv4()),  
  recurring_charge_id: Joi.string().optional(),
  CompanyId: Joi.optional(),
  LocationId: Joi.optional(),
  CustomerId: Joi.string().optional(),
  account_id: Joi.string().required(),
  amount: Joi.string().required(),
  description: Joi.optional(),
  account_name: Joi.optional(),
  IsDelete: Joi.boolean().default(false),
  IsRecurring: Joi.boolean().default(true),
});

// Middleware to validate request body
const validateChargeBody = (schema) => (req, res, next) => {
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

module.exports = { chargeValidationSchema, validateChargeBody };

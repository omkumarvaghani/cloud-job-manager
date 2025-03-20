const Joi = require("joi");

const accountValidationSchema = Joi.object({
  account_id: Joi.optional(),
  CompanyId: Joi.string().required(),
  account_name: Joi.string().required(),
  account_type: Joi.string().required(),
  charge_type: Joi.string().optional(),
  fund_type: Joi.string().optional(),
  notes: Joi.optional(),
  IsDelete: Joi.boolean().default(false),
});

// Middleware to validate request body
const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    console.log(error,error.details.map((detail) => detail.message));
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

module.exports = { accountValidationSchema, validateBody };

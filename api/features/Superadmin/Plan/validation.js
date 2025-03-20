const Joi = require("joi");

const planValidationSchema = Joi.object({
  PlanId: Joi.optional(),
  PlanName: Joi.string().required(),
  PlanPrice: Joi.optional(),
  PlanDetail: Joi.string().required(),
  MonthFrequency: Joi.string().required(),
  DayOfMonth: Joi.string().required(),
  IsDelete: Joi.boolean().default(false),
  IsMostpopular: Joi.boolean().default(false),
});

// Middleware to validate request body for Plan
const validatePlanBody = (schema) => (req, res, next) => {
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

module.exports = { planValidationSchema, validatePlanBody };

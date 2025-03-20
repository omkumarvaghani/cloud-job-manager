const Joi = require("joi");

// Company validation schema with Joi
const companyValidationSchema = Joi.object({
  companyId: Joi.string().optional(),
  industryId: Joi.optional(),
  teamSizeId: Joi.optional(),
  revenueId: Joi.optional(),

  EmailAddress: Joi.string().required(),
  Password: Joi.string().required(),
  ConfirmPassword: Joi.string().required(),

  ownerName: Joi.string().required(),
  companyName: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  profileImage: Joi.optional(),

  Address: Joi.optional(),
  City: Joi.optional(),
  State: Joi.optional(),
  Country: Joi.optional(),
  Zip: Joi.optional(),
  TeamSize: Joi.optional(),
  Revenue: Joi.optional(),
  Industry: Joi.optional(),
  industry: Joi.optional(),
  revenue: Joi.optional(),
  teamSize: Joi.optional(),

  Message: Joi.string().optional(),

  role: Joi.optional("Company"),

  IsDelete: Joi.boolean().default(false),
  IsActive: Joi.boolean().default(true),
  IsPlanActive: Joi.boolean().default(true),
});

// Middleware to validate request body for Company
const validateCompanyBody = (schema) => (req, res, next) => {
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

module.exports = { validateCompanyBody, companyValidationSchema };

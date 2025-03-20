const Joi = require("joi");

const customerValidationSchema = Joi.object({
  CompanyId: Joi.string().required(),
  CustomerId: Joi.optional(),
  LocationId: Joi.optional(),
  State: Joi.string().required(),
  City: Joi.string().required(),
  Zip: Joi.string().required(),
  Country: Joi.string().required(),
  Address: Joi.string().required(),
  AddedAt: Joi.optional(),
  FirstName: Joi.string().required(),
  LastName: Joi.string().required(),
  profileImage: Joi.string().optional(),
  PhoneNumber: Joi.string().required(),
  EmailAddress: Joi.string().email().required(),
  Password: Joi.string().optional(),
  Type: Joi.string().optional(),
  DeleteReason: Joi.string().optional(),
  // Role: Joi.string().valid('Customer', 'Admin').default('Customer'),
  IsDelete: Joi.boolean().default(false),
  IsActive: Joi.boolean().default(true),
});

// Middleware to validate request body
const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    console.log(
      error,
      error.details.map((detail) => detail.message)
    );
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

module.exports = { customerValidationSchema, validateBody };

const Joi = require("joi");

// Assuming LocationValidationSchema is a Joi schema to validate the location details
const LocationValidationSchema = Joi.object({
  CustomerId: Joi.string().optional(),
  CompanyId: Joi.string().optional(),
  LocationId: Joi.string().optional(),
  Address: Joi.string().required(),
  City: Joi.string().required(),
  State: Joi.string().required(),
  Zip: Joi.string().required(),
  Country: Joi.string().required(),
  DeleteReason: Joi.string().optional(),
  IsDelete: Joi.boolean().default(false),
});


// Middleware to validate request body
const validateBody = (schema) => (req, res, next) => {
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

module.exports = { LocationValidationSchema, validateBody };

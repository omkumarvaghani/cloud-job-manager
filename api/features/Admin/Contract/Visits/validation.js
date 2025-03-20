const Joi = require("joi");

// Define the Joi schema for visits
const visitsValidationSchema = Joi.object({
  VisitId: Joi.string().optional(),
  ContractId: Joi.string().optional(),
  CompanyId: Joi.string().optional(),
  CustomerId: Joi.string().optional(),
  LocationId: Joi.string().optional(),
  WorkerId: Joi.array().items(Joi.string()).optional(),
  ItemName: Joi.string().required(),
  Note: Joi.string().optional(),
  StartDate: Joi.string().required(),
  EndDate: Joi.string().required(),
  StartTime: Joi.string().optional(),
  EndTime: Joi.string().optional(),
  DeleteReason: Joi.string().optional(),
  IsConfirm: Joi.boolean().default(false),
  IsConfirmByWorker: Joi.boolean().default(false),
  ConfirmWorker: Joi.array().items(Joi.string()).optional(),
  IsDelete: Joi.boolean().default(false),
});

// Middleware to validate request body for visits
const validateVisitsBody = (schema) => (req, res, next) => {
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

module.exports = { validateVisitsBody, visitsValidationSchema };

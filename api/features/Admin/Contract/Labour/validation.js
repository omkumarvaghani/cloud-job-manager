const Joi = require("joi");


const labourValidationSchema = Joi.object({
  ContractId: Joi.optional(),
  CompanyId: Joi.optional(),
  WorkerId: Joi.optional(),
  LabourId: Joi.optional(),
  FullName: Joi.optional(),

  StartTime: Joi.string().required(),
  EndTime: Joi.string().required(),
  Hours: Joi.string().required(),
  Minutes: Joi.string().required(),
  LabourCost: Joi.number().required(),


  Address: Joi.optional(),
  City: Joi.optional(),
  State: Joi.optional(),
  Zip: Joi.optional(),
  Team: Joi.optional(),
  TotalCost: Joi.optional(),

  Notes: Joi.optional(),
  DatePicker: Joi.optional(),

  Country: Joi.optional(),
  DeleteReason: Joi.optional(),
  IsDelete: Joi.boolean().default(false),
});

// Middleware to validate request body
const validateLabourBody = (schema) => (req, res, next) => {
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

module.exports = {validateLabourBody,labourValidationSchema};


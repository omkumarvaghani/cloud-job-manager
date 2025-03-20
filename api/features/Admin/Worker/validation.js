const Joi = require("joi");


const workerValidationSchema = Joi.object({
  companyId: Joi.optional(),
  WorkerId: Joi.optional(),
  ContractId: Joi.optional(),
  profileImage: Joi.optional(),
  FirstName: Joi.string().optional(),
  LastName: Joi.string().optional(),
  EmailAddress: Joi.string().email().required(),
  PhoneNumber: Joi.string().required(),
  Address: Joi.optional(),
  City: Joi.optional(),
  State: Joi.optional(),
  Country: Joi.optional(),
  Zip: Joi.optional(),
  ScheduleTime: Joi.optional(),
  Password: Joi.optional(),
  FullName: Joi.optional(),
  AddedAt: Joi.optional(),
  WorkerPermission: Joi.optional(),
  Schedule: Joi.optional(),
  Title: Joi.optional(),
  Description: Joi.optional(),
  LaborCost: Joi.optional(),
  MobileNumber: Joi.optional(),
  DeleteReason: Joi.optional(),
  IsDelete: Joi.boolean().default(false),
  IsActive: Joi.boolean().default(true),
  Role: Joi.optional("Worker"),
});

// Middleware to validate request body
const validateWorkerBody = (schema) => (req, res, next) => {
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

module.exports = {validateWorkerBody,workerValidationSchema};


const Joi = require("joi");

const materialsAndLaborValidationSchema = Joi.object({
  superAdminId: Joi.optional(),
  companyId: Joi.optional(),
  ProductId: Joi.optional(),
  OldProductId: Joi.optional(),
  Type: Joi.string().required(),
  Name: Joi.string().required(),
  Description: Joi.string().required(),
  Hourly: Joi.optional(),
  CostPerHour: Joi.optional().required(),
  CostPerSquare: Joi.optional().required(),
  Square: Joi.optional(),
  CostPerFixed: Joi.optional().required(),
  Fixed: Joi.optional(),
  Unit: Joi.optional(),
  CostPerUnit: Joi.optional().required(),
  Attachment: Joi.optional(),
  IsDelete: Joi.boolean().default(false),
  DeleteReason: Joi.optional(),
  IsSuperadminAdd: Joi.boolean().default(false),
});


const validateMaterialsAndLaborBody = (schema) => (req, res, next) => {
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

module.exports = { validateMaterialsAndLaborBody, materialsAndLaborValidationSchema };

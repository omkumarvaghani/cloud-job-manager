const Joi = require("joi");

const QuoteValidationSchema = Joi.object({
  CompanyId: Joi.string().optional(),
  CustomerId: Joi.optional(),
  QuoteId: Joi.optional(),
  LocationId: Joi.optional(),
  Title: Joi.string().required(),
  QuoteNumber: Joi.optional(),
  SubTotal: Joi.optional(),
  Discount: Joi.optional(),
  Tax: Joi.optional(),
  Total: Joi.optional(),
  CustomerMessage: Joi.optional(),
  ContractDisclaimer: Joi.optional(),
  Notes: Joi.optional(),
  Attachment: Joi.optional(),
  status: Joi.optional(),
  CompanyName: Joi.optional(),
  DeleteReason: Joi.optional(),
  ChangeRequest: Joi.optional(),
  details: Joi.optional(),
  role: Joi.optional(),
  AddedAt: Joi.optional(),

  SignatureType: Joi.optional(),
  Signature: Joi.optional(),
  ApproveDate: Joi.optional(),

  IsDelete: Joi.boolean().default(false),
  IsApprovedByCustomer: Joi.boolean().default(false),
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

module.exports = {validateBody,QuoteValidationSchema};

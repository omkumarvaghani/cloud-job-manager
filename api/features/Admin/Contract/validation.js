const Joi = require("joi");

const ContractValidationSchema = Joi.object({
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
  IsRecuringJob: Joi.optional(),
  companyData: Joi.optional(),
  role: Joi.optional(),
  LastName: Joi.optional(),
  AddedAt: Joi.optional(),
  Description: Joi.optional(),
  ContractNumber: Joi.optional(),
  contract_disclaimer: Joi.optional(),
  OneoffJob: Joi.optional(),
  RecuringJob: Joi.optional(),
  subTotal: Joi.optional(),
  selectedTeams: Joi.optional(),
  products: Joi.optional(),
  IsOneoffJob: Joi.optional(),
  WorkerId: Joi.optional(),
  Frequency: Joi.optional(),
  Duration: Joi.optional(),
  _id: Joi.optional(),
  createdAt: Joi.optional(),
  updatedAt: Joi.optional(),
  customer: Joi.optional(),
  location: Joi.optional(),
  dropboxFiles: Joi.optional(),
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

module.exports = {validateBody,ContractValidationSchema};

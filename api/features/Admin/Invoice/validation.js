const Joi = require("joi");

const InvoiceValidationSchema = Joi.object({
  InvoiceId: Joi.optional(),
  CompanyId: Joi.optional(),
  ContractId: Joi.optional(),
  CustomerId: Joi.optional(),
  LocationId: Joi.optional(),
  WorkerId: Joi.array().items(Joi.string()).optional(),
  account_id: Joi.optional(),
  customerVaultId: Joi.optional(),
  recurringId: Joi.optional(),

  Subject: Joi.string().required(),
  InvoiceNumber: Joi.optional(),
  recurrings: Joi.optional(),
  IssueDate: Joi.optional(),
  DueDate: Joi.optional(),
  description: Joi.optional(),
  PaymentDue: Joi.optional(),
  
  Message: Joi.optional(),
  Notes: Joi.optional(),
  ContractDisclaimer: Joi.optional(),
  Discount: Joi.optional(),
  Tax: Joi.optional(),
  subTotal: Joi.optional(),
  Total: Joi.optional(),
  Description: Joi.optional(),
  selectedTeams: Joi.optional(),
  LastName: Joi.optional(),
  items: Joi.optional(),
  role: Joi.optional(),
  AddedAt: Joi.optional(),
  Attachment: Joi.array().items(Joi.string()).optional(),
  DeleteReason: Joi.optional(),
  Status: Joi.valid("Unpaid", "Paid", "Overdue").default("Unpaid"),
  LinkNote: Joi.boolean().default(false),
  IsDelete: Joi.boolean().default(false),
});

// Middleware to validate request body for Invoice
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

module.exports = {validateBody,InvoiceValidationSchema};

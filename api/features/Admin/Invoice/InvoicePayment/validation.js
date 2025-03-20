const Joi = require("joi");

// Invoice Payment validation schema with Joi
const invoicePaymentValidationSchema = Joi.object({
  InvoicePaymentId: Joi.string().optional(),
  InvoiceId: Joi.string().optional(),
  InvoiceNumber: Joi.string().optional(),
  CompanyId: Joi.string().optional(),
  account_id: Joi.string().optional(),
  CustomerId: Joi.string().optional(),

  method: Joi.string().optional(),
  customer_vault_id: Joi.string().optional(),
  transactionid: Joi.string().optional(),
  billing_id: Joi.string().optional(),
  amount: Joi.number().optional(),
  date: Joi.string().optional(),
  Total: Joi.number().optional(),
  dueDate: Joi.string().optional(),

  IsDelete: Joi.boolean().optional().default(false),
});

// Middleware to validate request body for Invoice Payment
const validateInvoicePaymentBody = (schema) => (req, res, next) => {
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

module.exports = { validateInvoicePaymentBody, invoicePaymentValidationSchema };

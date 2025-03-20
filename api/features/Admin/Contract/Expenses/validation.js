const Joi = require("joi");


const expensesValidationSchema = Joi.object({
  ContractId: Joi.string().optional(),
  CompanyId: Joi.string().optional(),
  ExpenseId: Joi.string().optional(),
  WorkerId: Joi.optional(),
  id: Joi.optional(),

  ItemName: Joi.string().required(),
  AccountingCode: Joi.optional(),
  Description: Joi.optional(),
  Date: Joi.string().required(),
  Total: Joi.number().required(),
  ReimburseTo: Joi.optional(),
  Attachment: Joi.optional(),
  DeleteReason: Joi.string().optional(),

  IsDelete: Joi.boolean().default(false),
});


const validateExpensesBody = (schema) => (req, res, next) => {
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

module.exports = {validateExpensesBody,expensesValidationSchema};


const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InvoiceItemSchema = new Schema({
  InvoiceItemId: { type: String },
  InvoiceId: { type: String },
  CustomerId: { type: String },
  LocationId: { type: String },
  ContractId: { type: String },
  CompanyId: { type: String },

  Type: { type: String }, 
  Name: { type: String },
  Description: { type: String },
  Unit: { type: String, default: null },
  CostPerUnit: { type: String, default: null },
  Hourly: { type: String, default: null },
  CostPerHour: { type: String, default: null },
  Square: { type: String, default: null },
  CostPerSquare: { type: String, default: null },
  Fixed: { type: String, default: null },
  CostPerFixed: { type: String, default: null },
  Total: { type: String },
  Attachment: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },
  IsDelete: { type: Boolean, default: false },

  // Hour
  // Hour: { type: String },
  // HourCost: { type: String },
});

module.exports = mongoose.model("InvoiceItem", InvoiceItemSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  account_id: { type: String },
  CompanyId: { type: String },
  account_name: { type: String },
  account_type: { type: String },
  charge_type: { type: String },
  fund_type: { type: String },
  notes: { type: String },  
  IsDelete: { type: Boolean, default: false },
},
{
  timestamps: true,
}

);

module.exports = mongoose.model("account", accountSchema);

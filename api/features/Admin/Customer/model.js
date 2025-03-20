const mongoose = require("mongoose");
const { string } = require("yup");
const Schema = mongoose.Schema;

const CustomerSchema = new Schema(
  {
    CompanyId: { type: String },
    CustomerId: { type: String },
    LocationId: { type: String },

    FirstName: { type: String },
    LastName: { type: String },

    profileImage: { type: String },

    PhoneNumber: { type: String },
    EmailAddress: { type: String },
    Password: { type: String },
    Type: { type: String },
    DeleteReason: {type: String}, 

    Role: { type: String, default: "Customer" },

    IsDelete: { type: Boolean, default: false },
    IsActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", CustomerSchema);

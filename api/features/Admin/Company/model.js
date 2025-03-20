const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CompanySchema = new Schema(
  {
    companyId: { type: String },
    industryId: { type: String },
    teamSizeId: { type: String },
    revenueId: { type: String },

    EmailAddress: { type: String },
    Password: { type: String },

    ownerName: { type: String },
    companyName: { type: String, trim: true },
    phoneNumber: { type: String },
    profileImage: { type: String },

    Address: { type: String },
    City: { type: String },
    State: { type: String },
    Country: { type: String },
    Zip: { type: String },

    Message: { type: String },

    role: { type: String, default: "Company" },

    IsDelete: { type: Boolean, default: false },
    IsActive: { type: Boolean, default: true },
    IsPlanActive: { type: Boolean, default: true },                 
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Company", CompanySchema);

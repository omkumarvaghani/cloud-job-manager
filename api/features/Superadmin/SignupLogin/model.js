const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SuperadminSchema = new Schema(
  {
    superAdminId: { type: String },

    fullName: { type: String },
    role: { type: String, default: "Superadmin" },

    EmailAddress: { type: String },
    Password: { type: String },
    profileImage: { type: String },
    PhoneNumber: { type: String },

    Address: { type: String },
    City: { type: String },
    State: { type: String },
    Zip: { type: String },
    Country: { type: String },


    IsDelete: { type: Boolean, default: false },
    IsActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("superadmin", SuperadminSchema);

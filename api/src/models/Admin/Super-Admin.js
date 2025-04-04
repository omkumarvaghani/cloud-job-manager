const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const SuperadminSchema = new Schema(
  {
    AdminId: { type: String, default: uuidv4, unique: true },

    FullName: { type: String },
    Role: { type: String, default: "Admin" },

    EmailAddress: { type: String },
    Password: { type: String },
    ProfileImage: { type: String },
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

module.exports = mongoose.model("Super-admin", SuperadminSchema);

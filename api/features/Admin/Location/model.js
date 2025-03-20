const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LocationSchema = new Schema(
  {
    CustomerId: { type: String },
    CompanyId: { type: String },
    LocationId: { type: String },

    Address: { type: String },
    City: { type: String },

    State: { type: String },
    Zip: { type: String },
    Country: { type: String },

    DeleteReason: {type: String}, 
    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Location", LocationSchema);

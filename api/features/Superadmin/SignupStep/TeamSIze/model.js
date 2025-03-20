const mongoose = require("mongoose");

const TeamSizeSchema = new mongoose.Schema({
  teamSizeId: {
    type: String,
  },
  teamSize: {
    type: String,
  },
  IsDelete: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Teamsize", TeamSizeSchema);

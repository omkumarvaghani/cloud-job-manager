const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const themeSchema = new Schema(
  {
    ThemeId: { type: String },
    CompanyId: { type: String },
    Format: { type: String },
    Colors: { type: Object },
    IsDelete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("themes", themeSchema);

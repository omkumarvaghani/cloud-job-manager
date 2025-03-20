const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activitySchema = new Schema(
  {
    ActivityId: { type: String },
    CompanyId: { type: String },

    Action: { type: String },
    Entity: {type: String},
    EntityId: {type: String},
    ActivityBy: { type: String },
    ActivityByUsername: { type: String },
    Activity: { type: Object },
    Reason:{type: String},

    IsDelete: { type: Boolean, default: false },
    createdAt: { type: String},
    updatedAt: {type: String},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("activitylog", activitySchema);

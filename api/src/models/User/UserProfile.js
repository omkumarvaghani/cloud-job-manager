const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userProfileSchema = new mongoose.Schema(
  {
    UserProfileId: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    UserId: {
      type: String,
      required: true,
      ref: "User",
    },
    CompanyId: {
      type: String,
      required: true,
      ref: "Company",
    },
    /*** COMMON FIELDS ***/
    FirstName: { type: String, trim: true },
    LastName: { type: String, trim: true },
    PhoneNumber: { type: String, trim: true },
    Address: { type: String, trim: true },
    City: { type: String, trim: true },
    State: { type: String, trim: true },
    Country: { type: String, trim: true },
    Zip: { type: String, trim: true },
    ProfileImage: { type: String },

    /*** COMPANY-SPECIFIC FIELDS ***/
    CompanyName: { type: String, trim: true },
    OwnerName: { type: String, trim: true },
    IndustryId: { type: String },
    TeamSizeId: { type: String },
    RevenueId: { type: String },
    IsPlanActive: { type: Boolean, default: false },

    /*** WORKER-SPECIFIC FIELDS ***/
    LaborCost: { type: Number },
    ScheduleTime: { type: String },

    /*** CUSTOMER-SPECIFIC FIELDS ***/
    CustomerId: { type: String },
    LocationId: { type: String },

    /*** STATUS ***/
    IsActive: { type: Boolean, default: true },
    IsDelete: { type: Boolean, default: false },
    DeleteReason: { type: String },
  },
  { timestamps: true }
);

userProfileSchema.index({ UserId: 1 });
userProfileSchema.index({ CompanyId: 1 });
userProfileSchema.index({ CustomerId: 1 });
userProfileSchema.index({ IsActive: 1, IsDelete: 1 });

const UserProfile = mongoose.model("User-Profile", userProfileSchema);
module.exports = UserProfile;

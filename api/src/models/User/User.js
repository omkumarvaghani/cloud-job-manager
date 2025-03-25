const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    UserId: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    CompanyId: {
      type: [String],
      required: true,
      ref: "Company",
    },
    Role: {
      type: String,
      enum: ["Admin", "Company", "Worker", "Customer"],
      required: true,
    },
    EmailAddress: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    Password: {
      type: String,
      // required: true,
    },
    IsActive: {
      type: Boolean,
      default: true,
    },
    IsDelete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
userSchema.index({ EmailAddress: 1 });
userSchema.index({ CompanyId: 1, Role: 1 });


userSchema.pre("save", async function (next) {
  if (!this.Password) return next();

  if (!this.isModified("Password")) return next(); 

  try {
    const salt = await bcrypt.genSalt(10);
    this.Password = await bcrypt.hash(this.Password, salt);
    next();
  } catch (error) {
    return next(error); 
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.Password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;

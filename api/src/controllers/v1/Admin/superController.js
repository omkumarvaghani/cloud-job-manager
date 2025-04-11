const { decryptData } = require("../../../middleware/authMiddleware");
const SuperAdmin = require("../../../models/Admin/Super-Admin");
const User = require("../../../models/User/User");
const bcrypt = require("bcryptjs");

// **CREATE SUPERADMIN API**
exports.createSuperAdmin = async (req, res) => {
  try {
    const {
      FullName,
      EmailAddress,
      Password,
      ProfileImage,
      PhoneNumber,
      Address,
      City,
      State,
      Zip,
      Country,
    } = req.body;

    const existingUser = await User.findOne({ EmailAddress, IsDelete: false });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists in the User collection." });
    }

    const newSuperAdmin = new SuperAdmin({
      FullName,
      EmailAddress,
      Password,
      ProfileImage,
      PhoneNumber,
      Address,
      City,
      State,
      Zip,
      Country,
    });

    await newSuperAdmin.save();

    return res.status(201).json({
      message: "Superadmin created successfully.",
      data: newSuperAdmin,
    });
  } catch (error) {
    console.error("Error creating superadmin:", error);
    return res.status(500).json({
      message: "Something went wrong, please try again later.",
    });
  }
};

// **GET USER BY ID API**
exports.getSuperData = async (req, res) => {
  const superAdmin = await SuperAdmin.findOne({ IsDelete: false });
  //   let decryptedPassword = null;

  //   if (superAdmin && superAdmin.Password) {
  //     try {
  //       decryptedPassword = decryptData(superAdmin.Password, secretKey);
  //     } catch (error) {
  //       console.error("Error decrypting password:", error);
  //     }
  //   }

  if (superAdmin) {
    return res.status(200).json({
      statusCode: 200,
      message: "SuperAdmin profile retrieved successfully",
      data: {
        ...superAdmin.toObject(),
        // Password: decryptedPassword,
      },
    });
  } else {
    return res.status(204).json({
      statusCode: 204,
      message: "No SuperAdmin found",
    });
  }
};

exports.updateSuperAdminProfile = async (req, res) => {
  const {
    FullName,
    EmailAddress,
    // Password,
    PhoneNumber,
    Address,
    City,
    State,
    Zip,
    Country,
    ProfileImage,
  } = req.body;

  const updateData = {
    FullName,
    EmailAddress,
    // Password,
    PhoneNumber,
    Address,
    City,
    State,
    Zip,
    Country,
    ProfileImage,
  };

  // Encrypt the password if provided
  //   if (Password) {
  //     const hashedPassword = encryptData(Password, secretKey);
  //     updateData.Password = hashedPassword;
  //   }

  // Update the SuperAdmin details
  const superAdmin = await SuperAdmin.findOneAndUpdate(
    { IsDelete: false },
    { $set: updateData },
    { new: true }
  );

  if (!superAdmin) {
    return res.status(404).json({
      statusCode: 404,
      message: "SuperAdmin not found!",
    });
  }

  if (updateData.products) {
    superAdmin.products = updateData.products;
    await superAdmin.save();
  }

  return res.status(200).json({
    statusCode: 200,
    message: "SuperAdmin updated successfully",
    data: superAdmin,
  });
};

exports.updateAdminChangePass = async (req, res) => {
  const {
    oldPassword,
    Password: newPassword,
    confirmpassword: confirmPassword,
  } = req.body;

  try {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "All password fields are required" });
    }

    const user = await SuperAdmin.findOne({ IsDelete: false });
    if (!user || !user.Password) {
      return res
        .status(404)
        .json({ message: "SuperAdmin not found or password missing" });
    }

    const isOldPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.Password
    );
    if (!isOldPasswordCorrect) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.Password);
    if (isSameAsOld) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.Password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password Update Error:", error);
    return res
      .status(500)
      .json({ message: "Server error, please try again later" });
  }
};

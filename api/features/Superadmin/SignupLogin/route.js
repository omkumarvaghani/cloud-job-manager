var express = require("express");
var router = express.Router();
var SuperAdmin = require("./model");
var Company = require("../../Admin/Company/model");
var Customer = require("../../Admin/Customer/model");
var Plan = require("../../Superadmin/Plan/model");
const moment = require("moment");
const {
  encryptData,
  decryptData,
  createToken,
  verifyToken,
  verifyLoginToken,
} = require("../../../authentication");

const secretKey = process.env.SECRET_KEY;
const cdnBaseUrl = process.env.CDN_BASE_URL;

// Superasdmin Signup
const registerSuperAdmin = async (reqBody) => {
  const company = await Company.findOne({
    EmailAddress: reqBody.EmailAddress,
    IsDelete: false,
  });

  const superadmin = await SuperAdmin.findOne({
    EmailAddress: reqBody.EmailAddress,
    IsDelete: false,
  });

  const customer = await Customer.findOne({
    EmailAddress: reqBody.EmailAddress,
    IsDelete: false,
  });

  if (company || superadmin || customer) {
    return {
      statusCode: 201,
      message: "Email Already Used!",
    };
  } else {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    reqBody["superAdminId"] = uniqueId;
    reqBody["createdAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    reqBody["updatedAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");

    let hashConvert = encryptData(reqBody.Password, secretKey);
    reqBody.Password = hashConvert;

    const data = await SuperAdmin.create(reqBody);

    return {
      statusCode: 200,
      data: data,
      message: "SuperAdmin created successfully",
    };
  }
};

router.post("/register", verifyLoginToken, async (req, res) => {
  try {
    const result = await registerSuperAdmin(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------GET DASHBOARD COUNT--------------------------------

const countCompaniesAndPlans = async () => {
  const activeCompaniesCount = await Company.countDocuments({
    IsDelete: false,
    IsActive: true,
  });

  const inactiveCompaniesCount = await Company.countDocuments({
    IsDelete: false,
    IsActive: false,
  });

  const plansCount = await Plan.countDocuments({ IsDelete: false });

  const totalCompaniesCount = activeCompaniesCount + inactiveCompaniesCount;

  return {
    activeCompanies: activeCompaniesCount,
    inactiveCompanies: inactiveCompaniesCount,
    totalCompanies: totalCompaniesCount,
    totalPlans: plansCount,
  };
};

router.get("/counts", verifyLoginToken, async (req, res) => {
  try {
    const counts = await countCompaniesAndPlans();
    res.status(200).json({
      statusCode: 200,
      message: "Counts retrieved successfully",
      data: counts,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------GET PROFILE--------------------------------

const getSuperAdminProfile = async () => {
  const superAdmin = await SuperAdmin.findOne({ IsDelete: false });
  let decryptedPassword = null;

  if (superAdmin && superAdmin.Password) {
    try {
      decryptedPassword = decryptData(superAdmin.Password, secretKey);
    } catch (error) {
      console.error("Error decrypting password:", error);
    }
  }

  if (superAdmin) {
    return {
      statusCode: 200,
      message: "SuperAdmin profile retrieved successfully",
      data: {
        ...superAdmin.toObject(),
        Password: decryptedPassword,
      },
    };
  } else {
    return {
      statusCode: 204,
      message: "No SuperAdmin found",
    };
  }
};

router.get("/profile", verifyLoginToken, async (req, res) => {
  try {
    const response = await getSuperAdminProfile();
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------UPDATE PROFILE--------------------------------

const updateSuperAdminProfile = async (updateData) => {
  // Add the current timestamp
  updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  const { EmailAddress, Password } = updateData;

  // Encrypt the password if provided
  if (Password) {
    const hashedPassword = encryptData(Password, secretKey);
    updateData.Password = hashedPassword;
  }

  // Update the SuperAdmin details
  const superAdmin = await SuperAdmin.findOneAndUpdate(
    { IsDelete: false },
    { $set: updateData },
    { new: true }
  );

  if (!superAdmin) {
    return {
      statusCode: 404,
      message: "SuperAdmin not found!",
    };
  }

  if (updateData.products) {
    superAdmin.products = updateData.products;
    await superAdmin.save();
  }

  return {
    statusCode: 200,
    message: "SuperAdmin updated successfully",
    data: superAdmin,
  };
};

router.put("/profile", verifyLoginToken, async (req, res) => {
  try {
    const {
      fullName,
      EmailAddress,
      Password,
      PhoneNumber,
      Address,
      City,
      State,
      Zip,
      Country,
      profileImage,
    } = req.body;

    const updateData = {
      fullName,
      EmailAddress,
      Password,
      PhoneNumber,
      Address,
      City,
      State,
      Zip,
      Country,
      profileImage,
    };

    const result = await updateSuperAdminProfile(updateData);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error in updating SuperAdmin profile:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

router.put("/change-password", async (req, res) => {
  const { Password, confirmpassword } = req.body;

  try {
    const superAdmin = await SuperAdmin.findOne({ IsDelete: false });
    if (!superAdmin) {
      return res.status(404).json({ message: "superAdmin not found" });
    }

    const decryptedPassword = decryptData(superAdmin.Password);

    if (Password === decryptedPassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }

    superAdmin.Password = encryptData(Password);
    await superAdmin.save();

    return res.status(200).json({ message: "Password successfully changed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

var express = require("express");
var router = express.Router();

var Company = require("./model");
var Customer = require("../Customer/model");
var Plan = require("../../Superadmin/Plan/model");
var PlanPurchase = require("../PlanPurchase/model");
var SuperAdmin = require("../../Superadmin/SignupLogin/model");
var Worker = require("../../Admin/Worker/model");
var Industry = require("../../Superadmin/SignupStep/Industry/model");
var Revenue = require("../../Superadmin/SignupStep/Revenue/model");
var TeamSIze = require("../../Superadmin/SignupStep/TeamSIze/model");
var Mail = require("../../Superadmin/MailConfiguration/model");
var Key = require("../../Superadmin/NMIKeys/model");
var Quotes = require("../Quote/model");
var Contracts = require("../Contract/model");
var Invoices = require("../Invoice/model");
const Themes = require("../Theme/model");
const moment = require("moment");

const {
  encryptData,
  decryptData,
  createToken,
  verifyToken,
  verifyLoginToken,
} = require("../../../authentication");
const {
  validateCompanyBody,
  companyValidationSchema,
} = require("./validation");

const secretKey = process.env.SECRET_KEY;

// Token Decode
const getTokenData = async (token) => {
  if (!token) {
    return {
      statusCode: 404,
      message: "Token is required",
    };
  }

  let data = verifyToken(token, secretKey);

  if (data.role === "Company") {
    const companyData = await Company.findOne({
      companyId: data?.companyId,
    });

    data = {
      ...data,
      ...companyData.toObject(),
      full_name: companyData.ownerName,
    };
  }

  if (data.role === "worker") {
    const workerData = await Worker.findOne({
      WorkerId: data?.WorkerId,
    });

    data = {
      ...data,
      ...workerData.toObject(),
      full_name: workerData.FullName,
    };
  }
  if (data.role === "customer") {
    const customerData = await Customer.findOne({
      CustomerId: data?.CustomerId,
    });

    data = {
      ...data,
      ...customerData.toObject(),
      full_name: `${customerData.FirstName} ${customerData.LastName}`,
    };
  }
  if (data.role === "Superadmin") {
    const superadminData = await SuperAdmin.findOne({
      SuperadminId: data?.SuperadminId,
    });

    data = {
      ...data,
      ...superadminData.toObject(),
      full_name: superadminData.fullName,
    };
  }

  if (data) {
    return {
      statusCode: 200,
      data,
    };
  } else {
    return {
      statusCode: 401,
      message: "Invalid token",
    };
  }
};
router.get("/token_data", verifyLoginToken, async (req, res) => {
  try {
    const { token } = req.query;
    const response = getTokenData(token);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------POST DATA----------------------------------------

router.post("/token_data", async (req, res) => {
  try {
    const { token } = req.body;
    const response = await getTokenData(token);

    if (response?.data?.companyId) {
      const companyFind = await Company.findOne({
        companyId: response?.data?.companyId,
      });

      if (companyFind && !companyFind.IsActive) {
        return res.status(401).json({
          statusCode: 401,
          message: "Company is inactive. Please log in again.",
        });
      }
    }

    const themes = await Themes.findOne({
      CompanyId: response?.data?.companyId,
      IsDelete: false,
    });

    if (themes) {
      response.themes = themes;
    }

    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

const checkUserExists = async (email) => {
  const company = await Company.findOne({
    EmailAddress: email,
    IsDelete: false,
  });

  const superAdmin = await SuperAdmin.findOne({
    EmailAddress: email,
    IsDelete: false,
  });

  const customer = await Customer.findOne({
    EmailAddress: email,
    IsDelete: false,
  });

  const worker = await Worker.findOne({
    EmailAddress: email,
    IsDelete: false,
  });

  if (company || superAdmin || customer || worker) {
    return {
      statusCode: 302,
      message: "E-mail Already Exists!",
    };
  } else {
    return {
      statusCode: 200,
    };
  }
};
router.post("/check_user", async (req, res) => {
  try {
    const { EmailAddress } = req.body;
    const response = await checkUserExists(EmailAddress);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

// -------------------------------POST REGISTER DATA----------------------------------------

// Company Register
const registerCompany = async (companyData) => {
  const companyNameWithoutSpaces = companyData.companyName.split(" ").join("");

  const existingCompany = await Company.findOne({
    companyName: companyNameWithoutSpaces,
    IsDelete: false,
  });

  if (existingCompany) {
    return {
      statusCode: 200,
      message: "Company Name Already Used!",
    };
  }

  const timestamp = Date.now();
  const uniqueId = `${timestamp}`;

  companyData["companyId"] = uniqueId;

  companyData["companyName"] = companyData.companyName
    .split(" ")
    .join("")
    .toLowerCase();

  companyData["createdAt"] = moment()
    .utcOffset(330)
    .format("YYYY-MM-DD HH:mm:ss");
  companyData["updatedAt"] = moment()
    .utcOffset(330)
    .format("YYYY-MM-DD HH:mm:ss");

  companyData.Password = encryptData(companyData.Password, secretKey);
  const newCompany = await Company.create(companyData);

  return {
    statusCode: 201,
    data: newCompany,
    message: "Company Created Successfully",
  };
};

router.post("/register", async (req, res) => {
  try {
    const response = await registerCompany(req.body);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------POST DATA----------------------------------------

// Superadmin add Company

const checkExistingEmail = async (email) => {
  const [company, superAdmin, customer] = await Promise.all([
    Company.findOne({ EmailAddress: email, IsDelete: false }),
    SuperAdmin.findOne({ EmailAddress: email, IsDelete: false }),
    Customer.findOne({ EmailAddress: email, IsDelete: false }),
    Worker.findOne({ EmailAddress: email, IsDelete: false }),
  ]);

  if (company || superAdmin || customer) {
    return {
      statusCode: 202,
      message: "E-mail Already Exists!",
    };
  }
  return null;
};

const checkExistingCompany = async (companyName) => {
  const company = await Company.findOne({ companyName, IsDelete: false });
  if (company) {
    return {
      statusCode: 201,
      message: "Company Name Already Used!",
    };
  }
  return null;
};

const createIndustry = async (industryName) => {
  const timestamp = Date.now().toString();
  const industry = await Industry.create({
    industryId: timestamp,
    industry: industryName,
    createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
  });
  return industry.industryId;
};

const createTeamSize = async (teamSizeValue) => {
  const timestamp = Date.now().toString();
  const teamSize = await TeamSIze.create({
    teamSizeId: timestamp,
    teamSize: teamSizeValue,
    createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
  });
  return teamSize.teamSizeId;
};

const createRevenue = async (revenueValue) => {
  const timestamp = Date.now().toString();
  const revenue = await Revenue.create({
    revenueId: timestamp,
    revenue: revenueValue,
    createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
  });
  return revenue.revenueId;
};

const registersuperCompany = async (companyDetails) => {
  const timestamp = Date.now().toString();
  const hashedPassword = encryptData(companyDetails.Password, secretKey);

  const companyData = {
    ...companyDetails,
    companyId: timestamp,
    Password: hashedPassword,
    createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
  };

  const company = await Company.create(companyData);
  return {
    statusCode: 200,
    data: company,
    message: "Company Created Successfully!",
  };
};
router.post(
  "/superadmin/register",
  validateCompanyBody(companyValidationSchema),
  async (req, res) => {
    try {
      const { EmailAddress, companyName, Industry, TeamSize, Revenue } =
        req.body;

      const emailExists = await checkExistingEmail(EmailAddress);
      if (emailExists) return res.status(200).json(emailExists);

      const companyExists = await checkExistingCompany(companyName);
      if (companyExists) return res.status(200).json(companyExists);

      if (!req.body.industryId && Industry) {
        req.body.industryId = await createIndustry(Industry);
      }

      if (!req.body.teamSizeId && TeamSize) {
        req.body.teamSizeId = await createTeamSize(TeamSize);
      }

      if (!req.body.revenueId && Revenue) {
        req.body.revenueId = await createRevenue(Revenue);
      }
      const result = await registersuperCompany(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//-------------------------------LOGIN----------------------------------------

// Find Email in which collection
const findUser = async (email) => {
  let user = await SuperAdmin.findOne({
    EmailAddress: email,
    IsDelete: false,
  });

  if (user) return { user, userType: "SuperAdmin", IsDelete: false };

  user = await Company.findOne({
    EmailAddress: email,
    IsDelete: false,
  });

  if (user) return { user, userType: "Company" };

  user = await Worker.findOne({ EmailAddress: email, IsDelete: false });

  if (user) return { user, userType: "Worker", IsDelete: false };

  user = await Customer.findOne({ EmailAddress: email, IsDelete: false });

  if (user) return { user, userType: "Customer", IsDelete: false };

  return null;
};

router.post("/login", async (req, res) => {
  try {
    const { EmailAddress, Password } = req.body;
    const userResult = await findUser(EmailAddress);

    if (!userResult) {
      return res.status(200).json({
        statusCode: 204,
        message: "Invalid email or password",
      });
    }

    const { user, userType } = userResult;

    if (!user.IsActive) {
      return res.status(400).json({
        statusCode: 400,
        message: "Account is deactivated. Please contact support.",
      });
    }
    const decryptedPassword = decryptData(user.Password);

    if (Password !== decryptedPassword) {
      return res.status(200).json({
        statusCode: 202,
        message: "Invalid email or password",
      });
    }

    let tokenData;
    if (userType === "SuperAdmin") {
      tokenData = {
        superAdminId: user.superAdminId,
        full_name: user.fullName,
        EmailAddress: user.EmailAddress,
        role: user.role,
        isActive: true,
        profileImage: user.profileImage,
      };
    } else if (userType === "Company") {
      tokenData = {
        companyId: user.companyId,
        full_name: user.ownerName,
        phoneNumber: user.phoneNumber,
        EmailAddress: user.EmailAddress,
        companyName: user.companyName,
        role: user.role,
        Address: user.Address,
        City: user.City,
        State: user.State,
        Country: user.Country,
        Zip: user.Zip,
        isActive: user.IsActive,
        IsPlanActive: user.IsPlanActive,
        profileImage: user.profileImage,
      };
    } else if (userType === "Worker") {
      tokenData = {
        companyId: user.companyId,
        WorkerId: user.WorkerId,
        full_name: user.FullName ? user.FullName : "",
        PhoneNumber: user.PhoneNumber,
        EmailAddress: user.EmailAddress,
        role: "worker",
        isActive: true,
        profileImage: user.profileImage,
      };
    } else if (userType === "Customer") {
      tokenData = {
        CompanyId: user.CompanyId,
        CustomerId: user.CustomerId,
        full_name: user.FirstName + " " + user.LastName,
        EmailAddress: user.EmailAddress,
        role: "customer",
        isActive: true,
        IsPlanActive: true,
        profileImage: user.profileImage,
      };
    }

    const token = createToken(tokenData);

    let response = {
      statusCode: 200,
      token,
      id:
        userType === "SuperAdmin"
          ? user.superAdminId
          : userType === "Company"
          ? user.companyId
          : userType === "Worker"
          ? user.WorkerId
          : undefined,
      data: {
        id:
          userType === "SuperAdmin"
            ? user.superAdminId
            : userType === "Company"
            ? user.companyId
            : userType === "Worker"
            ? user.WorkerId
            : userType === "Customer"
            ? user.CustomerId
            : undefined,
        ownerName: userType === "Company" ? user.ownerName : undefined,
        EmailAddress: user.EmailAddress,
        companyName: user.companyName,
        role: user.role,
        isActive: tokenData.isActive,
      },
    };

    if (userType === "SuperAdmin") {
      response.message = "Super Admin Authenticated";
      response.statusCode = 300;
    } else if (userType === "Company") {
      response.message = "Company Authenticated";
      response.statusCode = 301;
    } else if (userType === "Worker") {
      response.message = "Worker Authenticated";
      response.statusCode = 302;
    } else if (userType === "Customer") {
      response.message = "Customer Authenticated";
      response.statusCode = 303;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------POST AUTH DATA----------------------------------------

//  Auth (Check Logedin Company)
const verifyAndFetchCompany = async (token) => {
  const user = await verifyToken(token);
  const company = await Company.findOne({
    companyId: user.companyId,
    IsDelete: false,
  });

  if (company) {
    return {
      statusCode: 200,
      message: "Okk",
      role: company.role,
      data: company,
    };
  } else {
    return {
      statusCode: 202,
      message: "Company not found",
    };
  }
};
router.post("/auth", verifyLoginToken, async (req, res) => {
  try {
    const result = await verifyAndFetchCompany(req.body.token);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------GET DATA----------------------------------------

// Get Company Profile
const getCompanyProfile = async (companyId) => {
  const company = await Company.findOne({ companyId, IsDelete: false });
  let decryptedPassword = null;
  if (company.Password) {
    try {
      decryptedPassword = decryptData(company.Password, secretKey);
    } catch (error) {
      console.error("Error decrypting password:", error);
    }
  }
  if (company) {
    return {
      statusCode: 200,
      message: "Company profile retrieved successfully",
      data: { ...company.toObject(), Password: decryptedPassword },
    };
  } else {
    return {
      statusCode: 204,
      message: "No company found",
    };
  }
};
router.get("/profile/:companyId", async function (req, res) {
  try {
    const { companyId } = req.params;
    const response = await getCompanyProfile(companyId);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------GET DATA----------------------------------------

const getCompanyDropdown = async () => {
  const data = await Company.find({ IsDelete: false });
  return {
    statusCode: 201,
    message: "Data retrieved successfully",
    data: data,
  };
};
router.get("/dropdown", async (req, res) => {
  try {
    const result = await getCompanyDropdown();
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------PUT DATA----------------------------------------

// Update Company Profile
const updateCompanyProfile = async (companyId, updateData) => {
  updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  const { EmailAddress, companyName, Password } = updateData;

  if (Password) {
    const hashedPassword = encryptData(Password, secretKey);
    updateData.Password = hashedPassword;
  }
  const admin = await Company.findOneAndUpdate(
    { companyId, IsDelete: false },
    { $set: updateData },
    { new: true }
  );

  // admin.Password = encryptData(admin.Password, secretKey);

  if (!admin) {
    return {
      statusCode: 404,
      message: "Company not found!",
    };
  }

  if (updateData.products) {
    admin.products = updateData.products;
    await admin.save();
  }

  return {
    statusCode: 200,
    message: "Profile updated successfully",
    data: admin,
  };
};
router.put("/profile/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const result = await updateCompanyProfile(companyId, req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

// ---------------------------- Superadmin -------------------------------------
// Get Company's for Superadmin
// const getCompanies = async (queryParams) => {
//   const pageSize = parseInt(queryParams.pageSize) || 10;
//   const pageNumber = parseInt(queryParams.pageNumber) || 0;
//   const searchQuery = queryParams.search;
//   const sortOrder = query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;

//   const allowedSortFields = [
//     "ownerName",
//     "companyName",
//     "EmailAddress",
//     "IsActive",
//     "plandata",
//     "createdAt",
//   ];

//   const sortField = allowedSortFields.includes(query.sortField)
//     ? query.sortField
//     : "updatedAt";

//   let query = { IsDelete: false, role: "Company" };

//   if (searchQuery) {
//     query.$or = [
//       { ownerName: { $regex: searchQuery, $options: "i" } },
//       { companyName: { $regex: searchQuery, $options: "i" } },
//       { EmailAddress: { $regex: searchQuery, $options: "i" } },
//     ];
//   }

//   let sortOptions = {};
//   if (sortField) {
//     sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
//   }

//   const totalDataCount = await Company.countDocuments(query);

//   const data = await Company.find(query)
//     .sort(sortOptions)
//     .skip(pageNumber * pageSize)
//     .limit(pageSize);

//   const enhancedData = await Promise.all(
//     data.map(async (admin) => {
//       const revenue = await Revenue.findOne({
//         revenueId: admin.revenueId,
//         IsDelete: false,
//       });

//       let decryptedPassword = null;
//       if (admin.Password) {
//         try {
//           decryptedPassword = decryptData(admin.Password, secretKey);
//         } catch (error) {
//           console.error("Error decrypting password:", error);
//         }
//       }

//       const teamsize = await TeamSIze.findOne({
//         teamSizeId: admin.teamSizeId,
//         IsDelete: false,
//       });
//       const industry = await Industry.findOne({
//         industryId: admin.industryId,
//         IsDelete: false,
//       });
//       const mailconfig = await Mail.findOne({
//         MailConfigurationId: admin.MailConfigurationId,
//         IsDelete: false,
//       });

//       const planPurchase = await PlanPurchase.findOne({
//         CompanyId: admin.companyId,
//         IsDelete: false,
//       });

//       const NmiKeys = await Key.findOne({
//         CompanyId: admin.companyId,
//         IsDelete: false,
//       });

//       let planName = null;

//       if (planPurchase) {
//         const planData = await Plan.findOne({
//           PlanId: planPurchase?.PlanId,
//           IsDelete: false,
//         });

//         if (planData) {
//           if (admin.IsPlanActive === true) {
//             planName = planData.PlanName;
//           } else if (admin.IsPlanActive === false) {
//             planName = "no active plan";
//           }
//         }
//       }
//       if (!planName) {
//         planName = "Trial Plan";
//       }

//       return {
//         ...admin.toObject(),
//         planData: planName,
//         revenue: revenue ? revenue.revenue : null,
//         NmiKeyId: NmiKeys ? NmiKeys.NmiKeyId : null,
//         SecurityKey: NmiKeys ? NmiKeys.SecurityKey : null,
//         PublicKey: NmiKeys ? NmiKeys.PublicKey : null,
//         SigningKey: NmiKeys ? NmiKeys.SigningKey : null,
//         teamsize: teamsize ? teamsize.teamSize : null,
//         industry: industry ? industry.industry : null,
//         mailconfig: mailconfig ? mailconfig.mailconfig : null,
//         Password: decryptedPassword || null,
//       };
//     })
//   );

//   return {
//     statusCode: 200,
//     data: enhancedData,
//     count: totalDataCount,
//   };
// };

// router.get("/get", async (req, res) => {
//   try {
//     query.sortField = query.sortField || "updatedAt";
//     query.sortOrder = query.sortOrder || "desc";
//     const result = await getCompanies(req.query);
//     res.status(result.statusCode).json(result);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({
//       statusCode: 500,
//       message: "Something went wrong, please try later!",
//     });
//   }
// });
const getCompanies = async (queryParams) => {
  const pageSize = parseInt(queryParams.pageSize) || 10;
  const pageNumber = parseInt(queryParams.pageNumber) || 0;
  const searchQuery = queryParams.search;
  const sortOrder = queryParams.sortOrder?.toLowerCase() === "desc" ? -1 : 1;

  const allowedSortFields = [
    "ownerName",
    "companyName",
    "EmailAddress",
    "IsActive",
    "plandata",
    "createdAt",
  ];

  const sortField = allowedSortFields.includes(queryParams.sortField)
    ? queryParams.sortField
    : "updatedAt";

  let query = { IsDelete: false, role: "Company" };

  if (searchQuery) {
    query.$or = [
      { ownerName: { $regex: searchQuery, $options: "i" } },
      { companyName: { $regex: searchQuery, $options: "i" } },
      { EmailAddress: { $regex: searchQuery, $options: "i" } },
    ];
  }

  let sortOptions = {};
  if (sortField) {
    sortOptions[sortField] = sortOrder;
  }

  const totalDataCount = await Company.countDocuments(query);

  const data = await Company.find(query)
    .sort(sortOptions)
    .skip(pageNumber * pageSize)
    .limit(pageSize);

  const enhancedData = await Promise.all(
    data.map(async (admin) => {
      const revenue = await Revenue.findOne({
        revenueId: admin.revenueId,
        IsDelete: false,
      });

      let decryptedPassword = null;
      if (admin.Password) {
        try {
          decryptedPassword = decryptData(admin.Password, secretKey);
        } catch (error) {
          console.error("Error decrypting password:", error);
        }
      }

      const teamsize = await TeamSIze.findOne({
        teamSizeId: admin.teamSizeId,
        IsDelete: false,
      });
      const industry = await Industry.findOne({
        industryId: admin.industryId,
        IsDelete: false,
      });
      const mailconfig = await Mail.findOne({
        MailConfigurationId: admin.MailConfigurationId,
        IsDelete: false,
      });

      const planPurchase = await PlanPurchase.findOne({
        CompanyId: admin.companyId,
        IsDelete: false,
      });

      const NmiKeys = await Key.findOne({
        CompanyId: admin.companyId,
        IsDelete: false,
      });

      let planName = null;

      if (planPurchase) {
        const planData = await Plan.findOne({
          PlanId: planPurchase?.PlanId,
          IsDelete: false,
        });

        if (planData) {
          planName = admin.IsPlanActive ? planData.PlanName : "no active plan";
        }
      }
      if (!planName) {
        planName = "Trial Plan";
      }

      return {
        ...admin.toObject(),
        planData: planName,
        revenue: revenue ? revenue.revenue : null,
        NmiKeyId: NmiKeys ? NmiKeys.NmiKeyId : null,
        SecurityKey: NmiKeys ? NmiKeys.SecurityKey : null,
        PublicKey: NmiKeys ? NmiKeys.PublicKey : null,
        SigningKey: NmiKeys ? NmiKeys.SigningKey : null,
        teamsize: teamsize ? teamsize.teamSize : null,
        industry: industry ? industry.industry : null,
        mailconfig: mailconfig ? mailconfig.mailconfig : null,
        Password: decryptedPassword || null,
      };
    })
  );

  return {
    statusCode: 200,
    data: enhancedData,
    count: totalDataCount,
  };
};

router.get("/get", async (req, res) => {
  try {
    req.query.sortField = req.query.sortField || "updatedAt";
    req.query.sortOrder = req.query.sortOrder || "desc";
    const result = await getCompanies(req.query);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

// //-------------------------------GET GRAPH COUNT--------------------------------

const getCompaniesYearMonthGraphData = async () => {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  try {
    // Log current and previous year for debugging purposes
    const data = await Company.aggregate([
      {
        $match: {
          IsDelete: false,
          createdAt: { $exists: true, $ne: null }, // Ensure createdAt exists and is not null
        },
      },
      {
        $addFields: {
          createdAtDate: { $toDate: "$createdAt" },
          yearGroup: { $year: { $toDate: "$createdAt" } },
          monthGroup: { $month: { $toDate: "$createdAt" } }, // Convert createdAt to Date
        },
      },
      {
        $match: {
          yearGroup: { $in: [currentYear, previousYear] }, // Ensure createdAtDate exists and is valid
        },
      },
      {
        $match: {
          yearGroup: { $in: [currentYear, previousYear] }, // Filter for the current and previous year
        },
      },
      {
        $group: {
          _id: { year: "$yearGroup", month: "$monthGroup" },
          activeCompanies: {
            $sum: { $cond: [{ $eq: ["$IsActive", true] }, 1, 0] },
          },
          inactiveCompanies: {
            $sum: { $cond: [{ $eq: ["$IsActive", false] }, 1, 0] },
          },
          totalCompanies: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.year", // Group by year
          months: {
            $push: {
              month: "$_id.month",
              activeCompanies: "$activeCompanies",
              inactiveCompanies: "$inactiveCompanies",
            },
          },
        },
      },
      {
        $sort: {
          _id: -1, // Sort years descending (current year first, then previous year)
        },
      },
    ]);

    return {
      statusCode: 200,
      data,
    };
  } catch (error) {
    console.error("Error fetching year-month graph data:", error);
    return {
      statusCode: 500,
      message: "An error occurred while fetching graph data",
    };
  }
};

router.get("/companies-year-month-graph", async (req, res) => {
  try {
    const result = await getCompaniesYearMonthGraphData();
    res.status(result.statusCode).json({
      statusCode: result.statusCode,
      message: "Year-Month graph data retrieved successfully",
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------PUT DATA----------------------------------------

// update Company (Superadmin)
const superCompanyProfile = async (companyId, companyData) => {
  const { EmailAddress, companyName, Password } = companyData;
  if (Password) {
    const hashedPassword = encryptData(Password, secretKey);
    companyData.Password = hashedPassword;
  }

  companyData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  const existingCompanyName = await Company.findOne({
    companyName: { $regex: new RegExp("^" + companyName + "$", "i") },
    IsDelete: false,
  });

  if (existingCompanyName && companyId !== existingCompanyName.companyId) {
    return {
      statusCode: 201,
      message: `${companyName} name already exists`,
    };
  }

  const existingEmail = await Company.findOne({
    EmailAddress: {
      $regex: new RegExp("^" + EmailAddress + "$", "i"),
    },
    IsDelete: false,
  });

  const superAdmin = await SuperAdmin.findOne({
    EmailAddress: {
      $regex: new RegExp("^" + EmailAddress + "$", "i"),
    },
    IsDelete: false,
  });

  const customer = await Customer.findOne({
    EmailAddress: {
      $regex: new RegExp("^" + EmailAddress + "$", "i"),
    },
    IsDelete: false,
  });

  const worker = await Worker.findOne({
    EmailAddress: {
      $regex: new RegExp("^" + EmailAddress + "$", "i"),
    },
    IsDelete: false,
  });

  if (
    (existingEmail && companyId !== existingEmail.companyId) ||
    (superAdmin && companyId !== superAdmin.companyId) ||
    (customer && companyId !== customer.CompanyId) ||
    (worker && companyId !== worker.companyId)
  ) {
    return {
      statusCode: 202,
      message: `${EmailAddress} mail already exists`,
    };
  }

  // Industry
  if (
    !companyData.industryId ||
    (companyData.industryId === "" && companyData.Industry)
  ) {
    const timestamp = Date.now();
    const industryId = `${timestamp}`;
    companyData["createdAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    companyData["updatedAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");

    const industryData = await Industry.create({
      industryId,
      industry: companyData.Industry,
    });
    companyData["industryId"] = industryData.industryId;
  }

  // TeamSize
  if (
    !companyData.teamSizeId ||
    (companyData.teamSizeId === "" && companyData.TeamSize)
  ) {
    const timestamp = Date.now();
    const teamSizeId = `${timestamp}`;
    companyData["createdAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    companyData["updatedAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");

    const teamSizeData = await TeamSIze.create({
      teamSizeId,
      teamSize: companyData.TeamSize,
    });
    companyData["teamSizeId"] = teamSizeData.teamSizeId;
  }

  // Revenue
  if (
    !companyData.revenueId ||
    (companyData.revenueId === "" && companyData.Revenue)
  ) {
    const timestamp = Date.now();
    const revenueId = `${timestamp}`;
    companyData["createdAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    companyData["updatedAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");

    const revenueData = await Revenue.create({
      revenueId,
      revenue: companyData.Revenue,
    });
    companyData["revenueId"] = revenueData.revenueId;
  }

  const result = await Company.findOneAndUpdate(
    { companyId: companyId, IsDelete: false },
    { $set: companyData },
    { new: true }
  );

  if (result) {
    return {
      statusCode: 200,
      message: "Company updated successfully",
    };
  } else {
    return {
      statusCode: 404,
      message: "Company not found",
    };
  }
};
router.put("/:companyId", verifyLoginToken, async (req, res) => {
  try {
    const { companyId } = req.params;
    const result = await superCompanyProfile(companyId, req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

router.put("/active/:companyId", async (req, res) => {
  const { companyId } = req.params;
  const { Message } = req.body;
  const { IsActive } = req.body;

  try {
    const company = await Company.findOne({ companyId, IsDelete: false });

    if (!company) {
      return res.status(404).json({
        statusCode: 404,
        message: "Company not found.",
      });
    }

    // Toggle the IsActive status
    const newStatus = !company.IsActive;

    const updatedCompany = await Company.findOneAndUpdate(
      { companyId, IsDelete: false },
      {
        $set: {
          IsActive: IsActive,
          Message: IsActive === "true" ? null : Message,
          updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        },
      },
      { new: true, runValidators: true }
    );
    const updatedWoker = await Worker.findOneAndUpdate(
      { companyId: updatedCompany.companyId, IsDelete: false },
      {
        $set: {
          IsActive: IsActive,
          updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        },
      },
      { new: true, runValidators: true }
    );
    const updatedCustomer = await Customer.findOneAndUpdate(
      { CompanyId: updatedCompany.companyId, IsDelete: false },
      {
        $set: {
          IsActive: IsActive,
          updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        },
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      statusCode: 200,
      message: `Company ${
        IsActive === "true" ? "activated" : "deactivated"
      } successfully.`,
      data: updatedCompany,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------DELETE DATA----------------------------------------

// Delete Company (Superadmin)
const deleteCompany = async (companyId) => {
  const findCompany = await Company.findOneAndUpdate(
    { companyId, IsDelete: false },
    { $set: { IsDelete: true } },
    { new: true }
  );

  if (findCompany) {
    return {
      statusCode: 200,
      message: "Company deleted successfully",
    };
  } else {
    return {
      statusCode: 204,
      message: "Company not found or already deleted",
    };
  }
};
router.delete("/:companyId", verifyLoginToken, async (req, res) => {
  try {
    const { companyId } = req.params;
    const result = await deleteCompany(companyId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------PASSWORD CHANGE----------------------------------------

// Set New Password and send link in Email
const validateResetToken = async (token) => {
  if (!token) {
    return {
      statusCode: 400,
      message: "Token is required",
    };
  }

  const decryptedData = JSON.parse(
    decryptData(decodeURIComponent(token), secretKey)
  );
  const { email, expiresAt } = decryptedData;

  const currentTime = new Date().getTime();

  if (currentTime > expiresAt) {
    return {
      statusCode: 401,
      message: "Token has expired",
    };
  }

  return {
    statusCode: 200,
    message: "Token is valid",
    data: {
      email,
      expiresAt,
    },
  };
};
router.get("/newpassword_token", async (req, res) => {
  try {
    const { token } = req.query;
    const result = await validateResetToken(token);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

const adminCounts = async (CompanyId) => {
  const quoteCountPromise = Quotes.countDocuments({
    CompanyId,
    IsDelete: false,
    // status: { $ne: "Draft" },
  });
  const contractCountPromise = Contracts.countDocuments({
    CompanyId,
    IsDelete: false,
    // Status: { $ne: "Unscheduled" },
  });
  const invoiceCountPromise = Invoices.countDocuments({
    CompanyId,
    IsDelete: false,
  });
  const visitCountPromise = Customer.countDocuments({
    // WorkerId,
    CompanyId,
    IsDelete: false,
  });

  const [quoteCount, contractCount, invoiceCount, visitCount] =
    await Promise.all([
      quoteCountPromise,
      contractCountPromise,
      invoiceCountPromise,
      visitCountPromise,
    ]);
  return {
    quotes: quoteCount,
    contracts: contractCount,
    invoices: invoiceCount,
    Customer: visitCount,
  };
};

router.get("/admincounts/:CompanyId", async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const counts = await adminCounts(CompanyId);

    res.status(200).json({
      sratusCode: 200,
      message: "admin dashboard counts retrieved successfully",
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

router.put("/change-password/:companyId", async (req, res) => {
  const { Password, confirmpassword } = req.body;
  const { companyId } = req.params;

  try {
    const company = await Company.findOne({ companyId });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    const decryptedPassword = decryptData(company.Password);

    if (Password === decryptedPassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }

    company.Password = encryptData(Password);
    await company.save();

    return res.status(200).json({ message: "Password successfully changed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

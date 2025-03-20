var express = require("express");
var router = express.Router();
const moment = require("moment");
const Worker = require("./model");
const Customer = require("../Customer/model");
const Location = require("../Location/model");
const Company = require("../Company/model");
const Quote = require("../Quote/model");
const Contract = require("../Contract/model");
const Invoice = require("../Invoice/model");
const Visits = require("../Contract/Visits/model");
const Superadmin = require("../../Superadmin/SignupLogin/model");
const WorkerPermission = require("../../Admin/Worker/WorkerPermission/model");
const MailConfig = require("../../Superadmin/MailConfiguration/model");
const Notification = require("../../Notification/model");
const {
  encryptData,
  decryptData,
  createToken,
  verifyToken,
  verifyLoginToken,
} = require("../../../authentication");
const { createResetToken } = require("../ResetPassword/authentication");
const { addNotification } = require("../../Notification/notification");
const secretKey = process.env.SECRET_KEY;
const AppUrl = process.env.REACT_APP;
const emailService = require("../../emailService");
const Activities = require("../ActivitiesModel");
const { handleTemplate } = require("../Template/route");
const { validateWorkerBody, workerValidationSchema } = require("./validation");

//---------------------------POST WORKER--------------------------------------

// Post Worker (Company)
const emailExistsInCollections = async (email, req) => {
  const emailRegex = new RegExp(`^${email}$`, "i");

  const [worker, customer, company, superadmin] = await Promise.all([
    Worker.findOne({ EmailAddress: emailRegex, IsDelete: false }),
    Customer.findOne({ EmailAddress: emailRegex, IsDelete: false }),
    Company.findOne({ EmailAddress: emailRegex, IsDelete: false }),
    Superadmin.findOne({ EmailAddress: emailRegex, IsDelete: false }),
  ]);

  return worker || customer || company || superadmin;
};

router.post(
  "/",
  verifyLoginToken,
  validateWorkerBody(workerValidationSchema),
  async (req, res) => {
    try {
      const { EmailAddress } = req.body;

      const existingEmail = await emailExistsInCollections(EmailAddress, req);

      if (existingEmail) {
        return res.status(202).json({
          statusCode: 202,
          message: "Email Already Exists!",
        });
      }
      const timestamp = Date.now().toString();
      req.body.WorkerId = timestamp;
      req.body.createdAt = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");
      req.body.updatedAt = moment()
        .utcOffset(330)
        .format("YYYY-MM-DD HH:mm:ss");

      req.body.Password = encryptData(req.body.Password, secretKey);

      const createdWorker = await Worker.create(req.body);
      const workerPermissionData = {
        WorkerId: timestamp,
        companyId: req.body.companyId,
        createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        ...req.body.WorkerPermission,
      };

      await WorkerPermission.create(workerPermissionData);
      await sendWelcomeEmailToCustomer(timestamp);

      await addNotification({
        CompanyId: req.body.companyId,
        WorkerId: req.body.WorkerId,
        CreatedBy: "WorkerRole",
        AddedAt: req.body.AddedAt,
      });

      await Activities.create({
        ActivityId: `${Date.now()}`,
        CompanyId: req.CompanyId,
        Action: "CREATE",
        Entity: "Worker",
        EntityId: createdWorker.WorkerId,
        ActivityBy: req.Role,
        ActivityByUsername: req.userName,
        Activity: {
          description: `Created a new Worker ${req.body.FirstName}${req.body.LastName}`,
        },
        Reason: "Worker creation",
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      return res.status(200).json({
        statusCode: 200,
        message: "Staff-member added successfully.",
        data: createdWorker,
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);
//---------------------------POST WORKER MAIL----------------------------------

const sendWelcomeEmailToCustomer = async (WorkerId) => {
  const findCustomer = await Worker.findOne({ WorkerId });

  if (!findCustomer) {
    return { statusCode: 404, message: "Worker Not Found" };
  }

  const findCompany = await Company.findOne({
    companyId: findCustomer.companyId,
  });

  if (!findCompany) {
    return { statusCode: 404, message: "Company Not Found" };
  }

  const resetToken = await createResetToken({
    EmailAddress: findCustomer.EmailAddress,
  });

  const url = `${AppUrl}/auth/new-password?token=${resetToken}`;

  const button = `
    <p>
      <a href="${url}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; border: 1px solid #e88c44; border-radius: 8px; background-color: #e88c44; color: #fff; text-decoration: none; text-align: center; font-size: 15px; font-weight: 500; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
        Set Your Password
      </a>
    </p>
  `;

  const data = [
    {
      FirstName: findCustomer.FirstName || "",
      LastName: findCustomer.LastName || "",
      EmailAddress: findCustomer.EmailAddress || "",
      PhoneNumber: findCustomer.PhoneNumber || "",
      companyName: findCompany.companyName || "",
      EmailAddress: findCompany.EmailAddress || "",
      companyPhoneNumber: findCompany.phoneNumber || "",
      Url: button || "",
    },
  ];

  const defaultSubject ="Welcome to our service";
  const defaultBody = `
  <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #ffffff;">
    <!-- Outer Wrapper -->
    <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border: 1px solid #e88c44;">
      
      <!-- Header Section with Logo -->
      <tr>
        <td style="padding: 20px 0; text-align: center; background-color: #063164; ">
          <div style="display: inline-block; padding: 20px; background-color: white; border-radius: 12px;">
            <img src="https://app.cloudjobmanager.com/cdn/upload/20250213103016_site-logo2.png" alt="CloudJobManager Logo" style="width: 160px; max-width: 100%; display: block; margin: auto;" />
          </div>
        </td>
      </tr>

      <!-- Main Content Section -->
      <tr>
        <td style="padding: 0px 20px; text-align: center; color: #333333; background-color: #ffffff; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
          <h2 style="font-size: 25px; font-weight: 700; color: #063164; margin-bottom: 20px; letter-spacing: 1px;margin-top:20px;">Welcome to ${findCompany.companyName}</h2>
          <p style="font-size: 16px; color: #666666; line-height: 1.6; margin-bottom: 20px; font-weight: 400;">
              Dear ${findCustomer.FullName},<br>
            We are pleased to provide you with your login credentials for accessing our Contract Management System. Below are your details:
          </p>
          <p><strong>Email:</strong> ${findCustomer.EmailAddress}</p>

          <!-- Set Password Button -->
          <p>
            <a href="${url}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; border: 1px solid #e88c44 ; border-radius: 8px; background-color: #e88c44 ; color: #fff; text-decoration: none; text-align: center; font-size: 15px; font-weight: 500; text-transform: uppercase; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
              Set Your Password    
            </a> 
          </p> 
          
          <p style="font-size: 14px; color: #888888; margin-top: 30px; line-height: 1.6;">
            For security reasons, we recommend changing your password upon first login. If you have any questions or need assistance, please do not hesitate to reach out to our support team at <a href="mailto:${findCompany.EmailAddress}" style="color: #063164; font-weight: 600;">${findCompany.EmailAddress}</a> or ${findCompany.phoneNumber}.
          </p>

          <p style="font-size: 14px; color: #888888; margin-top: 30px; font-weight: 400;">
            Thank you for choosing ${findCompany.companyName}. We are committed to providing you with a seamless and efficient experience.
          </p>

          <p style="font-size: 14px; color: #888888; margin-top: 30px; font-weight: 400;">Best regards,<br>The ${findCompany.companyName} Team</p>
        </td>
      </tr>

      <!-- Footer Section -->
      <tr>
        <td style="padding: 30px 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f4f4f7; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;">
          ${findCompany.companyName}, Inc. | All rights reserved.<br>
          <a href="#" style="color: #e88c44; text-decoration: none;">Unsubscribe</a> if you no longer wish to receive these emails.
        </td>
      </tr>
    </table>
  </div>
`;

  const emailStatus = await handleTemplate(
    "Invitation",
    findCustomer.companyId,
    data,
    [],
    defaultSubject,
    defaultBody,
    findCustomer.WorkerId
  );
  if (emailStatus) {
    return {
      statusCode: 200,
      message: `Email was sent to ${findCustomer.EmailAddress}`,
      defaultBody,
    };
  } else {
    return {
      statusCode: 203,
      message: "Issue sending email",
    };
  }
};
router.post("/send_mail/:WorkerId", verifyLoginToken, async (req, res) => {
  try {
    const { WorkerId } = req.params;
    const result = await sendWelcomeEmailToCustomer(WorkerId);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//---------------------------GET WORKER COUNT---------------------------------------

const getWorkerDashboardCounts = async (WorkerId, CompanyId) => {
  const quoteCountPromise = Quote.countDocuments({
    CompanyId,
    IsDelete: false,
    // status: { $ne: "Draft" },
  });
  const contractCountPromise = Contract.countDocuments({
    CompanyId,
    IsDelete: false,
    // Status: { $ne: "Unscheduled" },
  });
  const invoiceCountPromise = Invoice.countDocuments({
    CompanyId,
    IsDelete: false,
  });
  const visitCountPromise = Visits.countDocuments({
    WorkerId,
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
    visits: visitCount,
  };
};
router.get(
  "/worker-dashboard/:WorkerId/:CompanyId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { WorkerId, CompanyId } = req.params;
      const counts = await getWorkerDashboardCounts(WorkerId, CompanyId);

      res.status(200).json({
        statusCode: 200,
        message: "worker dashboard counts retrieved successfully",
        data: counts,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//---------------------------GET WORKER DATA------------------------------------

// const getWorkers = async (
//   companyId,
//   { pageSize, pageNumber, searchQuery, sortField, sortOrder }
// ) => {
//   let query = { IsDelete: false, companyId };

//   if (searchQuery) {
//     query.$or = [
//       { FullName: { $regex: searchQuery, $options: "i" } },
//       { EmailAddress: { $regex: searchQuery, $options: "i" } },
//     ];
//   }

//   let sortOptions = {};
//   if (sortField) {
//     sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
//   }

//   const totalDataCount = await Worker.countDocuments(query);

//   const activeWorkerCount = await Worker.countDocuments({
//     IsActive: true,
//     companyId,
//     IsDelete: false,
//   });

//   const data = await Worker.find(query)
//     .sort(sortOptions)
//     .skip(pageNumber * pageSize)
//     .limit(pageSize);

//   const active = data.filter((item) => item.IsActive);

//   return {
//     statusCode: 200,
//     data,
//     count: totalDataCount,
//     active: activeWorkerCount,
//     activeUsers: active,
//   };
// };
const getWorkers = async (
  companyId,
  { pageSize, pageNumber, searchQuery, sortField, sortOrder }
) => {
  let query = { IsDelete: false, companyId };

  if (searchQuery) {
    const searchParts = searchQuery.split(" ").filter(Boolean);
    const searchConditions = searchParts.map((part) => {
      const searchRegex = new RegExp(part, "i");
      return {
        $or: [
          { FullName: { $regex: searchRegex } },
          { EmailAddress: { $regex: searchRegex } },
        ],
      };
    });

    query.$and = searchConditions;
  }

  const allowedSortFields = [
    "FullName",
    "EmailAddress",
    "createdAt",
    "updatedAt",
  ];
  const sortKey = allowedSortFields.includes(sortField)
    ? sortField
    : "updatedAt";
  const sortOptions = {
    [sortKey]: sortOrder?.toLowerCase() === "asc" ? 1 : -1,
  };

  const totalDataCount = await Worker.countDocuments(query);

  const activeWorkerCount = await Worker.countDocuments({
    IsActive: true,
    companyId,
    IsDelete: false,
  });

  const data = await Worker.find(query)
    .sort(sortOptions)
    .skip(pageNumber * pageSize)
    .limit(pageSize);

  const active = data.filter((item) => item.IsActive);

  return {
    statusCode: data.length > 0 ? 200 : 204,
    data,
    count: totalDataCount,
    active: activeWorkerCount,
    activeUsers: active,
    totalPages: Math.ceil(totalDataCount / pageSize),
    currentPage: pageNumber,
    message:
      data.length > 0 ? "Workers retrieved successfully" : "No workers found",
  };
};

router.get("/:companyId", verifyLoginToken, async (req, res) => {
  const { companyId } = req.params;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const pageNumber = parseInt(req.query.pageNumber) || 0;
  const searchQuery = req.query.search;
  const sortField = req.query.sortField || "updatedAt";
  const sortOrder = req.query.sortOrder || "desc";

  try {
    const result = await getWorkers(companyId, {
      pageSize,
      pageNumber,
      searchQuery,
      sortField,
      sortOrder,
    });
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

// Let me know if you want me to tweak anything else! 🚀

router.get("/:companyId", verifyLoginToken, async (req, res) => {
  const { companyId } = req.params;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const pageNumber = parseInt(req.query.pageNumber) || 0;
  const searchQuery = req.query.search;
  const sortField = req.query.sortField || "updatedAt";
  const sortOrder = req.query.sortOrder || "dsc";

  try {
    const result = await getWorkers(companyId, {
      pageSize,
      pageNumber,
      searchQuery,
      sortField,
      sortOrder,
    });
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//---------------------------PUT WORKER DATA--------------------------------------

// Update Worker (and also update in worker permission) (Company)
const updateWorker = async (workerId, updateData, req) => {
  updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  const {
    EmailAddress,
    Password,
    WorkerPermission: updatedPermissions,
  } = updateData;
  // Find the worker first
  const existingWorker = await Worker.findOne({
    WorkerId: workerId,
    IsDelete: false,
  });

  if (!existingWorker) {
    return {
      statusCode: 404,
      message: "User not found",
    };
  }

  if (EmailAddress) {
    const existingEntities = await Promise.all([
      Company.findOne({ EmailAddress: EmailAddress, IsDelete: false }),
      Superadmin.findOne({
        EmailAddress: EmailAddress,
        IsDelete: false,
      }),
      Customer.findOne({ EmailAddress: EmailAddress, IsDelete: false }),
      Worker.findOne({
        EmailAddress: { $regex: new RegExp(`^${EmailAddress}$`, "i") },
        IsDelete: false,
      }),
    ]);

    const existingEmailAddress = existingEntities.find(
      (entity) => entity && entity.WorkerId !== workerId
    );

    if (existingEmailAddress) {
      return {
        statusCode: 202,
        message: `${EmailAddress} already exists`,
      };
    }
  }

  // Encrypt the password if provided
  if (Password) {
    updateData.Password = encryptData(Password, secretKey);
  }

  // Update the worker
  const workerResult = await Worker.findOneAndUpdate(
    { WorkerId: workerId, IsDelete: false },
    { $set: updateData },
    { new: true }
  );

  if (!workerResult) {
    return {
      statusCode: 404,
      message: "User not found",
    };
  }

  // Update permissions if provided
  if (updatedPermissions) {
    const permissionResult = await WorkerPermission.findOneAndUpdate(
      { WorkerId: workerId },
      { $set: updatedPermissions, updatedAt: updateData.updatedAt },
      { new: true }
    );
    if (!permissionResult) {
      return {
        statusCode: 404,
        message: "Worker permissions not found",
      };
    }
  }
  await Activities.create({
    ActivityId: `${Date.now()}`,
    CompanyId: req.CompanyId,
    Action: "UPDATE",
    Entity: "Worker",
    EntityId: updateData.WorkerId,
    ActivityBy: req.Role,
    ActivityByUsername: req.userName,
    Activity: {
      description: `Updated a Worker ${updateData.FullName}`,
    },
    Reason: "Worker updating",
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  });

  return {
    statusCode: 200,
    message: "User and permissions updated successfully",
  };
};
router.put("/:WorkerId", verifyLoginToken, async (req, res) => {
  const { WorkerId } = req.params;
  const updateData = req.body;

  try {
    const result = await updateWorker(WorkerId, updateData, req);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//---------------------------GET WORKER PROFILE------------------------------------

const getWorkerProfile = async (WorkerId) => {
  const worker = await Worker.findOne({ WorkerId, IsDelete: false });

  let decryptedPassword = null;
  if (worker.Password) {
    try {
      decryptedPassword = decryptData(worker.Password, secretKey);
    } catch (error) {
      console.error("Error decrypting password:", error);
    }
  }
  if (worker) {
    return {
      statusCode: 200,
      message: "Worker profile retrieved successfully",
      data: { ...worker.toObject(), Password: decryptedPassword },
    };
  } else {
    return {
      statusCode: 204,
      message: "No Worker found",
    };
  }
};
router.get("/profile/:WorkerId", verifyLoginToken, async function (req, res) {
  try {
    const { WorkerId } = req.params;
    const response = await getWorkerProfile(WorkerId);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//---------------------------PUT WORKER PROFILE------------------------------------

const updateCustomerProfile = async (WorkerId, updateData) => {
  updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  const { EmailAddress, companyName, Password } = updateData;

  if (Password) {
    const hashedPassword = encryptData(Password, secretKey);
    updateData.Password = hashedPassword;
  }

  const worker = await Worker.findOneAndUpdate(
    { WorkerId, IsDelete: false },
    { $set: updateData },
    { new: true }
  );

  if (!worker) {
    return {
      statusCode: 404,
      message: "Worker not found!",
    };
  }

  if (updateData.products) {
    worker.products = updateData.products;
    await worker.save();
  }

  return {
    statusCode: 200,
    message: "Worker updated successfully",
    data: worker,
  };
};
router.put("/profile/:WorkerId", verifyLoginToken, async (req, res) => {
  try {
    const { WorkerId } = req.params;
    const result = await updateCustomerProfile(WorkerId, req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//----------------------------DELETE WORKER-------------------------------------

// Worker Delete (Company)
const deleteWorker = async (workerId, DeleteReason, req) => {
  const findVisit = await Visits.findOne({
    WorkerId: workerId,
    IsDelete: false,
  });

  if (findVisit) {
    return {
      statusCode: 202,
      message:
        "You can't delete the customer, it's already assigned to a visits",
    };
  }
  const result = await Worker.findOneAndUpdate(
    { WorkerId: workerId, IsDelete: false },
    { $set: { IsDelete: true, DeleteReason } },
    { new: true }
  );

  const updatedNotifications = await Notification.updateMany(
    { WorkerId: workerId },
    { $set: { IsDelete: true } }
  );

  if (!result) {
    return {
      statusCode: 204,
      message: "Worker not found or already deleted!",
    };
  }

  await Activities.create({
    ActivityId: `${Date.now()}`,
    CompanyId: req.CompanyId,
    Action: "DELETE",
    Entity: "Worker",
    EntityId: result.WorkerId,
    ActivityBy: req.Role,
    ActivityByUsername: req.userName,
    Activity: {
      description: `Deleted a Worker ${result.FullName}`,
    },
    Reason: req.body.DeleteReason,
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  });

  return {
    statusCode: 200,
    message: "Worker Deleted!",
  };
};
router.delete("/:WorkerId", verifyLoginToken, async (req, res) => {
  const { WorkerId } = req.params;
  const { DeleteReason } = req.body;

  try {
    const result = await deleteWorker(WorkerId, DeleteReason, req);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//----------------------------GET WORKER DETAILS--------------------------------------

// Pass Workerid and get Worker data with permission
const getWorkerDetails = async (workerId) => {
  const worker = await Worker.findOne({ WorkerId: workerId, IsDelete: false });

  if (worker) {
    const decryptedPassword = decryptData(worker.Password, secretKey);
    worker.Password = decryptedPassword;

    const permissions = await WorkerPermission.findOne({
      WorkerId: workerId,
    }).select(
      "-_id -updatedAt -createdAt -__v -IsDelete -PermissionId -WorkerId -companyId"
    );

    return {
      statusCode: 200,
      message: "Worker data retrieved successfully",
      data: {
        ...worker.toObject(),
        permissions: permissions ? permissions.toObject() : null,
      },
    };
  } else {
    return {
      statusCode: 204,
      message: "No worker found",
    };
  }
};
router.get("/get/:WorkerId", verifyLoginToken, async function (req, res) {
  const { WorkerId } = req.params;

  try {
    const result = await getWorkerDetails(WorkerId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//---------------------------GET ACTIVE USER------------------------------------
const getActiveWorkerStats = async () => {
  const allWorkerCount = await Worker.countDocuments({ IsDelete: false });
  const activeWorkerCount = await Worker.countDocuments({ IsActive: true });

  return {
    statusCode: 200,
    message: "Active worker stats retrieved successfully!",
    AllWorker: allWorkerCount,
    activeWorkerCount,
  };
};
router.get(
  "/activeuser/:companyId",
  verifyLoginToken,
  async function (req, res) {
    try {
      const result = await getActiveWorkerStats();
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

router.put("/change-password/:WorkerId", async (req, res) => {
  const { Password, confirmpassword } = req.body;
  const { WorkerId } = req.params;

  try {
    const company = await Worker.findOne({ WorkerId });
    if (!company) {
      return res.status(404).json({ message: "Worker not found" });
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

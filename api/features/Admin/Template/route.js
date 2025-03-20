var express = require("express");
var router = express.Router();
const moment = require("moment");
var Templates = require("./model");
const Activities = require("../ActivitiesModel");
const EmailLogs = require("../EmailLogs/model");
const Company = require("../Company/model");
const CompanyMail = require("../../Superadmin/CompanyMail/model");
const emailService = require("../../emailService");
const { verifyLoginToken } = require("../../../authentication");
const MailConfig = require("../../Superadmin/MailConfiguration/model");
const MailPreference = require("../../Admin/EmailPreference/model");
const { addNotification } = require("../../Notification/notification");

const createTemplate = async (data, req) => {
  try {
    data["TemplateId"] = Date.now();
    data["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

    const template = await Templates.create(data);

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: template.CompanyId,
      Action: "CREATE",
      Entity: "Template",
      EntityId: template.TemplateId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Created a new Email template for ${template.MailType}`,
      },
      Reason: "Template creation",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    await addNotification({
      CompanyId: data.CompanyId,
      TemplateId: data.TemplateId,
      AddedAt: data.createdAt,
      CreatedBy: "Templates",
    });
    return {
      statusCode: 200,
      message: "Template added successfully.",
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Something went wrong, please try again after sometime.",
      error: error,
    };
  }
};
router.post("/", verifyLoginToken, async (req, res) => {
  try {
    const response = await createTemplate(req.body, req);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong, please try again after sometime.",
      error: error,
    });
  }
});

//-----------------------------GET ALL TEMPLATES BY COMPANYID------------------------------------------------

const getTemplates = async (CompanyId, query) => {
  const pageSize = parseInt(query.pageSize) || 10;
  const pageNumber = parseInt(query.pageNumber) || 0;
  const search = query.search;
  const sortOrder = query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;

  let templateSearchQuery = { CompanyId, IsDelete: false };

  const basePipeline = [{ $match: templateSearchQuery }];

  if (search) {
    const searchParts = search.split(" ").filter(Boolean);
    const searchConditions = searchParts.map((part) => {
      const searchRegex = new RegExp(part, "i");
      return {
        $or: [
          { Name: { $regex: searchRegex } },
          { Subject: { $regex: searchRegex } },
          { Type: { $regex: searchRegex } },
          { MailType: { $regex: searchRegex } },
        ],
      };
    });

    basePipeline.push({
      $match: {
        $and: [templateSearchQuery, { $and: searchConditions }],
      },
    });
  }

  const allowedSortFields = [
    "Name",
    "Subject",
    "Type",
    "MailType",
    "Body",
    "createdAt",
  ];

  const sortField = allowedSortFields.includes(query.sortField)
    ? query.sortField
    : "updatedAt";

  const countPipeline = [...basePipeline, { $count: "totalCount" }];
  const collation = { locale: "en", strength: 2 };

  const sortOptions = {
    [sortField]: sortOrder,
  };

  basePipeline.push({ $sort: sortOptions });
  const mainPipeline = [
    ...basePipeline,
    { $sort: sortOptions },
    { $skip: pageNumber * pageSize },
    { $limit: pageSize },
    {
      $project: {
        TemplateId: 1,
        CompanyId: 1,
        Name: 1,
        Subject: 1,
        Body: 1,
        Type: 1,
        MailType: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  const [countResult, templateData] = await Promise.all([
    Templates.aggregate(countPipeline),
    Templates.aggregate(mainPipeline).collation(collation),
  ]);

  const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  return {
    statusCode: templateData.length > 0 ? 200 : 204,
    data: templateData,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: pageNumber,
    message:
      templateData.length > 0
        ? "Templates retrieved successfully"
        : "No templates found",
  };
};
router.get("/:CompanyId", verifyLoginToken, async (req, res) => {
  const { CompanyId } = req.params;
  const query = req.query;
  query.sortField = query.sortField || "updatedAt";
  query.sortOrder = query.sortOrder || "desc";
  try {
    const result = await getTemplates(CompanyId, query);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-----------------------------GET TEMPLATES BY TEMPLATEID------------------------------------------------

const getTemplate = async (TemplateId, MailType, CompanyId) => {
  try {
    let query = {
      IsDelete: false,
    };

    if (MailType) {
      query.MailType = MailType;
    }

    if (TemplateId) {
      query.TemplateId = TemplateId;
    }

    if (CompanyId) {
      query.CompanyId = CompanyId;
    }

    const template = await Templates.findOne(query).select("-_id -__v");

    if (template) {
      return {
        statusCode: 200,
        template,
      };
    } else {
      return {
        statusCode: 404,
        message: "Template not found.",
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: "Something went wrong, please try again after sometime.",
      error: error,
    };
  }
};
// get template details by TemplateId
router.get("/get/:TemplateId", verifyLoginToken, async (req, res) => {
  try {
    const { TemplateId } = req.params;

    const response = await getTemplate(TemplateId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong, please try again after sometime.",
      error: error,
    });
  }
});

const getOneTemplate = async (TemplateId, MailType, CompanyId) => {
  try {
    let query = {
      IsActive: true,
      IsDelete: false,
    };

    if (MailType) {
      query.MailType = MailType;
    }

    if (TemplateId) {
      query.TemplateId = TemplateId;
    }

    if (CompanyId) {
      query.CompanyId = CompanyId;
    }

    const template = await Templates.findOne(query).select("-_id -__v");

    if (template) {
      return {
        statusCode: 200,
        template,
      };
    } else {
      return {
        statusCode: 404,
        message: "Template not found.",
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: "Something went wrong, please try again after sometime.",
      error: error,
    };
  }
};

router.get("/get/:CompanyId/:MailType", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId, MailType } = req.params;

    const response = await getOneTemplate("", MailType, CompanyId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong, please try again after sometime.",
      error: error,
    });
  }
});

//-----------------------------GET TEMPLATE BY COMPANYID AND MAILTYPE------------------------------------------------

const getSettingTemplate = async (CompanyId) => {
  try {
    let query = {
      IsDelete: false,
    };

    if (CompanyId) {
      query.CompanyId = CompanyId;
    }

    // Fetch templates from the database
    const templates = await Templates.find(query).select(
      "TemplateId Name IsActive CompanyId MailType"
    );

    const mailPreferences = await MailPreference.find({
      CompanyId: query.CompanyId,
    }).select("MailType is_enabled");

    const mailPreferencesArray = {};

    mailPreferences.forEach((pref) => {
      mailPreferencesArray[pref.MailType] = pref.is_enabled;
    });

    // Normalize MailType and group templates
    const groupedTemplates = templates.reduce((acc, template) => {
      const normalizedMailType = template.MailType.toLowerCase();
      if (!acc[normalizedMailType]) {
        acc[normalizedMailType] = [];
      }
      acc[normalizedMailType].push(template);
      return acc;
    }, {});

    // Predefined template categories
    const predefinedTypes = [
      { title: "Invitation" },
      { title: "Reset Password" },
      { title: "Quote" },
      { title: "Contract" },
      { title: "Invoice" },
      { title: "Invoice Payment" },
      { title: "Recurring Payment" },
    ];

    // Normalize predefined types and map templates
    const groupedTemplatesArray = predefinedTypes.map(({ title }) => {
      const normalizedTitle = title.toLowerCase();
      return {
        type: title,
        templates: groupedTemplates[normalizedTitle] || [],
        is_enabled: mailPreferencesArray[title] || false,
      };
    });

    // Return the response based on the result
    if (groupedTemplatesArray.length > 0) {
      return {
        statusCode: 200,
        templates: groupedTemplatesArray,
      };
    } else {
      return {
        statusCode: 404,
        message: "Templates not found.",
      };
    }
  } catch (error) {
    // Handle errors
    return {
      statusCode: 500,
      message: "Something went wrong, please try again after sometime.",
      error: error,
    };
  }
};

// Router to fetch template details by CompanyId
router.get("/settings/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;

    // Get templates for the provided CompanyId
    const response = await getSettingTemplate(CompanyId);
    return res.status(200).json(response);
  } catch (error) {
    // Handle errors
    return res.status(500).json({
      message: "Something went wrong, please try again after sometime.",
      error: error,
    });
  }
});

//-----------------------------UPDATE TEMPLATE BY TEMPLATEID------------------------------------------------

const updateTemplate = async (data, TemplateId, req) => {
  try {
    const existingTemplate = await Templates.findOne({
      TemplateId,
      IsDelete: false,
    });

    if (existingTemplate) {
      const template = await Templates.findOneAndUpdate(
        { TemplateId, IsDelete: false },
        { $set: data },
        { $new: true }
      );

      await Activities.create({
        ActivityId: `${Date.now()}`,
        CompanyId: template.CompanyId,
        Action: "UPDATE",
        Entity: "Template",
        EntityId: template.TemplateId,
        ActivityBy: req.Role,
        ActivityByUsername: req.userName,
        Activity: {
          description: `Updated an Email template for ${template.MailType}`,
        },
        Reason: "Template updating",
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      return {
        statusCode: 200,
        message: "Template updated successfully.",
      };
    } else {
      return {
        statusCode: 404,
        message: "Template not found!",
      };
    }
  } catch (error) {
    console.log(error);

    return {
      statusCode: 500,
      message: "Something went wrong, please try again after sometime.",
      error: error,
    };
  }
};
// update template by TemplateId
router.put("/:TemplateId", verifyLoginToken, async (req, res) => {
  try {
    const { TemplateId } = req.params;

    const response = await updateTemplate(req.body, TemplateId, req);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong, please try again after sometime.",
      error: error,
    });
  }
});

//-----------------------------UPDATE SETTINGS TEMPLATE BY TEMPLATEID------------------------------------------------

const updateSettingTemplate = async (TemplateId, req) => {
  try {
    const existingTemplate = await Templates.findOne({
      CompanyId: { $ne: "" },
      TemplateId,
      IsDelete: false,
    });

    if (existingTemplate) {
      const template = await Templates.findOneAndUpdate(
        { TemplateId: existingTemplate.TemplateId, IsDelete: false },
        { $set: { IsActive: true } },
        { $new: true }
      );

      await Templates.updateMany(
        {
          CompanyId: template.CompanyId,
          MailType: template.MailType,
          TemplateId: { $ne: existingTemplate.TemplateId },
        },
        { IsActive: false }
      );

      await Activities.create({
        ActivityId: `${Date.now()}`,
        CompanyId: template.CompanyId,
        Action: "UPDATE",
        Entity: "Template",
        EntityId: template.TemplateId,
        ActivityBy: req.Role,
        ActivityByUsername: req.userName,
        Activity: {
          description: `Updated an Email template for ${template.MailType}`,
        },
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      return {
        statusCode: 200,
        message: "Template updated successfully.",
      };
    } else {
      return {
        statusCode: 404,
        message: "Template not found!",
      };
    }
  } catch (error) {
    console.log(error);

    return {
      statusCode: 500,
      message: "Something went wrong, please try again after sometime.",
      error: error,
    };
  }
};
// update template by TemplateId
router.put("/settings/:TemplateId", verifyLoginToken, async (req, res) => {
  try {
    const { TemplateId } = req.params;

    const response = await updateSettingTemplate(TemplateId, req);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong, please try again after sometime.",
      error: error,
    });
  }
});

//-----------------------------DELETE TEMPLATE BY TEMPLATEID------------------------------------------------

const deleteTemplate = async (TemplateId, Reason, req) => {
  try {
    const existingTemplate = await Templates.findOne({
      TemplateId,
      IsDelete: false,
    });

    if (existingTemplate) {
      const template = await Templates.findOneAndUpdate(
        { TemplateId, IsDelete: false },
        { $set: { IsDelete: true } },
        { $new: true }
      );

      await Activities.create({
        ActivityId: `${Date.now()}`,
        CompanyId: template.CompanyId,
        Action: "DELETE",
        Entity: "Template",
        EntityId: template.TemplateId,
        ActivityBy: req.Role,
        ActivityByUsername: req.userName,
        Activity: {
          description: `Deleted an Email template for ${template.MailType}`,
        },
        Reason,
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      return {
        statusCode: 200,
        message: "Template deleted successfully.",
      };
    } else {
      return {
        statusCode: 404,
        message: "Template not found!",
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      message: "Something went wrong, please try again after sometime.",
      error: error,
    };
  }
};

// delete template by TemplateId
router.delete("/:TemplateId", verifyLoginToken, async (req, res) => {
  try {
    const { TemplateId } = req.params;
    const Reason = req.body.Reason || "No Reason Provided";

    const response = await deleteTemplate(TemplateId, Reason, req);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong, please try again after sometime.",
      error: error,
    });
  }
});

//----------------------------------------HANDLE TEMPLATE------------------------------------------------

// const handleTemplate = async (
//   type,
//   CompanyId,
//   data,
//   attachments,
//   defaultSubject,
//   defaultBody,
//   CustomerId
// ) => {
//   try {
//     let template = await Templates.findOne({
//       CompanyId: CompanyId,
//       MailType: type,
//       IsActive: true,
//       IsDelete: false,
//     });

//     const body = template?.Body || defaultBody;
//     const subject = template?.Subject || defaultSubject;
//     const EmailId = Date.now();

//     const emailConfig = await CompanyMail.findOne({
//       CompanyId: CompanyId,
//       IsDelete: false,
//     });
//     let responses = { accepted: [], rejected: [], toEmails: [], from: "" };

//     for (const elem of data) {
//       let html = body;
//       Object.keys(elem).forEach((key) => {
//         const regex = new RegExp(`\\$\\{${key}\\}`, "g");
//         html = html.replace(regex, elem[key] || "");
//       });

//       let info;

//       if (emailConfig) {
//         const mailConfig = await MailConfig.findOne({
//           MailConfigurationId: emailConfig.MailConfigurationId,
//         });

//         if (mailConfig) {
//           info = await emailService.sendWelcomeEmail(
//             elem.EmailAddress,
//             subject,
//             html,
//             attachments,
//             EmailId || "",
//             mailConfig.Host,
//             mailConfig.Port,
//             mailConfig.Secure,
//             mailConfig.User,
//             mailConfig.Password,
//             mailConfig.Mail
//           );
//         } else {
//           throw new Error("Mail configuration not found");
//         }
//       } else {
//         info = await emailService.sendWelcomeEmail(
//           elem.EmailAddress,
//           subject,
//           html,
//           attachments || [],
//           EmailId || ""
//         );
//       }

//       const accepted = info?.info?.accepted || [];
//       const rejected = info?.info?.rejected || [];
//       const from = info?.info?.envelope?.from || "";
//       const sendByCompany = CustomerId === "";

//       await EmailLogs.create({
//         EmailId,
//         Accepted: accepted,
//         Rejected: rejected,
//         From: from,
//         To: [elem.EmailAddress],
//         companyId: CompanyId,
//         Subject: subject,
//         Body: html,
//         SendByCompany: sendByCompany,
//         CustomerId,
//       });

//       if (accepted.length > 0) {
//         responses.accepted.push(...accepted);
//       }

//       if (rejected.length > 0) {
//         responses.rejected.push(...rejected);
//       }

//       responses.toEmails.push(elem.EmailAddress);
//       responses.from = from;
//     }

//     return { message: "Emails sent successfully", responses };
//   } catch (error) {
//     console.error("Error fetching template:", error);
//     return { message: "Failed to send emails", error };
//   }
// };

const handleTemplate = async (
  type,
  CompanyId,
  data,
  attachments,
  defaultSubject,
  defaultBody,
  CustomerId
) => {
  try {
    let responses = { accepted: [], rejected: [], toEmails: [], from: "" };

    let mailPreference = await MailPreference.findOne({
      CompanyId: CompanyId,
      MailType: type,
      is_enabled: true,
    });
    // console.log(mailPreference, "mailPreference");
    let template;
    if (mailPreference) {
      template = await Templates.findOne({
        CompanyId: CompanyId,
        MailType: type,
        IsActive: true,
        IsDelete: false,
      });
    }

    if (!template) {
      template = await Templates.findOne({
        MailType: type,
        CompanyId: "",
        IsActive: true,
        IsDelete: false,
      });
    }
    const body = template?.Body || defaultBody;
    let subject = template?.Subject || defaultSubject;
    const EmailId = Date.now();

    const emailConfig = await CompanyMail.findOne({
      CompanyId: CompanyId,
      IsDelete: false,
    });
    for (const elem of data) {
      let html = body;
      let emailSubject = subject;
      Object.keys(elem).forEach((key) => {
        const regex = new RegExp(`\\$\\{${key}\\}`, "g");
        html = html.replace(regex, elem[key] || "");
        emailSubject = emailSubject.replace(regex, elem[key] || "");
      });

      let info;

      if (emailConfig) {
        const mailConfig = await MailConfig.findOne({
          MailConfigurationId: emailConfig.MailConfigurationId,
        });

        if (mailConfig) {
          info = await emailService.sendWelcomeEmail(
            elem.EmailAddress,
            emailSubject,
            html,
            attachments,
            EmailId || "",
            mailConfig.Host,
            mailConfig.Port,
            mailConfig.Secure,
            mailConfig.User,
            mailConfig.Password,
            mailConfig.Mail
          );
        } else {
          throw new Error("Mail configuration not found");
        }
      } else {
        info = await emailService.sendWelcomeEmail(
          elem.EmailAddress,
          emailSubject,
          html,
          attachments || [],
          EmailId || ""
        );
      }

      const accepted = info?.info?.accepted || [];
      const rejected = info?.info?.rejected || [];
      const from = info?.info?.envelope?.from || "";
      const sendByCompany = CustomerId === "";

      await EmailLogs.create({
        EmailId,
        Accepted: accepted,
        Rejected: rejected,
        From: from,
        To: [elem.EmailAddress],
        companyId: CompanyId,
        Subject: emailSubject,
        Body: html,
        SendByCompany: sendByCompany,
        CustomerId,
      });
      if (accepted.length > 0) {
        responses.accepted.push(...accepted);
      }

      if (rejected.length > 0) {
        responses.rejected.push(...rejected);
      }

      responses.toEmails.push(elem.EmailAddress);
      responses.from = from;
    }

    return { message: "Emails sent successfully", responses };
  } catch (error) {
    console.error("Error fetching template:", error);
    return { message: "Failed to send emails", error };
  }
};

module.exports = { router, handleTemplate };

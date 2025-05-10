const Template = require("../../../models/User/Template");
const MailPreference = require("../../../models/User/Mail-Preference");
const MailConfig = require("../../../models/Admin/Mail-Configuration");
const CompanyMail = require("../../../models/Admin/Company-Mail");
const EmailLogs = require("../../../models/User/EmailLogs");
const { addNotification } = require("../../../models/User/AddNotification");
const { logUserEvent } = require("../../../middleware/eventMiddleware");
const emailService = require("../../../Helpers/EmailServices");

// **CREATE TEMPLATE**
exports.createTemplate = async (req, res) => {
    try {
        req.body.CompanyId = Array.isArray(req.user.CompanyId) ? req.user.CompanyId[0] : req.user.CompanyId;

        const template = await Template.create(req.body);

        await addNotification({
            CompanyId: template.CompanyId,
            TemplateId: template.TemplateId,
            AddedAt: template.createdAt,
            CreatedBy: "Templates",
        });

        await logUserEvent(
            template.CompanyId,
            "CREATE",
            "A new template was created.",
            { template }
        );

        return res.status(200).json({
            statusCode: 200,
            message: "Template added successfully.",
            data: template,
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try again later.",
            error: error.message,
        });
    }
};

// **GET TEMPLATE IN COMPANY**
exports.getTemplates = async (req, res) => {
    try {
        const CompanyId = Array.isArray(req.user.CompanyId) ? req.user.CompanyId[0] : req.user.CompanyId;

        const query = req.query;

        query.sortField = query.sortField || "updatedAt";
        query.sortOrder = query.sortOrder || "desc";

        const pageSize = Math.max(parseInt(query.pageSize) || 10, 1);
        const pageNumber = Math.max(parseInt(query.pageNumber) || 0, 0);
        const search = query.search;
        const sortOrder = query.sortOrder.toLowerCase() === "desc" ? -1 : 1;

        let templateSearchQuery = { CompanyId, IsDelete: false };

        const basePipeline = [{ $match: templateSearchQuery }];

        if (search) {
            const searchParts = search.split(" ").filter(Boolean);
            const searchConditions = searchParts.map((part) => ({
                $or: [
                    { Name: { $regex: new RegExp(part, "i") } },
                    { Subject: { $regex: new RegExp(part, "i") } },
                    { Type: { $regex: new RegExp(part, "i") } },
                    { MailType: { $regex: new RegExp(part, "i") } },
                ],
            }));

            basePipeline.push({ $match: { $and: searchConditions } });
        }

        const allowedSortFields = ["Name", "Subject", "Type", "MailType", "Body", "createdAt", "updatedAt"];
        const sortField = allowedSortFields.includes(query.sortField) ? query.sortField : "updatedAt";

        const countPipeline = [...basePipeline, { $count: "totalCount" }];
        const collation = { locale: "en", strength: 2 };

        const sortOptions = { [sortField]: sortOrder };

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
            Template.aggregate(countPipeline),
            Template.aggregate(mainPipeline).collation(collation),
        ]);
        const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

        return res.status(200).json({
            statusCode: 200,
            data: templateData,
            totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
            currentPage: pageNumber,
            message: templateData.length > 0 ? "Templates retrieved successfully" : "No templates found",
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try again later.",
            error: error.message,
        });
    }
};

// **GET TEMPLATE USING TemplateId**
exports.getTemplate = async (req, res) => {
    try {
        const { TemplateId } = req.params;
        const { MailType } = req.query;
        const { CompanyId } = req.user;

        let query = { IsDelete: false, CompanyId };

        if (MailType) {
            query.MailType = MailType;
        }

        if (TemplateId) {
            query.TemplateId = TemplateId;
        }

        const template = await Template.findOne(query).select("-_id -__v");

        if (!template) {
            return res.status(404).json({
                statusCode: 404,
                message: "Template not found.",
            });
        }

        return res.status(200).json({
            statusCode: 200,
            template,
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try again later.",
            error: error.message,
        });
    }
};

// **GET TEMPLATE USING ONE TEMPLETE USING COMPANYID AND MAILTYPE**
exports.getOneTemplate = async (req, res) => {
    try {
        const { CompanyId, MailType } = req.params;

        let query = {
            CompanyId,
            IsActive: true,
            IsDelete: false,
        };

        if (MailType) {
            query.MailType = MailType;
        }

        const template = await Template.findOne(query).select("-_id -__v");

        if (!template) {
            return res.status(404).json({
                statusCode: 404,
                message: "Template not found.",
            });
        }

        return res.status(200).json({
            statusCode: 200,
            template,
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try again later.",
            error: error.message,
        });
    }
};

// **GET SETTING TEMPLATE**
exports.getSettingTemplate = async (req, res) => {
    try {
        const CompanyId = Array.isArray(req.user.CompanyId) ? req.user.CompanyId[0] : req.user.CompanyId;
        let query = {
            IsDelete: false,
        };

        if (CompanyId) {
            query.CompanyId = CompanyId;
        }

        const templates = await Template.find(query).select(
            "TemplateId Name IsActive CompanyId MailType"
        );

        const mailPreferences = await MailPreference.find({
            CompanyId: query.CompanyId,
        }).select("MailType IsEnabled");

        const mailPreferencesArray = {};

        mailPreferences.forEach((pref) => {
            mailPreferencesArray[pref.MailType] = pref.IsEnabled;
        });

        const groupedTemplates = templates.reduce((acc, template) => {
            const normalizedMailType = template.MailType.toLowerCase();
            if (!acc[normalizedMailType]) {
                acc[normalizedMailType] = [];
            }
            acc[normalizedMailType].push(template);
            return acc;
        }, {});

        const predefinedTypes = [
            { title: "Invitation" },
            { title: "Reset Password" },
            { title: "Quote" },
            { title: "Contract" },
            { title: "Invoice" },
            { title: "Invoice Payment" },
            { title: "Recurring Payment" },
        ];

        const groupedTemplatesArray = predefinedTypes.map(({ title }) => {
            const normalizedTitle = title.toLowerCase();
            return {
                type: title,
                templates: groupedTemplates[normalizedTitle] || [],
                IsEnabled: mailPreferencesArray[title] || false,
            };
        });

        if (groupedTemplatesArray.length > 0) {
            return res.status(200).json({
                statusCode: 200,
                templates: groupedTemplatesArray,
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: "Templates not found.",
            });
        }
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try again after sometime.",
            error: error,
        });
    }
};

// **UPDATE TEMPLATE USING TEMPLATEID**
exports.updateTemplate = async (req, res) => {
    try {
        const { TemplateId } = req.params;
        const { CompanyId } = req.user;
        const data = req.body;

        const existingTemplate = await Template.findOne({
            TemplateId,
            CompanyId,
            IsDelete: false,
        });

        if (!existingTemplate) {
            return res.status(404).json({
                statusCode: 404,
                message: "Template not found!",
            });
        }

        const updatedTemplate = await Template.findOneAndUpdate(
            { TemplateId, CompanyId, IsDelete: false },
            { $set: data },
            { new: true }
        );

        await logUserEvent(
            CompanyId,
            "UPDATE",
            `Template ${TemplateId} updated successfully.`,
            { updatedTemplate }
        );

        return res.status(200).json({
            statusCode: 200,
            message: "Template updated successfully.",
            updatedTemplate,
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try again later.",
            error: error.message,
        });
    }
};

// **UPDATE TEMPLATE IN SETTINGS**
exports.updateSettingTemplate = async (req, res) => {
    try {
        const { TemplateId } = req.params;

        const existingTemplate = await Template.findOne({
            CompanyId: { $ne: "" },
            TemplateId,
            IsDelete: false,
        });

        if (existingTemplate) {
            const template = await Template.findOneAndUpdate(
                { TemplateId: existingTemplate.TemplateId, IsDelete: false },
                { $set: { IsActive: true } },
                { $new: true }
            );

            await Template.updateMany(
                {
                    CompanyId: template.CompanyId,
                    MailType: template.MailType,
                    TemplateId: { $ne: existingTemplate.TemplateId },
                },
                { IsActive: false }
            );
            await logUserEvent(
                CompanyId,
                "UPDATE",
                `Template ${TemplateId} updated in settings`,
                { TemplateId, IsActive: true }
            );

            return res.status(200).json({
                statusCode: 200,
                message: "Template updated successfully.",
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: "Template not found!",
            });
        }
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try again after sometime.",
            error: error,
        });
    }
};

// **DELETE TEMPLATE**
exports.deleteTemplate = async (req, res) => {
    try {
        const { TemplateId } = req.params;
        const { CompanyId } = req.user;
        const Reason = req.body.Reason || "No Reason Provided";

        const existingTemplate = await Template.findOne({
            TemplateId,
            IsDelete: false,
        });

        if (existingTemplate) {
            await Template.findOneAndUpdate(
                { TemplateId, IsDelete: false },
                { $set: { IsDelete: true } },
                { new: true }
            );

            await logUserEvent(
                CompanyId,
                "DELETE",
                `Template ${TemplateId} deleted. Reason: ${Reason}`,
                { TemplateId, Reason }
            );

            return res.status(200).json({
                statusCode: 200,
                message: "Template deleted successfully.",
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: "Template not found!",
            });
        }
    } catch (error) {
        console.error("Error deleting template:", error.message);

        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try again after sometime.",
            error: error.message,
        });
    }
};

// **HANDLE TEMPLATE**
exports.handleTemplate = async (
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
            IsEnabled: true,
        });
        let template;
        if (mailPreference) {
            template = await Template.findOne({
                CompanyId: CompanyId,
                MailType: type,
                IsActive: true,
                IsDelete: false,
            });
        }

        if (!template) {
            template = await Template.findOne({
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

const CompanyMail = require("../../../models/Admin/Company-Mail");
const MailConfiguration = require("../../../models/Admin/Mail-Configuration");

// **CREATE COMPANY MAIL**
exports.createCompanyMail = async (req, res) => {
    try {
        const CompanyId = String(req.user.CompanyId);
        const data = req.body;

        if (!CompanyId) {
            return res.status(400).json({ message: "CompanyId is required!" });
        }

        const existingMail = await CompanyMail.findOne({ CompanyId, IsDelete: false });

        if (existingMail) {
            existingMail.IsDelete = true;
            await existingMail.save();
        }

        const newMail = await CompanyMail.create({ ...data, CompanyId });

        return res.status(200).json({
            message: "Company Mail Service Posted Successfully",
            data: newMail,
        });
    } catch (error) {
        console.error("Error creating company mail:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// **GET COMPANY MAIL**
exports.getCompanyMailDetails = async (req, res) => {
    const { CompanyMailId } = req.params;

    let data = [];

    const companyMails = await CompanyMail.find({
        CompanyMailId,
        IsDelete: false,
    });

    for (const companyMail of companyMails) {
        const mailconfiguration = await MailConfiguration.findOne({
            MailConfigurationId: companyMail.MailConfigurationId,
            IsDelete: false,
        });

        data.push({
            host: mailconfiguration.Host,
            user: mailconfiguration.User,
            pass: mailconfiguration.Pass,
            CompanyMailId: companyMail.CompanyMailId,
            MailConfigurationId: companyMail.MailConfigurationId,
        });
    }

    if (data.length === 0) {
        return res.status(404).json({
            statusCode: 404,
            message: `No data found for CompanyMailId: ${CompanyMailId}`,
        });
    }

    return res.status(200).json({
        statusCode: 200,
        message: `All Mail Details fetched successfully`,
        data,
    });
};

// **GET COMPANY MAIL DATA**
exports.getCompanyMail = async (req, res) => {
    const { CompanyId } = req.params;

    let data = [];

    const companyMails = await CompanyMail.find({
        CompanyId,
        IsDelete: false,
    });

    for (const companyMail of companyMails) {
        const mailconfiguration = await MailConfiguration.findOne({
            MailConfigurationId: companyMail.MailConfigurationId,
            IsDelete: false,
        });

        data.push({
            host: mailconfiguration.Host,
            user: mailconfiguration.User,
            pass: mailconfiguration.Pass,
            CompanyId: companyMail.CompanyId,
            MailConfigurationId: companyMail.MailConfigurationId,
        });
    }

    if (data.length === 0) {
        return res.status(404).json({
            statusCode: 404,
            message: `No data found for CompanyId: ${CompanyId}`,
        });
    }

    return res.status(200).json({
        statusCode: 200,
        message: `All Mail Details fetched successfully`,
        data,
    });
};

// **UPDATE COMPANY MAIL DATA**
exports.updateCompanyMailDetails = async (req, res) => {
    const { CompanyMailId } = req.params;
    const updatedItem = req.body;

    const result = await CompanyMail.findOneAndUpdate(
        { CompanyMailId, IsDelete: false },
        updatedItem,
        { new: true }
    );

    if (!result) {
        return res.status(404).json({
            statusCode: 404,
            message: `No Mail Details found with ID: ${CompanyMailId}`,
        });
    }

    return res.status(200).json({
        statusCode: 200,
        message: `Mail Details with ID: ${CompanyMailId} updated successfully`,
        data: result,
    });
};

// **DELETE COMPANY MAIL DATA**
exports.deleteCompanyMailDetails = async (req, res) => {
    const { CompanyMailId } = req.params;

    const data = await CompanyMail.findOneAndUpdate(
        { CompanyMailId },
        { $set: { IsDelete: true } },
        { new: true }
    );

    if (data) {
        return res.status(200).json({
            statusCode: 200,
            message: `Mail Details with ID ${CompanyMailId} deleted successfully`,
            deletedItem: data,
        });
    } else {
        return res.status(404).json({
            statusCode: 404,
            message: `No Mail Details found with ID: ${CompanyMailId}`,
        });
    }
};
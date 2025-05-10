const { sendWelcomeEmail } = require("../../../Helpers/EmailServices");
const { logUserEvent } = require("../../../middleware/eventMiddleware");
const MailConfiguration = require("../../../models/Admin/Mail-Configuration");

//**CREATE MAIL CONFIGURATION**
exports.createMailConfiguration = async (req, res) => {
    try {
        const { CompanyId } = req.user;
        const data = req.body;

        const userToSave = await MailConfiguration.create(data);

        await logUserEvent(
            CompanyId,
            "CREATE",
            "New Mail Configuration Created",
            { userToSave }
        );
        return res.status(200).json({
            statusCode: 200,
            data: userToSave,
            message: "Mail Details Posted Successfully",
        });

    } catch (error) {
        console.error("Error creating mail configuration:", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// **GET MAIL CONFIGURATION**
exports.getMailConfigurationDetails = async (req, res) => {
    const { MailConfigurationId } = req.params;

    const result = await MailConfiguration.findOne({
        MailConfigurationId,
        IsDelete: false,
    });

    if (!result) {
        return res.status(404).json({
            statusCode: 404,
            message: `No Mail Details found for MailConfigurationId: ${MailConfigurationId}`,
        });
    }

    return res.status(200).json({
        statusCode: 200,
        message: `Mail Details fetched successfully`,
        result,
    });
};

// **GET ALL MAIL CONFIGURATION**
exports.getMailConfigurations = async (req, res) => {
    try {
        const result = await MailConfiguration.find({ IsDelete: false });

        if (!result.length) {
            return res.status(404).json({
                statusCode: 404,
                message: "No mail configurations found",
            });
        }

        return res.status(200).json({
            statusCode: 200,
            message: "All mail configurations fetched successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error fetching mail configurations:", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// **UPDATE MAIL CONFIGURATION**
exports.updateMailConfiguration = async (req, res) => {
    try {
        const { MailConfigurationId } = req.params;
        const updateData = req.body;

        const result = await MailConfiguration.findOneAndUpdate(
            { MailConfigurationId, IsDelete: false },
            updateData,
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                statusCode: 404,
                message: "No Mail Details found",
            });
        }

        await logUserEvent(
            "",
            "UPDATE",
            "Mail Configuration Updated",
            { MailConfigurationId }
        );

        return res.status(200).json({
            statusCode: 200,
            message: "Mail Details updated successfully",
            result,
        });
    } catch (error) {
        console.error("Error updating mail configuration:", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Internal server error",
            error: error.message,
        });
    }
};

// **DELETE MAIL CONFIGURATION**
exports.deleteMailConfiguration = async (req, res) => {
    const { MailConfigurationId } = req.params;

    const data = await MailConfiguration.findOneAndUpdate(
        { MailConfigurationId },
        { $set: { IsDelete: true } },
        { new: true }
    );

    if (!data) {
        return res.status(200).json({
            statusCode: 404,
            message: `No Mail Details found`,
        });
    }

    return res.status(200).json({
        statusCode: 200,
        message: `Mail Details deleted successfully`,
        deletedItem: data,
    });
};

// **SEND TEST MAIL**
exports.testMailConfiguration = async (req, res) => {
    const mailConfig = req.body;
    const { ToMail, Host, Port, Secure, User, Password, Mail } = mailConfig;

    const info = await sendWelcomeEmail(
        ToMail,
        "Verification done with CloudJobManager",
        `Hello Sir/Ma'am,\n\n
         Your Mail Configuration is working properly.\n\n
         Best regards,\n
         The CloudJobManager Team`,
        [],
        "",
        Host,
        Number(Port),
        Secure,
        User,
        Password,
        Mail
    );
    await logUserEvent(
        "",
        "UPDATE",
        "Mail Configuration Test Performed",
        { ToMail, Host }
    );
    return res.status(200).json({
        statusCode: 200,
        info,
    });
};
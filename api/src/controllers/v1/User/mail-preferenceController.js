const MailPreference = require("../../../models/User/Mail-Preference");

//**GET ALL MAIL PREFERENCES**
exports.getMailPreference = async (req, res) => {
    const { CompanyId } = req.user;
    try {
        const preferences = await MailPreference.find({ CompanyId: CompanyId });
        res.json(preferences);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch preferences." });
    }
};

//**UPDATE MAIL PREFERENCE**
exports.updateMailPreference = async (req, res) => {
    const { CompanyId, enabledArray } = req.body;
    try {
        const bulkOps = Object.entries(enabledArray).map(([key, IsEnabled]) => ({
            updateOne: {
                filter: { CompanyId: CompanyId, MailType: key },
                update: { $set: { IsEnabled: IsEnabled } },
                upsert: true,
            },
        }));

        const updatedPreferences = await MailPreference.bulkWrite(bulkOps);

        res.json(updatedPreferences);
    } catch (error) {
        res
            .status(500)
            .json({
                error: "Failed to update or create preference.",
                details: error.message,
            });
    }
};
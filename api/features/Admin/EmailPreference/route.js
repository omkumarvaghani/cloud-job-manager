var express = require("express");
var router = express.Router();
const moment = require("moment");
var EmailPreference = require("./model");
const Activities = require("../ActivitiesModel");
const { verifyLoginToken } = require("../../../authentication");

router.get("/:CompanyId", verifyLoginToken, async (req, res) => {
  const { CompanyId } = req.params;
  try {
    const preferences = await EmailPreference.find({ CompanyId: CompanyId });
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch preferences." });
  }
});

router.put("/", verifyLoginToken, async (req, res) => {
  const { CompanyId, enabledArray } = req.body;
  try {
    const bulkOps = Object.entries(enabledArray).map(([key, is_enabled]) => ({
      updateOne: {
        filter: { CompanyId: CompanyId, MailType: key },
        update: { $set: { is_enabled: is_enabled } },
        upsert: true,
      },
    }));

    const updatedPreferences = await EmailPreference.bulkWrite(bulkOps);

    res.json(updatedPreferences);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to update or create preference.",
        details: error.message,
      });
  }
});

module.exports = router;

var express = require("express");
var router = express.Router();
const moment = require("moment");
const MailConfiguration = require("../MailConfiguration/model");
const { sendWelcomeEmail } = require("../../emailService");
const { verifyLoginToken } = require("../../../authentication");

const createMailConfiguration = async (body) => {
  const timestamp = Date.now();
  const uniqueId = `${timestamp}`;

  body["MailConfigurationId"] = uniqueId;
  body["createdAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  body["updatedAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  const userToSave = await MailConfiguration.create(body);

  return {
    statusCode: 201,
    data: userToSave,
    message: "Mail Details Posted Successfully",
  };
};
router.post("/", verifyLoginToken, async (req, res) => {
  try {
    const result = await createMailConfiguration(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

const getMailConfigurationDetails = async (MailConfigurationId) => {
  const result = await MailConfiguration.findOne({
    MailConfigurationId,
    IsDelete: false,
  });

  if (!result) {
    return {
      statusCode: 404,
      message: `No Mail Details found for MailConfigurationId: ${MailConfigurationId}`,
    };
  }

  return {
    statusCode: 200,
    message: `Mail Details fetched successfully`,
    result,
  };
};
router.get("/:MailConfigurationId", verifyLoginToken, async (req, res) => {
  try {
    const { MailConfigurationId } = req.params;
    const result = await getMailConfigurationDetails(MailConfigurationId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

const getMailConfigurations = async () => {
  const result = await MailConfiguration.find({ IsDelete: false });

  if (!result.length) {
    return {
      statusCode: 404,
      message: "No data found",
    };
  }

  return {
    statusCode: 200,
    message: "All Mail Details fetched successfully",
    result,
  };
};
router.get("/", verifyLoginToken, async (req, res) => {
  try {
    const result = await getMailConfigurations();
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

const updateMailConfiguration = async (MailConfigurationId, updateData) => {
  // updateData["updatedAt"] = moment()
  //   .utcOffset(330)
  //   .format("YYYY-MM-DD HH:mm:ss");

  const result = await MailConfiguration.findOneAndUpdate(
    { MailConfigurationId, IsDelete: false },
    updateData,
    { new: true }
  );

  if (!result) {
    return {
      statusCode: 404,
      message: `No Mail Details found`,
    };
  }

  return {
    statusCode: 200,
    message: `Mail Details updated successfully`,
    result,
  };
};
router.put("/:MailConfigurationId", verifyLoginToken, async (req, res) => {
  try {
    const { MailConfigurationId } = req.params;
    const updateData = req.body;

    const result = await updateMailConfiguration(
      MailConfigurationId,
      updateData
    );

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

const deleteMailConfiguration = async (MailConfigurationId) => {
  const data = await MailConfiguration.findOneAndUpdate(
    { MailConfigurationId },
    { $set: { IsDelete: true } },
    { new: true }
  );

  if (!data) {
    return {
      statusCode: 404,
      message: `No Mail Details found`,
    };
  }

  return {
    statusCode: 200,
    message: `Mail Details deleted successfully`,
    deletedItem: data,
  };
};
router.delete("/:MailConfigurationId", verifyLoginToken, async (req, res) => {
  try {
    const { MailConfigurationId } = req.params;
    const result = await deleteMailConfiguration(MailConfigurationId);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

const testMailConfiguration = async (mailConfig) => {
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
  return {
    statusCode: 200,
    info,
  };
};
router.post("/test_mail", verifyLoginToken, async (req, res) => {
  try {
    const result = await testMailConfiguration(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

module.exports = router;

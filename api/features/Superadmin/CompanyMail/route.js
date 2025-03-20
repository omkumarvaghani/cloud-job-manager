var express = require("express");
var router = express.Router();
const moment = require("moment");
const CompanyMail = require("../CompanyMail/model");
const MailConfiguration = require("../MailConfiguration/model");
const {
  encryptData,
  decryptData,
  createToken,
  verifyToken,
  verifyLoginToken,
} = require("../../../authentication");

const createCompanyMail = async (body) => {
  const timestamp = Date.now();
  const uniqueId = `${timestamp}`;

  body["CompanyMailId"] = uniqueId;
  body["createdAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  body["updatedAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  const existingMail = await CompanyMail.findOne({ CompanyId: body.CompanyId, IsDelete: false });

  if (existingMail) {
    existingMail.IsDelete = true;
    await existingMail.save(); 
  }

  const userToSave = await CompanyMail.create(body);

  return {
    statusCode: 200,
    message: "Company Mail Service Posted Successfully",
    data: userToSave,
  };
};

router.post("/", verifyLoginToken, async (req, res) => {
  try {
    const result = await createCompanyMail(req.body);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message); 
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------GET MAIL DATA------------------------------------------

const getCompanyMailDetails = async (CompanyMailId) => {
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
    return {
      statusCode: 404,
      message: `No data found for CompanyMailId: ${CompanyMailId}`,
    };
  }

  return {
    statusCode: 200,
    message: `All Mail Details fetched successfully`,
    data,
  };
};
router.get("/:CompanyMailId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyMailId } = req.params;

    const result = await getCompanyMailDetails(CompanyMailId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------GET COMPANY MAIL DATA------------------------------------------

const getCompanyMail = async (CompanyId) => {
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
    return {
      statusCode: 404,
      message: `No data found for CompanyId: ${CompanyId}`,
    };
  }

  return {
    statusCode: 200,
    message: `All Mail Details fetched successfully`,
    data,
  };
};
router.get("/company/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;

    const result = await getCompanyMail(CompanyId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//--------------------------PUT MAIL DATA------------------------------------

const updateCompanyMailDetails = async (CompanyMailId, updatedItem) => {
  updatedItem["updatedAt"] = moment()
    .utcOffset(330)
    .format("YYYY-MM-DD HH:mm:ss");

  const result = await CompanyMail.findOneAndUpdate(
    { CompanyMailId, IsDelete: false },
    updatedItem,
    { new: true }
  );

  if (!result) {
    return {
      statusCode: 404,
      message: `No Mail Details found with ID: ${CompanyMailId}`,
    };
  }

  return {
    statusCode: 200,
    message: `Mail Details with ID: ${CompanyMailId} updated successfully`,
    data: result,
  };
};
router.put("/update_company_mail_details/:CompanyMailId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { CompanyMailId } = req.params;
      const updatedItem = req.body;

      const result = await updateCompanyMailDetails(CompanyMailId, updatedItem);
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

//--------------------------DELETE MAIL DATA--------------------------------------

const deleteCompanyMailDetails = async (CompanyMailId) => {
  const data = await CompanyMail.findOneAndUpdate(
    { CompanyMailId },
    { $set: { IsDelete: true } },
    { new: true }
  );

  if (data) {
    return {
      statusCode: 200,
      message: `Mail Details with ID ${CompanyMailId} deleted successfully`,
      deletedItem: data,
    };
  } else {
    return {
      statusCode: 404,
      message: `No Mail Details found with ID: ${CompanyMailId}`,
    };
  }
};
router.delete(
  "/delete_company_mail_details/:CompanyMailId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { CompanyMailId } = req.params;

      const result = await deleteCompanyMailDetails(CompanyMailId);
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

module.exports = router;

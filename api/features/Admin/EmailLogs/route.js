var express = require("express");
var router = express.Router();
const crypto = require("crypto");
const moment = require("moment");
const EmailLogs = require("../EmailLogs/model");
const Customer = require("../Customer/model");
const Company = require("../Company/model");
const { handleTemplate } = require("../Template/route");
const { verifyLoginToken } = require("../../../authentication");

const decrypt = (text) => {
  if (!text) return "";
  const decipher = crypto.createDecipher("aes-256-cbc", "krushil");
  let decrypted = decipher.update(text, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};

//-----------------------------GET EMAIL-LOG TABLE-------------------------------------------

router.get("/", async (req, res) => {
  try {
    const { EmailId, To } = req.query;
    const emailLog = await EmailLogs.findOne({
      EmailId,
      "Opens.OpenedBy": To,
    });

    if (!emailLog) {
      await EmailLogs.findOneAndUpdate(
        { EmailId, "Opens.OpenedBy": { $ne: To } },
        { $push: { Opens: { OpenedBy: To, OpenedAt: Date.now() } } }
      );
    }

    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgMBApPChTYAAAAASUVORK5CYII=",
      "base64"
    );

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": pixel.length,
    });

    res.end(pixel);
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again after sometime!",
    });
  }
});

//-----------------------------POST SEND EMAIL-LOG------------------------------------------------

router.post("/", async (req, res) => {
  try {
    const { Subject, Body, CompanyId, customers } = req.body;

    if (customers?.length > 0) {
      const company = await Company.findOne({
        companyId: CompanyId,
        IsDelete: false,
      });
      if (!company) {
        console.error(`Company not found for CompanyId: ${CompanyId}`);
        return res.status(404).json({
          statusCode: 404,
          message: `No company found for CompanyId: ${CompanyId}`,
        });
      }

      const emailPromises = customers.map(async (CustomerId) => {
        const customer = await Customer.findOne({
          CustomerId,
          CompanyId,
          IsDelete: false,
        });

        if (!customer) {
          console.warn(`Customer not found for CustomerId: ${CustomerId}`);
          return null;
        }

        let decryptedPassword = "";
        try {
          decryptedPassword = decrypt(customer?.Password || "");
        } catch (error) {
          console.error("Decryption failed:", error.message);
          decryptedPassword = "Invalid Password";
        }

        return {
          Name: `${customer?.FirstName || ""} ${customer?.LastName || ""}`,
          EmailAddress: customer?.EmailAddress,
          companyName: company.companyName,
          email: customer?.EmailAddress,
          Password: decryptedPassword,
          Url: `<a href="https://app.cloudjobmanager.com/auth/login" target="_blank">Click Here</a>`,
        };
      });

      const new_mails = (await Promise.all(emailPromises)).filter(Boolean);

      if (new_mails.length === 0) {
        return res.status(204).json({
          statusCode: 204,
          message: "No valid customers found",
        });
      }

      await handleTemplate(
        "",
        CompanyId,
        new_mails,
        [],
        Subject,
        Body,
        (CustomerId = "")
      );

      return res.status(200).json({
        statusCode: 200,
        message: "Emails sent successfully",
      });
    } else {
      return res.status(204).json({
        statusCode: 204,
        message: "No customers selected",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later!",
      error: error.message,
    });
  }
});

//-----------------------------GET SEND EMAIL-LOG-------------------------------------------------

const getSendEmailLogs = async (companyId, query) => {
  const pageSize = Math.max(1, parseInt(query.pageSize) || 10);
  const pageNumber = Math.max(0, parseInt(query.pageNumber) || 0);
  const search = query.search || "";

  const filter = {
    companyId,
    IsDelete: false,
    SendByCompany: true,
  };

  if (search) {
    const searchParts = search.split(" ").filter(Boolean);
    const searchConditions = searchParts.map((part) => ({
      $or: [
        { From: { $regex: new RegExp(part, "i") } },
        { Subject: { $regex: new RegExp(part, "i") } },
        { To: { $elemMatch: { $regex: new RegExp(part, "i") } } },
      ],
    }));

    filter.$and = searchConditions;
  }

  const skip = pageNumber * pageSize;

  try {
    const totalCount = await EmailLogs.countDocuments(filter);

    const emailLogs = await EmailLogs.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    return {
      statusCode: emailLogs.length > 0 ? 200 : 204,
      emails: emailLogs,
      totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      message:
        emailLogs.length > 0
          ? "Email logs retrieved successfully"
          : "No emails found.",
    };
  } catch (error) {
    console.error("Error in getEmailLogs function:", error);
    throw new Error("Failed to retrieve email logs.");
  }
};

router.get("/:companyId", verifyLoginToken, async (req, res) => {
  try {
    const { companyId } = req.params;
    const query = req.query;

    const result = await getSendEmailLogs(companyId, query);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error("Error in /logs API:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later!",
    });
  }
});

//-----------------------------GET EMAIL-LOG-------------------------------------------------

const getEmailLogs = async (companyId, query) => {
  const pageSize = Math.max(1, parseInt(query.pageSize) || 10);
  const pageNumber = Math.max(0, parseInt(query.pageNumber) || 0);
  const search = query.search || "";
  const sortOrder = query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;

  // let customerSearchQuery = { CompanyId, IsDelete: false };

  const allowedSortFields = [
    "FirstName",
    "LastName",
    "Subject",
    "Body",
    "email",
    "OpenedAt",
    "createdAt",
  ];

  const sortField = allowedSortFields.includes(query.sortField)
    ? query.sortField
    : "updatedAt";

  const templateSearchQuery = {
    companyId,
    IsDelete: false,
    SendByCompany: false,
  };

  if (search) {
    const searchParts = search.split(" ").filter(Boolean);
    const searchConditions = searchParts.map((part) => ({
      $or: [
        { From: { $regex: new RegExp(part, "i") } },
        { "To.email": { $regex: new RegExp(part, "i") } },
        { Subject: { $regex: new RegExp(part, "i") } },
      ],
    }));

    templateSearchQuery.$and = searchConditions;
  }

  let sortOptions = {};
  if (sortField) {
    sortOptions[sortField] = sortOrder;
  }

  const collation = { locale: "en", strength: 2 };

  const basePipeline = [{ $match: templateSearchQuery }];

  const countPipeline = [...basePipeline, { $count: "totalCount" }];

  const mainPipeline = [
    ...basePipeline,
    {
      $lookup: {
        from: "customers",
        localField: "CustomerId",
        foreignField: "CustomerId",
        as: "customerData",
      },
    },
    { $unwind: { path: "$customerData" } },
    {
      $addFields: {
        FirstName: "$customerData.FirstName",
        LastName: "$customerData.LastName",
      },
    },
    // {
    //   $project: {
    //     FirstName: 1,
    //     LastName: 1,
    //     customerData: 0,
    //   },
    // },
    { $sort: { createdAt: -1 } },
    { $skip: pageNumber * pageSize },
    { $sort: sortOptions },
    { $limit: pageSize },
  ];

  try {
    const [countResult, emailLogs] = await Promise.all([
      EmailLogs.aggregate(countPipeline),
      EmailLogs.aggregate(mainPipeline).collation(collation),
    ]);

    const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

    const formattedLogs = emailLogs.flatMap((log) => {
      const { To, Accepted, Opens, customerData } = log;

      return To.map((email) => {
        const isAccepted =
          Array.isArray(Accepted) && Accepted.some((open) => open === email);
        const isOpened =
          Array.isArray(Opens) && Opens.some((open) => open.OpenedBy === email);

        const openedAt = isOpened
          ? Opens.find((open) => open.OpenedBy === email)?.OpenedAt
          : null;

        return {
          EmailId: log.EmailId,
          Subject: log.Subject,
          Body: log.Body,
          createdAt: log.createdAt,
          From: log.From,
          email,
          isAccepted,
          isOpened,
          openedAt,
          FirstName: customerData?.FirstName || null,
          LastName: customerData?.LastName || null,
        };
      });
    });

    return {
      statusCode: emailLogs.length > 0 ? 200 : 204,
      emails: formattedLogs,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: pageNumber,
      message:
        emailLogs.length > 0
          ? "Email logs retrieved successfully"
          : "No emails found.",
    };
  } catch (error) {
    console.error("Error in getEmailLogs function:", error);
    // throw new Error("Failed to retrieve email logs.");
  }
};

router.get("/logs/:companyId", verifyLoginToken, async (req, res) => {
  try {
    const { companyId } = req.params;
    const query = req.query;
    query.sortField = query.sortField || "updatedAt";
    query.sortOrder = query.sortOrder || "desc";
    const result = await getEmailLogs(companyId, query);

    return res.status(result?.statusCode).json(result);
  } catch (error) {
    console.error("Error in /logs API:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later!",
    });
  }
});

//-----------------------------DELETE EMAIL-LOG----------------------------------------------

router.delete("/:EmailId", verifyLoginToken, async (req, res) => {
  try {
    const { EmailId } = req.params;
    const emailLog = await EmailLogs.findOneAndUpdate(
      { EmailId, IsDelete: false },
      { $set: { IsDelete: true } }
    );
    if (emailLog) {
      res.status(200).json({
        statusCode: 200,
        message: "E-mail history is deleted.",
      });
    } else {
      res.status(200).json({
        statusCode: 204,
        message: "E-mail history is not found!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again after sometime!",
    });
  }
});

module.exports = router;

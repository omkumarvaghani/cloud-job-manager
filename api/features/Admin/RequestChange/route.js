var express = require("express");
var router = express.Router();
const moment = require("moment");
const { verifyLoginToken } = require("../../../authentication");
const RequestChange = require("./model");
const Quote = require("../Quote/model");
const Notification = require("../../Notification/model");
const { addNotification } = require("../../Notification/notification");
const Activities = require("../ActivitiesModel");
const Customer = require("../Customer/model");
const Company = require("../Company/model");
const { createResetToken } = require("../ResetPassword/authentication");
const { handleTemplate } = require("../Template/route");
const AppUrl = process.env.REACT_APP; 

//-------------------------------POST DATA----------------------------------------

const createRequestChange = async (data, req) => {
  const RequestChangeId = Date.now();
  const uniqueId = `${RequestChangeId}`;
  data["RequestChangeId"] = uniqueId;

  // Get the current date and time
  const currentDateTime = moment().format("YYYY-MM-DD HH:mm:ss");

  // Ensure that RequestMessage is structured with a message and Date
  const requestMessage = {
    message: data.RequestMessage, // assuming RequestMessage is a string
    Date: currentDateTime, // Add the timestamp
  };

  try {
    // Add request change with the updated message (array containing message + date)
    const createRequest = await RequestChange.create({
      ...data,
      RequestMessage: [requestMessage], // Array of messages with timestamp
    });

    const updatedQuote = await Quote.findOneAndUpdate(
      { QuoteId: data.QuoteId },
      { status: "Request changed" },
      { new: true }
    );

    if (!updatedQuote) {
      throw new Error("Quote not found, unable to update status.");
    }

    await addNotification({
      CompanyId: data.CompanyId,
      QuoteId: data.QuoteId,
      RequestChangeId: uniqueId,
      CustomerId: data.CustomerId,
      CreatedBy: "customer",
      AddedAt: data.AddedAt,
    });

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: data.CompanyId,
      Action: "CREATE",
      Entity: "Request change by customer",
      EntityId: data.RequestChangeId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Created a request change message: #${data.RequestMessage}`,
      },
      Reason: "Request change creation",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });
    return {
      statusCode: 200,
      message: "Request change successfully.",
      data: createRequest,
      updatedQuote,
    };
  } catch (error) {
    return {
      statusCode: 400,
      message: "Failed to create Request or update quote status.",
      error: error.message,
    };
  }
};

router.post("/", verifyLoginToken, async (req, res) => {
  try {
    const response = await createRequestChange(req.body, req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------GET DATA----------------------------------------

const getRequestData = async (QuoteId, CompanyId) => {
  // data["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

  if (!QuoteId || !CompanyId) {
    return {
      statusCode: 400,
      message: "QuoteId and CompanyId are required!",
    };
  }

  const pipeline = [
    {
      $match: {
        QuoteId: QuoteId,
        CompanyId: CompanyId,
        IsDelete: false,
      },
    },
    {
      $group: {
        _id: "$QuoteId",

        RequestMessages: { $push: "$RequestMessage" },
      },
    },
    {
      $project: {
        _id: 0,
        QuoteId: "$_id",
        createdAt: { $first: "$createdAt" },
        RequestMessages: {
          $reduce: {
            input: "$RequestMessages",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    },
  ];

  const result = await RequestChange.aggregate(pipeline);
  if (!result || result.length === 0) {
    return {
      statusCode: 404,
      message: "No data found for the given QuoteId and CompanyId.",
    };
  }

  return {
    statusCode: 200,
    data: result[0],
    message: "Data retrieved successfully.",
  };
};

router.get("/:QuoteId/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { QuoteId, CompanyId } = req.params;
    const result = await getRequestData(QuoteId, CompanyId);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});



module.exports = router;

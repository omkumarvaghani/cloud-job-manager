const express = require("express");
const router = express.Router();
const DropboxSign = require("@dropbox/sign");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const moment = require("moment");
const { createWriteStream } = require("fs");
const SignatureRequest = require("./model");
const Activities = require("../ActivitiesModel");
const { verifyLoginToken } = require("../../../authentication");
const { addNotification } = require("../../Notification/notification");

const signatureRequestApi = new DropboxSign.SignatureRequestApi();
signatureRequestApi.username = process.env.DROPBOX_API_KEY;

//-------------------------------POST DATA----------------------------------------

const createSignatureRequest = async (data, req) => {

  const signers = data.signers.map((signer, index) => ({
    emailAddress: signer.email,
    name: signer.name,
    order: index,
  }));
  // data["createdAt"]: moment().format("YYYY-MM-DD HH:mm:ss")

  const fileUrls = data.fileUrls || [];

  try {

    const requestData = {
      title: Array.isArray(data.title)
        ? data.title.join(" ")
        : data.title || "Agreement",
      subject: Array.isArray(data.subject)
        ? data.subject.join(" ")
        : data.subject || "Please sign the agreement",
      message: Array.isArray(data.message)
        ? data.message.join(" ")
        : data.message || "Please review and sign the document",
      signers,
      fileUrls: data.fileUrls || [],
      metadata: data.metadata || {},
      testMode: true,
    };


    const result = await signatureRequestApi.signatureRequestSend(requestData);
    const responseData = result.body.signatureRequest;


    const signatureRequestData = {
      title: responseData.title,
      originalTitle: responseData.originalTitle,
      subject: responseData.subject,
      message: responseData.message,
      signatureRequestId: responseData.signatureRequestId,
      requesterEmailAddress: responseData.requesterEmailAddress,
      metadata: responseData.metadata,
      createdAt: new Date(responseData.createdAt * 1000),
      expiresAt: responseData.expiresAt
        ? new Date(responseData.expiresAt * 1000)
        : null,
      isComplete: responseData.isComplete,
      isDeclined: responseData.isDeclined,
      filesUrl: responseData.filesUrl,
      filePath: responseData.filePath,
      signingUrl: responseData.signingUrl,
      detailsUrl: responseData.detailsUrl,
      ContractId: data.ContractId,
      InvoiceId: data.InvoiceId,
      QuoteId: data.QuoteId,
      CompanyId: data.CompanyId,
      signers: data.signers || [],
    };

    const signatureRequest = await SignatureRequest.create(
      signatureRequestData
    );

    // await Activities.create({
    //   ActivityId: `${Date.now()}`,
    //   CompanyId: data.CompanyId,
    //   Action: "CREATE",
    //   Entity: "Dropbox Signature Request",
    //   EntityId: data.ContractId,
    //   ActivityBy: req.Role,
    //   ActivityByUsername: req.userName,
    //   Activity: {
    //     description: `Created a Signature Request Using Dropbox`,
    //   },
    //   Reason: "Signature Request Creation",
    //   createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    //   updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    // });
    const activityData = {
      ActivityId: `${Date.now()}`,
      CompanyId: data.CompanyId,
      Action: "CREATE",
      Entity: "",
      EntityId: "",
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: "",
      },
      Reason: "",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    // Extracting the first signer's name from requestData
    const signerName = requestData?.signers?.[0]?.name || "Unknown";

    if (data.QuoteId) {
      activityData.Entity = "Dropbox Signature Request for Quote";
      activityData.EntityId = data.QuoteId;
      activityData.Activity.description = `Created a Signature Request for Quote Using Dropbox For '${signerName}'`;
      activityData.Reason = "Quote Signature Request Creation";
    } else if (data.ContractId) {
      activityData.Entity = "Dropbox Signature Request for Contract";
      activityData.EntityId = data.ContractId;
      activityData.Activity.description = `Created a Signature Request for Contract Using Dropbox For '${signerName}'`;
      activityData.Reason = "Contract Signature Request Creation";
    } else if (data.InvoiceId) {
      activityData.Entity = "Dropbox Signature Request for Invoice";
      activityData.EntityId = data.InvoiceId;
      activityData.Activity.description = `Created a Signature Request for Invoice Using Dropbox For '${signerName}'`;
      activityData.Reason = "Invoice Signature Request Creation";
    } else {
      throw new Error("Activity cannot be created.");
    }

    await Activities.create(activityData);

    await addNotification({
      signatureRequestId: responseData.signatureRequestId,
      CompanyId: data.CompanyId,
      ContractId: data.ContractId,
      InvoiceId: data.InvoiceId,
      QuoteId: data.QuoteId,
      // CustomerId:responseData.CustomerId,
      AddedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      // AddedAt: responseData.AddedAt,
      CreatedBy: "Signature",
    });  
    return {
      statusCode: 200,
      message: "Signature request created successfully.",
      data: signatureRequest,
    };
  } catch (error) {
    console.error("Error occurred:", error);
    return {
      statusCode: 400,
      message: "Failed to create signature request.",
      error: error.response?.data?.error?.message || error.message,
    };
  }
};
                   
router.post("/signature_request/send", verifyLoginToken, async (req, res) => {
  try {
    const response = await createSignatureRequest(req.body, req);

    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------GET PDF----------------------------------------

const getSignatureRequestDetails = async (signatureRequestId) => {
  try {
    const response = await signatureRequestApi.signatureRequestGet(
      signatureRequestId
    );

    return {
      statusCode: 200,
      message: "Signature request details retrieved successfully.",
      data: response.body,
    };
  } catch (error) {
    console.error(
      "Error fetching signature request:",
      error.response?.body || error.message
    );
    return {
      statusCode: 400,
      message: "Failed to retrieve signature request.",
      error: error.response?.body || error.message,
    };
  }
};

router.get("/signature_request/list/:signatureRequestId",verifyLoginToken, async (req, res) => {
  const { signatureRequestId } = req.params;

  const result = await getSignatureRequestDetails(signatureRequestId);
  res.status(result.statusCode).json(result);
});

//-------------------------------GET URL PDF----------------------------------------

const getDropboxFileUrl = async (signatureRequestId) => {
  try {
    const response = await signatureRequestApi.signatureRequestFilesAsFileUrl(
      signatureRequestId
    );

    return {
      success: true,
      fileUrl: response.body.fileUrl,
    };
  } catch (error) {
    console.error(
      "Error fetching file URL for SignatureRequestId:",
      signatureRequestId,
      error.message
    );
    return {
      success: false,
      error: error.response?.body || error.message,
    };
  }
};

router.get(
  "/signature_request/files_as_file_url/:signatureRequestId",verifyLoginToken,
  async (req, res) => {
    const { signatureRequestId } = req.params;

    const result = await getDropboxFileUrl(signatureRequestId);

    if (result.success) {
      res.status(200).json({
        statusCode: 200,
        message: "File URL retrieved successfully.",
        fileUrl: result.fileUrl,
      });
    } else {
      res.status(400).json({
        statusCode: 400,
        message: "Failed to retrieve file URL.",
        error: result.error,
      });
    }
  }
);

// -------------------------------GET PDF----------------------------------------

const getFileDataUri = async (signatureRequestId) => {
  try {
    const response = await signatureRequestApi.signatureRequestFilesAsDataUri(
      signatureRequestId
    );
    return {
      success: true,
      fileDataUri: response.body,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.body || error.message,
    };
  }
};

router.get(
  "/signature_request/files_as_data_uri/:signatureRequestId",verifyLoginToken,
  async (req, res) => {
    const { signatureRequestId } = req.params;
    const result = await getFileDataUri(signatureRequestId);

    if (result.success) {
      res.status(200).json({
        statusCode: 200,
        message: "File Data URI retrieved successfully.",
        fileDataUri: result.fileDataUri,
      });
    } else {
      res.status(400).json({
        statusCode: 400,
        message: "Failed to retrieve file Data URI.",
        error: result.error,
      });
    }
  }
);

//-------------------------------DELETE SIGNATURE----------------------------------------
// router.delete(
//   "/delete/:signatureRequestId",
//   verifyLoginToken,
//   async (req, res) => {
//     const { signatureRequestId } = req.params;

//     if (!signatureRequestId) {
//       return res.status(400).json({
//         statusCode: 400,
//         message: "signatureRequestId is required!",
//       });
//     }

//     try {
//       const signatureRequest = await SignatureRequest.findOne({
//         signatureRequestId,
//       });

//       if (!signatureRequest) {
//         return res.status(404).json({
//           statusCode: 404,
//           message: "Dropbox file not found with the given signatureRequestId!",
//         });
//       }

//       const result = await SignatureRequest.updateOne(
//         { signatureRequestId },
//         { $set: { IsDeleted: true } }
//       );

//       if (result.matchedCount === 0) {
//         return res.status(404).json({
//           statusCode: 404,
//           message: "Dropbox file not found with the given signatureRequestId!",
//         });
//       }

//       const data = {
//         CompanyId: signatureRequest.CompanyId,
//         QuoteId: signatureRequest.QuoteId,
//         ContractId: signatureRequest.ContractId,
//         InvoiceId: signatureRequest.InvoiceId,
//       };
//       const signerName =
//         signatureRequest.signers.length > 0
//           ? signatureRequest.signers[0].name
//           : "Unknown Signer";

//       const activityData = {
//         ActivityId: `${Date.now()}`,
//         CompanyId: data.CompanyId,
//         Action: "DELETE",
//         Entity: "",
//         EntityId: "",
//         ActivityBy: req.Role,
//         ActivityByUsername: req.userName,
//         Activity: {
//           description: "",
//         },
//         Reason: "",
//         createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//         updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//       };

//       if (data.QuoteId) {
//         activityData.Entity = "Dropbox Signature for Quote";
//         activityData.EntityId = data.QuoteId;
//         activityData.Activity.description = `Deleted the Signature Request for Quote Using Dropbox for "${signerName}"`;
//         activityData.Reason = "Quote Signature Request Deletion";
//       } else if (data.ContractId) {
//         activityData.Entity = "Dropbox Signature for Contract";
//         activityData.EntityId = data.ContractId;
//         activityData.Activity.description = `Deleted the Signature Request for Contract Using Dropbox for "${signerName}"`;
//         activityData.Reason = "Contract Signature Request Deletion";
//       } else if (data.InvoiceId) {
//         activityData.Entity = "Dropbox Signature for Invoice";
//         activityData.EntityId = data.InvoiceId;
//         activityData.Activity.description = `Deleted the Signature Request for Invoice Using Dropbox for "${signerName}"`;
//         activityData.Reason = "Invoice Signature Request Deletion";
//       } else {
//         throw new Error("Delete activity cannot be logged.");
//       }

//       await Activities.create(activityData);

//       const cancelResult = await cancelSignatureRequest(
//         signatureRequestId,
//         signatureRequest,
//         req
//       );
//       if (cancelResult.statusCode !== 200) {
//         const removeResult = await removeSignatureRequest(signatureRequestId);
//         if (removeResult.statusCode !== 200) {
//           return res.status(removeResult.statusCode).json({
//             statusCode: removeResult.statusCode,
//             message: removeResult.message,
//           });
//         }
//         return res.status(200).json({
//           statusCode: 200,
//           message:
//             "Dropbox file marked as deleted and signature request removed successfully!",
//         });
//       }

//       return res.status(200).json({
//         statusCode: 200,
//         message:
//           "Dropbox file marked as deleted and signature request canceled successfully!",
//       });
//     } catch (error) {
//       console.error(error.message);
//       return res.status(500).json({
//         statusCode: 500,
//         message: "Something went wrong. Please try again later!",
//       });
//     }
//   }
// );

const deleteAccount = async (signatureRequestId, DeleteReason, req) => {
  try {
    const signatureRequest = await SignatureRequest.findOne({ signatureRequestId });

    if (!signatureRequest) {
      return { statusCode: 404, message: "Dropbox file not found with the given signatureRequestId!" };
    }

    // Update the signature request to mark it as deleted
    const result = await SignatureRequest.updateOne(
      { signatureRequestId },
      { $set: { IsDeleted: true } }
    );

    if (result.matchedCount === 0) {
      return { statusCode: 404, message: "Dropbox file not found with the given signatureRequestId!" };
    }

    const data = {
      CompanyId: signatureRequest.CompanyId,
      QuoteId: signatureRequest.QuoteId,
      ContractId: signatureRequest.ContractId,
      InvoiceId: signatureRequest.InvoiceId,
    };

    const signerName = signatureRequest.signers.length > 0 ? signatureRequest.signers[0].name : "Unknown Signer";

    // Create an activity log
    const activityData = {
      ActivityId: `${Date.now()}`,
      CompanyId: data.CompanyId,
      Action: "DELETE",
      Entity: "",
      EntityId: "",
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: "",
      },
      Reason: DeleteReason,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    // Define which entity was deleted based on available data
    if (data.QuoteId) {
      activityData.Entity = "Dropbox Signature for Quote";
      activityData.EntityId = data.QuoteId;
      activityData.Activity.description = `Deleted the Signature Request for Quote Using Dropbox for "${signerName}"`;
      activityData.Reason = "Quote Signature Request Deletion";
    } else if (data.ContractId) {
      activityData.Entity = "Dropbox Signature for Contract";
      activityData.EntityId = data.ContractId;
      activityData.Activity.description = `Deleted the Signature Request for Contract Using Dropbox for "${signerName}"`;
      activityData.Reason = "Contract Signature Request Deletion";
    } else if (data.InvoiceId) {
      activityData.Entity = "Dropbox Signature for Invoice";
      activityData.EntityId = data.InvoiceId;
      activityData.Activity.description = `Deleted the Signature Request for Invoice Using Dropbox for "${signerName}"`;
      activityData.Reason = "Invoice Signature Request Deletion";
    } else {
      throw new Error("Delete activity cannot be logged.");
    }

    await Activities.create(activityData);

    // Additional actions after marking as deleted (cancel, remove, etc.)
    const cancelResult = await cancelSignatureRequest(signatureRequestId, signatureRequest, req);
    if (cancelResult.statusCode !== 200) {
      const removeResult = await removeSignatureRequest(signatureRequestId);
      if (removeResult.statusCode !== 200) {
        return { statusCode: removeResult.statusCode, message: removeResult.message };
      }
      return { statusCode: 200, message: "Dropbox file marked as deleted and signature request removed successfully!" };
    }

    return { statusCode: 200, message: "Dropbox file marked as deleted and signature request canceled successfully!" };
    
  } catch (error) {
    console.error(error.message);
    return { statusCode: 500, message: "Something went wrong. Please try again later!" };
  }
};

router.delete("/delete/:signatureRequestId", verifyLoginToken, async (req, res) => {
  const { signatureRequestId } = req.params;
  const DeleteReason = req.body.reason || "No Reason Provided";

  try {
    const response = await deleteAccount(signatureRequestId, DeleteReason, req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ statusCode: 500, message: "Something went wrong, please try later!" });
  }
});


//-------------------------------CANCEL SIGNATURE REQUEST----------------------------------------

const cancelSignatureRequest = async (
  signatureRequestId,
  signatureRequest,
  req
) => {
  try {
    const result = await signatureRequestApi.signatureRequestCancel(
      signatureRequestId
    );

    if (!signatureRequest) {
      return {
        statusCode: 404,
        message: "Dropbox file not found with the given signatureRequestId!",
      };
    }

    const data = {
      CompanyId: signatureRequest.CompanyId,
      QuoteId: signatureRequest.QuoteId,
      ContractId: signatureRequest.ContractId,
      InvoiceId: signatureRequest.InvoiceId,
    };

    const signerName =
      signatureRequest.signers.length > 0
        ? signatureRequest.signers[0].name
        : "Unknown Signer";

    // Log the cancel activity
    const activityData = {
      ActivityId: `${Date.now()}`,
      CompanyId: data.CompanyId,
      Action: "DELETE",
      Entity: "",
      EntityId: "",
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: "",
      },
      Reason: "",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    };

    if (data.QuoteId) {
      activityData.Entity = "Dropbox Signature for Quote";
      activityData.EntityId = data.QuoteId;
      activityData.Activity.description = `Quote Signature Request canceled for "${signerName}"`;
      activityData.Reason = "Quote Signature Request Cancellation";
    } else if (data.ContractId) {
      activityData.Entity = "Dropbox Signature for Contract";
      activityData.EntityId = data.ContractId;
      activityData.Activity.description = `Contract Signature Request canceled for "${signerName}"`;
      activityData.Reason = "Contract Signature Request Cancellation";
    } else if (data.InvoiceId) {
      activityData.Entity = "Dropbox Signature for Invoice";
      activityData.EntityId = data.InvoiceId;
      activityData.Activity.description = `Invoice Signature Request canceled for "${signerName}"`;
      activityData.Reason = "Invoice Signature Request Cancellation";
    } else {
      throw new Error("Cancel activity cannot be logged.");
    }

    await Activities.create(activityData);

    return {
      statusCode: 200,
      data: result.body,
    };
  } catch (error) {
    console.error("Error in cancelSignatureRequest:", error);
    return {
      statusCode: 500,
      message: error.body?.error?.errorMsg || error.message,
    };
  }
};

router.post(
  "/signature_request/cancel/:signatureRequestId",verifyLoginToken,
  async (req, res) => {
    const { signatureRequestId } = req.params;
    if (!signatureRequestId) {
      return res.status(400).json({ error: "signatureRequestId is required" });
    }
    try {
      const result = await signatureRequestApi.signatureRequestCancel(
        signatureRequestId
      );
      res.status(200).json(result.body);
    } catch (error) {
      console.error("Exception when calling Dropbox Sign API:", error);
      res
        .status(500)
        .json({ error: error.body || "An unexpected error occurred" });
    }
  }
);

//-------------------------------REMOVE SIGNATURE REQUEST----------------------------------------

const removeSignatureRequest = async (signatureRequestId) => {
  try {
    const result = await signatureRequestApi.signatureRequestRemove(
      signatureRequestId
    );

    const signatureRequest = await SignatureRequest.findOne({
      signatureRequestId,
    });

    if (!signatureRequest) {
      return {
        statusCode: 404,
        message: "Dropbox file not found with the given signatureRequestId!",
      };
    }

    return {
      statusCode: 200,
      data: result.body,
    };
  } catch (error) {
    console.error("Error in removeSignatureRequest:", error);
    if (
      error.body?.error?.errorName === "signature_request_remove_failed" &&
      error.body?.error?.errorMsg.includes(
        "To cancel an incomplete signature request"
      )
    ) {
      return await cancelSignatureRequest(signatureRequestId);
    }

    return {
      success: false,
      message: error.body?.error?.errorMsg || error.message,
    };
  }
};

router.post(
  "/signature_request/remove/:signatureRequestId",verifyLoginToken,
  async (req, res) => {
    try {
      const { signatureRequestId } = req.params;
      const result = await removeSignatureRequest(signatureRequestId);

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

module.exports = {
  router,
  getFileDataUri,
  getSignatureRequestDetails,
  removeSignatureRequest,
};

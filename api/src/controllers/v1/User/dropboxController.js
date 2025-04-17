const DropboxSign = require("@dropbox/sign");
const SignatureRequest = require("../../../models/User/Dropbox");

const signatureRequestApi = new DropboxSign.SignatureRequestApi();
signatureRequestApi.username = process.env.DROPBOX_API_KEY;

exports.createSignatureRequest = async (req, res) => {
  try {
    const data = req.body;
    const query = {
      CompanyId: data.CompanyId,
      isComplete: false,
      IsDeleted: false,
      isDeclined: false,
    };

    if (data.QuoteId) {
      query.QuoteId = data.QuoteId;
    } else if (data.ContractId) {
      query.ContractId = data.ContractId;
    }

    const pendingRequest = await SignatureRequest.findOne(query);

    if (pendingRequest) {
      return res.status(403).json({
        statusCode: 403,
        message:
          "A signature request is already pending. Please complete it first.",
      });
    }

    const queryone = {
      CompanyId: data.CompanyId,
      isComplete: true,
      IsDeleted: false,
      isDeclined: false,
    };

    if (data.QuoteId) {
      queryone.QuoteId = data.QuoteId;
    } else if (data.ContractId) {
      queryone.ContractId = data.ContractId;
    }
    const signedRequest = await SignatureRequest.findOne(queryone);

    if (signedRequest) {
      return res.status(405).json({
        statusCode: 405,
        message: "Your document is already signed.",
      });
    }
    console.log(data, "data");

    const signers = data.signers.map((signer, index) => ({
      emailAddress: signer.email,
      name: signer.name,
      order: index,
    }));
    {
      console.log(signers, "signers");
    }

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
    console.log(requestData, "requestData");
    const result = await signatureRequestApi.signatureRequestSend(requestData);
    console.log(result, "result");
    const responseData = result.body.signatureRequest;
    console.log(responseData, "responseData");
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
    console.log(
      signatureRequestData,
      "signatureRequestDatasignatureRequestData"
    );
    const signatureRequest = await SignatureRequest.create(
      signatureRequestData
    );

    // const activityData = {
    //   ActivityId: `${Date.now()}`,
    //   CompanyId: data.CompanyId,
    //   Action: "CREATE",
    //   Entity: "",
    //   EntityId: "",
    //   ActivityBy: req.Role,
    //   ActivityByUsername: req.userName,
    //   Activity: {
    //     description: "",
    //   },
    //   Reason: "",
    //   createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    //   updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    // };

    // const signerName = requestData?.signers?.[0]?.name || "Unknown";

    // if (data.QuoteId) {
    //   activityData.Entity = "Dropbox Signature Request for Quote";
    //   activityData.EntityId = data.QuoteId;
    //   activityData.Activity.description = `Created a Signature Request for Quote Using Dropbox For '${signerName}'`;
    //   activityData.Reason = "Quote Signature Request Creation";
    // } else if (data.ContractId) {
    //   activityData.Entity = "Dropbox Signature Request for Contract";
    //   activityData.EntityId = data.ContractId;
    //   activityData.Activity.description = `Created a Signature Request for Contract Using Dropbox For '${signerName}'`;
    //   activityData.Reason = "Contract Signature Request Creation";
    // } else if (data.InvoiceId) {
    //   activityData.Entity = "Dropbox Signature Request for Invoice";
    //   activityData.EntityId = data.InvoiceId;
    //   activityData.Activity.description = `Created a Signature Request for Invoice Using Dropbox For '${signerName}'`;
    //   activityData.Reason = "Invoice Signature Request Creation";
    // } else {
    //   throw new Error("Activity cannot be created.");
    // }

    // await Activities.create(activityData);

    return res.status(200).json({
      statusCode: 200,
      message: "Signature request created successfully.",
      data: signatureRequest,
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return res.status(400).json({
      statusCode: 400,
      message: "Failed to create signature request.",
      error: error.response?.data?.error?.message || error.message,
    });
  }
};

// **GET PDF DIRECT DOWNLOAD**
exports.getSignatureRequestDetails = async (req, res) => {
  try {
    const { signatureRequestId } = req.params;

    const response = await signatureRequestApi.signatureRequestGet(
      signatureRequestId
    );

    return res.status(200).json({
      statusCode: 200,
      message: "Signature request details retrieved successfully.",
      data: response.body,
    });
  } catch (error) {
    console.error(
      "Error fetching signature request:",
      error.response?.body || error.message
    );
    return res.status(400).json({
      statusCode: 400,
      message: "Failed to retrieve signature request.",
      error: error.response?.body || error.message,
    });
  }
};

// **GET PDF**
exports.getFileDataUri = async (req, res) => {
  try {
    const { signatureRequestId } = req.params;

    const response = await signatureRequestApi.signatureRequestFilesAsDataUri(
      signatureRequestId
    );
    return res.status(200).json({
      success: true,
      fileDataUri: response.body,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.response?.body || error.message,
    });
  }
};

// **GET PDF URL**
exports.getDropboxFileUrl = async (req, res) => {
  try {
    const { signatureRequestId } = req.params;

    const response = await signatureRequestApi.signatureRequestFilesAsFileUrl(
      signatureRequestId
    );

    return res.status(200).json({
      success: true,
      fileUrl: response.body.fileUrl,
    });
  } catch (error) {
    console.error(
      "Error fetching file URL for SignatureRequestId:",
      signatureRequestId,
      error.message
    );
    return res.status(400).json({
      success: false,
      error: error.response?.body || error.message,
    });
  }
};

// **DELET DROPBOX REQUEST**
exports.deleteAccount = async (req, res) => {
  try {
    const { signatureRequestId } = req.params;
    const DeleteReason = req.body.reason || "No Reason Provided";
    const signatureRequest = await SignatureRequest.findOne({
      signatureRequestId,
    });

    if (!signatureRequest) {
      return res.status(404).json({
        statusCode: 404,
        message: "Dropbox file not found with the given signatureRequestId!",
      });
    }

    const result = await SignatureRequest.updateOne(
      { signatureRequestId },
      { $set: { IsDeleted: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: "Dropbox file not found with the given signatureRequestId!",
      });
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

    const cancelResult = await this.cancelSignatureRequest(
      signatureRequestId,
      signatureRequest,
      req
    );
    if (cancelResult.statusCode !== 200) {
      const removeResult = await this.removeSignatureRequest(
        signatureRequestId
      );
      if (removeResult.statusCode !== 200) {
        return res.status(200).json({
          statusCode: removeResult.statusCode,
          message: removeResult.message,
        });
      }
      return res.status(200).json({
        statusCode: 200,
        message:
          "Dropbox file marked as deleted and signature request removed successfully!",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      message:
        "Dropbox file marked as deleted and signature request canceled successfully!",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong. Please try again later!",
    });
  }
};

// **CANCEL SIGNATURE REQUEST**
exports.cancelSignatureRequestLogic = async (
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

    return {
      statusCode: 200,
      data: result.body,
    };
  } catch (error) {
    console.error("Error in cancelSignatureRequestLogic:", error);
    return {
      statusCode: 500,
      message: error.body?.error?.errorMsg || error.message,
    };
  }
};
exports.cancelSignatureRequest = async (req, res) => {
  const { signatureRequestId } = req.params;

  if (!signatureRequestId) {
    return res.status(400).json({ error: "signatureRequestId is required" });
  }

  try {
    const signatureRequest = await SignatureRequest.findOne({
      signatureRequestId,
    });

    const result = await this.cancelSignatureRequestLogic(
      signatureRequestId,
      signatureRequest,
      req
    );

    if (result.statusCode !== 200) {
      return res.status(result.statusCode).json({ message: result.message });
    }

    return res.status(200).json({
      message: "Signature request cancelled successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("Unhandled error in cancelSignatureRequest:", error);
    return res.status(500).json({
      message: "Something went wrong while cancelling the signature request.",
      error: error.message,
    });
  }
};

// **REMOVE SIGNATURE REQUEST**
exports.removeSignatureRequest = async (req, res) => {
  const { signatureRequestId } = req.params;

  if (!signatureRequestId) {
    return res.status(400).json({ error: "signatureRequestId is required" });
  }

  try {
    const result = await signatureRequestApi.signatureRequestRemove(
      signatureRequestId
    );

    const signatureRequest = await SignatureRequest.findOne({
      signatureRequestId,
    });

    if (!signatureRequest) {
      return res.status(404).json({
        message: "Dropbox file not found with the given signatureRequestId!",
      });
    }

    if (
      result.body?.error?.errorName === "signature_request_remove_failed" &&
      result.body?.error?.errorMsg.includes(
        "To cancel an incomplete signature request"
      )
    ) {
      const cancelResult = await signatureRequestApi.signatureRequestCancel(
        signatureRequestId
      );

      if (!cancelResult.body) {
        return res.status(500).json({
          message:
            "Failed to cancel the signature request as part of removal process",
        });
      }

      return res.status(200).json({
        message: "Signature request canceled and removed successfully.",
        data: cancelResult.body,
      });
    }

    return res.status(200).json({
      message: "Signature request removed successfully.",
      data: result.body,
    });
  } catch (error) {
    console.error("Error in removeSignatureRequest:", error);
    return res.status(500).json({
      message: "Something went wrong while removing the signature request.",
      error: error.message,
    });
  }
};

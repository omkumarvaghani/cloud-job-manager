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
      return {
        statusCode: 403,
        message:
          "A signature request is already pending. Please complete it first.",
      };
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
      return {
        statusCode: 405,
        message: "Your document is already signed.",
      };
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

var express = require("express");
var router = express.Router();
var querystring = require("querystring");
var axios = require("axios");
const { DOMParser } = require("xmldom");
const { createToken, verifyLoginToken } = require("../../authentication");
const Company = require("../Admin/Company/model");
const Customer = require("../Admin/Customer/model");
const NmiKey = require("../Superadmin/NMIKeys/model");
const path = require("path");
const fs = require("fs");
const PlanPurchase = require("../Admin/PlanPurchase/model");
const CustomerVault = require("./CustomerVault/model");
const Activities = require("../Admin/ActivitiesModel");
const moment = require("moment");

const sendResponse = (res, data, status = 200) => {
  if (status !== 200) {
    data = {
      error: data,
    };
  }
  return res.status(status).json({
    status,
    data,
  });
};
const logDir = path.join(__dirname, "../../logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const getLogFilePath = () => {
  const date = new Date().toISOString().split("T")[0];
  return path.join(logDir, `nmi-log-${date}.log`);
};

const logToFile = (logEntry) => {
  const logFilePath = getLogFilePath();
  const logStream = fs.createWriteStream(logFilePath, { flags: "a" });
  logStream.write(logEntry + "\n");
  logStream.end();
};

const sendNmiRequest = async (config) => {
  const postData = querystring.stringify(config);

  const nmiConfig = {
    method: "post",
    url: "https://secure.networkmerchants.com/api/transact.php",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: postData,
  };

  const logEntry = `
  Time: ${new Date().toISOString()}
  Request URL: ${nmiConfig.url}
  Request Method: POST
  Request Body: ${JSON.stringify(config)}
  ----------------------------------------------
  `;

  logToFile(logEntry);

  try {
    const response = await axios(nmiConfig);
    const parsedResponse = querystring.parse(response.data);

    const responseLogEntry = `
    Time: ${new Date().toISOString()}
    Response: ${response.data}
    ----------------------------------------------
    `;
    logToFile(responseLogEntry);

    return parsedResponse;
  } catch (error) {
    const errorLogEntry = `
    Time: ${new Date().toISOString()}
    Error: ${error.message}
    ----------------------------------------------
    `;
    logToFile(errorLogEntry);

    console.error("NMI API Error:", error);
    throw error;
  }
};

//Logic function to convert XML file to JSON
const convertToJson = (data) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "application/xml");

    const jsonResult = xmlToJson(xmlDoc);
    return jsonResult;
  } catch (error) {
    console.error("Error converting XML to JSON:", error);
    return { error: "Error converting XML to JSON" };
  }
};

const xmlToJson = (xml) => {
  let result = {};

  if (xml.nodeType === 1) {
    if (xml.attributes.length > 0) {
      result["@attributes"] = {};
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j);
        result["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3 && xml.nodeValue.trim() !== "") {
    result = xml.nodeValue.trim();
  }

  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i);
      const nodeName = item.nodeName;

      if (nodeName === "#text") {
        const textValue = item.nodeValue.trim();
        if (textValue !== "") {
          return textValue;
        }
      } else {
        if (typeof result[nodeName] === "undefined") {
          result[nodeName] = xmlToJson(item);
        } else {
          if (typeof result[nodeName].push === "undefined") {
            const old = result[nodeName];
            result[nodeName] = [];
            if (old !== "") {
              result[nodeName].push(old);
            }
          }
          const childResult = xmlToJson(item);
          if (childResult !== "") {
            result[nodeName].push(childResult);
          }
        }
      }
    }
  }

  return result;
};

const generateBillingId = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000);
};

//create customer vault NMI API
router.post("/create-customer-vault", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      ccnumber,
      ccexp,
      address1,
      address2,
      city,
      state,
      checkname,
      checkaba,
      checkaccount,
      account_holder_type,
      account_type,
      type,
      zip,
      country,
      phone,
      email,
      company,
      CompanyId,
      CustomerId,
      billing_id = generateBillingId(),
    } = req.body;

    const NmisecretKey = await NmiKey.findOne({ CompanyId: CompanyId });
    if (!NmisecretKey) {
      sendResponse(res, "Security key not found!", 404);
      return;
    }
    if (type === "card") {
      var customerData = {
        security_key: NmisecretKey.SecurityKey,
        customer_vault: "add_customer",
        first_name,
        last_name,
        ccnumber,
        ccexp,
        address1,
        address2,
        city,
        state,
        zip,
        country,
        phone,
        email,
        company,
        billing_id,
      };
    } else {
      customerData = {
        security_key: NmisecretKey.SecurityKey,
        customer_vault: "add_customer",
        first_name,
        last_name,
        checkname,
        checkaba,
        checkaccount,
        account_holder_type,
        account_type,
        address1,
        address2,
        city,
        state,
        zip,
        country,
        phone,
        email,
        company,
        billing_id,
      };
    }

    const nmiResponse = await sendNmiRequest(customerData);

    if (nmiResponse.response_code == 100) {
      let customerVault = await CustomerVault.findOne({
        CompanyId,
        CustomerId: CustomerId || "",
        type,
        customer_vault_id: nmiResponse.customer_vault_id,
      });
      if (!customerVault) {
        customerVault = new CustomerVault({
          CompanyId,
          CustomerId: CustomerId || "",
          customer_vault_id: nmiResponse.customer_vault_id,
          type,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      customerVault.billing_ids.push({ billing_id });

      customerVault.updatedAt = new Date().toISOString();

      await customerVault.save();

      sendResponse(res, {
        message: "Customer vault billing created successfully.",
        billing_id,
        customer_vault_id: nmiResponse.customer_vault_id,
      });
    } else {
      sendResponse(res, nmiResponse.responsetext, 403);
    }
  } catch (error) {
    console.log(error);
    sendResponse(res, "Something went wrong!", 500);
  }
});

router.get("/customer_vault/:CompanyId/:type", async (req, res) => {
  try {
    const { CompanyId, type } = req.params;
    const vaultDetails = await CustomerVault.findOne({
      CompanyId,
      IsDelete: false,
      type: type || "Card",
      CustomerId: "",
    });
    if (vaultDetails) {
      res.status(200).json({
        data: vaultDetails,
      });
    } else {
      res.status(204);
    }
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

//update customer vault NMI API
router.put("/update-customer-vault", async (req, res) => {
  try {
    const {
      customer_vault_id,
      first_name,
      last_name,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
      CompanyId,
    } = req.body;

    const NmisecretKey = await NmiKey.findOne({ CompanyId: CompanyId });
    if (!NmisecretKey) {
      sendResponse(res, { status: 404, error: `Security key not found` }, 404);
      return;
    }

    let customerData = {
      security_key: NmisecretKey.SecurityKey,
      customer_vault: "update_customer",
      customer_vault_id,
      first_name,
      last_name,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
    };

    const nmiResponse = await sendNmiRequest(customerData);
    if (nmiResponse.response_code == 100) {
      // Handle successful customer creation
      sendResponse(res, "Customer vault updated successfully.");
    } else {
      // Handle customer creation failure
      sendResponse(res, nmiResponse.responsetext, 403);
    }
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

//delete customer vault NMI API
router.post("/delete-customer-vault", async (req, res) => {
  try {
    const { customer_vault_id, CompanyId } = req.body;
    const NmisecretKey = await NmiKey.findOne({ CompanyId: CompanyId });

    const vaultCustomer = await CustomerVault.findOne({
      CompanyId: CompanyId,
      customer_vault_id: customer_vault_id,
    });

    if (!vaultCustomer) {
      return res.status(404).json({
        statusCode: 404,
        message: "data not found.",
      });
    }

    const deleteCustomer = await CustomerVault.findOneAndUpdate(
      {
        CompanyId,
        customer_vault_id,
      },
      {
        $set: {
          IsDelete: true,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!deleteCustomer) {
      return res.status(203).json({
        statusCode: 203,
        message: "Customer vault data not found",
      });
    }

    if (!NmisecretKey) {
      sendResponse(res, { status: 404, error: `Security key not found` }, 404);
    }

    let customerData = {
      security_key: NmisecretKey.SecurityKey,
      customer_vault: "delete_customer",
      customer_vault_id,
    };

    const nmiResponse = await sendNmiRequest(customerData);
    if (nmiResponse.response_code == 100) {
      // Handle successful customer creation
      sendResponse(res, "Customer vault deleted successfully.");
    } else {
      // Handle customer creation failure
      sendResponse(res, nmiResponse.responsetext, 403);
    }
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

//create customer vault billing NMI API
router.post("/create-customer-billing", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      ccnumber,
      ccexp,
      checkname,
      checkaba,
      checkaccount,
      account_holder_type,
      account_type,
      CustomerId,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
      company,
      customer_vault_id,
      CompanyId,
      type,
      billing_id = generateBillingId(),
    } = req.body;

    const NmisecretKey = await NmiKey.findOne({ CompanyId: CompanyId });
    if (!NmisecretKey) {
      sendResponse(res, { status: 404, error: `Security key not found` }, 404);
      return;
    }

    if (type === "card") {
      var customerData = {
        security_key: NmisecretKey.SecurityKey,
        customer_vault: "add_billing",
        customer_vault_id,
        first_name,
        last_name,
        ccnumber,
        ccexp,
        address1,
        address2,
        city,
        state,
        zip,
        country,
        phone,
        email,
        company,
        billing_id,
      };
    } else {
      var customerData = {
        security_key: NmisecretKey.SecurityKey,
        customer_vault: "add_billing",
        customer_vault_id,
        first_name,
        last_name,
        checkname,
        checkaba,
        checkaccount,
        account_holder_type,
        account_type,
        address1,
        address2,
        city,
        state,
        zip,
        country,
        phone,
        email,
        company,
        billing_id,
      };
    }

    const nmiResponse = await sendNmiRequest(customerData);
    if (nmiResponse.response_code == 100) {
      let customerVault = await CustomerVault.findOne({
        CompanyId,
        customer_vault_id,
        CustomerId: CustomerId || "",
        type,
      });
      if (!customerVault) {
        customerVault = new CustomerVault({
          CompanyId,
          customer_vault_id,
          type,
          CustomerId: CustomerId || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      customerVault.billing_ids.push({ billing_id });

      customerVault.updatedAt = new Date().toISOString();

      await customerVault.save();
      // Handle successful customer creation
      sendResponse(res, {
        message: "Customer vault billing created successfully.",
        billing_id,
        customer_vault_id,
      });
    } else {
      // Handle customer creation failure
      sendResponse(res, nmiResponse.responsetext, 403);
    }
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

//get multiple billing records from customer vault NMI API
router.post("/get-billing-customer-vault", async (req, res) => {
  try {
    const { CompanyId, type, CustomerId } = req.body;

    const VaultData = await CustomerVault.findOne({
      CompanyId,
      IsDelete: false,
      type,
      CustomerId: CustomerId || "",
    });

    if (!VaultData) {
      sendResponse(
        res,
        { status: 204, error: "Customer vault account is not found" },
        204
      );
      return;
    }

    if (!VaultData.customer_vault_id) {
      sendResponse(
        res,
        { status: 204, error: "Invalid or missing customer_vault_id" },
        204
      );
      return;
    }

    const NmisecretKey = await NmiKey.findOne({ CompanyId: CompanyId });

    if (!NmisecretKey) {
      sendResponse(res, { status: 204, error: `Security key not found` }, 204);
      return;
    }

    const postData = {
      security_key: NmisecretKey.SecurityKey,
      customer_vault_id: VaultData.customer_vault_id,
      report_type: "customer_vault",
      ver: 2,
    };

    const config = {
      method: "post",
      url: "https://hms.transactiongateway.com/api/query.php",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: querystring.stringify(postData),
    };

    const response = await axios(config);

    const jsonResult = convertToJson(response.data);

    if (jsonResult.nm_response.customer_vault) {
      sendResponse(res, jsonResult.nm_response.customer_vault);
    } else {
      sendResponse(res, {
        status: 204,
        error: "No valid customer vault record found",
      });
    }
  } catch (error) {
    console.error("Error processing customer vault record:", error);
    sendResponse(res, { status: 500, error: "Internal server error" }, 500);
  }
});

//update customer vault billing NMI API
router.put("/update-customer-billing", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      ccnumber,
      ccexp,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
      company,
      customer_vault_id,
      billing_id,
      CompanyId,
    } = req.body;

    const NmisecretKey = await NmiKey.findOne({ CompanyId: CompanyId });
    if (!NmisecretKey) {
      sendResponse(res, { status: 404, error: `Security key not found` }, 404);
      return;
    }

    let customerData = {
      security_key: NmisecretKey.SecurityKey,
      customer_vault: "update_billing",
      customer_vault_id,
      billing_id,
      first_name,
      last_name,
      ccnumber,
      ccexp,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      phone,
      email,
      company,
    };

    const nmiResponse = await sendNmiRequest(customerData);
    if (nmiResponse.response_code == 100) {
      // Handle successful customer creation
      sendResponse(res, "Customer vault billing updated successfully.");
    } else {
      // Handle customer creation failure
      sendResponse(res, nmiResponse.responsetext, 403);
    }
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

//delete customer vault billing NMI API
router.post("/delete-customer-billing", async (req, res) => {
  try {
    const { CompanyId, customer_vault_id, billing_id } = req.body;

    const NmisecretKey = await NmiKey.findOne({ CompanyId: CompanyId });

    const vaultCompany = await CustomerVault.findOne({
      CompanyId: CompanyId,
      customer_vault_id: customer_vault_id,
      "billing_ids.billing_id": billing_id,
    });

    if (!vaultCompany) {
      return res.status(204).json({
        statusCode: 204,
        message: "data not found.",
      });
    }

    const deleteBilling = await CustomerVault.findOneAndUpdate(
      {
        "billing_ids.billing_id": billing_id,
        "billing_ids.IsDelete": false,
      },
      {
        $set: {
          "billing_ids.$[elem].IsDelete": true,
        },
      },
      {
        arrayFilters: [{ "elem.billing_id": billing_id }],
        new: true,
        runValidators: true,
      }
    );

    if (!deleteBilling) {
      return res.status(203).json({
        statusCode: 203,
        message: "Billing data not found",
      });
    }

    if (!NmisecretKey) {
      sendResponse(res, { status: 404, error: `Security key not found` }, 404);
      return;
    }

    let customerData = {
      security_key: NmisecretKey.SecurityKey,
      customer_vault: "delete_billing",
      customer_vault_id,
      billing_id,
      CompanyId,
    };

    const nmiResponse = await sendNmiRequest(customerData);
    if (nmiResponse.response_code == 100) {
      // Handle successful customer creation
      sendResponse(res, "Customer vault billing deleted successfully.");
    } else {
      // Handle customer creation failure
      sendResponse(res, nmiResponse.responsetext, 403);
    }
  } catch (error) {
    sendResponse(res, "Something went wrong!", 500);
  }
});

const cardPayment = async (paymentDetails, SecurityKey) => {
  const nmiConfig = {
    type: "sale",
    payment: "creditcard",
    customer_vault_id: paymentDetails.customer_vault_id,
    billing_id: paymentDetails.billing_id,
    amount: paymentDetails.amount,
    surcharge: paymentDetails.surcharge,
    security_key: SecurityKey,
    processor_id: paymentDetails.processor_id,
  };

  const nmiResponse = await sendNmiRequest(nmiConfig);
  return nmiResponse;
};

//Actual payment functionality
router.post("/card-payment", async (req, res) => {
  try {
    const { paymentDetails } = req.body;
    const NmisecretKey = await NmiKey.findOne({
      CompanyId: paymentDetails.CompanyId,
    });

    if (!NmisecretKey) {
      sendResponse(res, { status: 404, error: `Security key not found` }, 404);
      return;
    }

    const nmiResponse = await cardPayment(
      paymentDetails,
      NmisecretKey.SecurityKey
    );

    if (nmiResponse.response_code === "100") {
      const successMessage = `Payment done successfully! Transaction ID: ${nmiResponse.transactionid}`;

      if (!paymentDetails.PlanId) {
        return res.status(200).json({
          statusCode: 100,
          message: successMessage,
          data: nmiResponse,
        });
      }

      const newPlanPurchase = new PlanPurchase({
        PlanPurchaseId: Date.now(),
        SubscriptionId: nmiResponse.transactionid,
        CompanyId: paymentDetails.CompanyId,
        PlanId: paymentDetails.PlanId,
        BillingDate: paymentDetails.BillingDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await newPlanPurchase.save();

      const CompanyData = await Company.findOneAndUpdate(
        {
          companyId: paymentDetails.CompanyId,
        },
        {
          $set: {
            IsPlanActive: true,
          },
        }
      );

      let tokenData;
      if (CompanyData) {
        tokenData = {
          companyId: CompanyData.companyId,
          full_name: CompanyData.ownerName,
          phoneNumber: CompanyData.phoneNumber,
          EmailAddress: CompanyData.EmailAddress,
          companyName: CompanyData.companyName,
          role: CompanyData.role,
          Address: CompanyData.Address,
          City: CompanyData.City,
          State: CompanyData.State,
          Country: CompanyData.Country,
          Zip: CompanyData.Zip,
          isActive: true,
          IsPlanActive: CompanyData.IsPlanActive,
        };
      }

      const token = createToken(tokenData);

      return res.status(200).json({
        statusCode: 100,
        message: successMessage,
        data: nmiResponse,
        token,
      });
    } else if (nmiResponse.response_code === "200") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "201") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "202") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "203") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "204") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "220") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "221") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "222") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "223") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "224") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "225") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "226") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "240") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "250") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "251") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "252") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "253") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "260") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "261") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "262") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "263") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "264") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "300") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "400") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "410") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "411") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "420") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "421") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "430") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "440") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "441") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "460") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "461") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else {
      // Payment failed
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res
        .status(400)
        .send(`Failed to process payment: ${nmiResponse.responsetext}`);
    }
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).send(error);
  }
});

const achPayment = async (reqbody, SecurityKey) => {
  if (reqbody.customer_vault_id) {
    var nmiConfig = {
      type: "sale",
      payment: "check",
      amount: reqbody.amount,
      security_key: SecurityKey,
      processor_id: reqbody.processor_id,
      customer_vault_id: reqbody.customer_vault_id,
      billing_id: reqbody.billing_id,
    };
  } else {
    nmiConfig = {
      type: "sale",
      payment: "check",
      amount: reqbody.amount,
      security_key: SecurityKey,
      processor_id: reqbody.processor_id,
      address1: reqbody.property,
      surcharge: reqbody.surcharge,
      first_name: reqbody.first_name,
      last_name: reqbody.last_name,
      email: reqbody.email_name,
      checkname: reqbody.checkname,
      checkaba: reqbody.checkaba,
      checkaccount: reqbody.checkaccount,
      account_holder_type: reqbody.account_holder_type,
      account_type: reqbody.account_type,
    };
  }
  const nmiResponse = await sendNmiRequest(nmiConfig);
  return nmiResponse;
};

//ACH payment functionality
router.post("/ach-payment", async (req, res) => {
  try {
    // Extract necessary data from the request
    const { paymentDetails } = req.body;
    const NmisecretKey = await NmiKey.findOne({
      CompanyId: paymentDetails.CompanyId,
    });

    if (!NmisecretKey) {
      sendResponse(res, { status: 404, error: `Security key not found` }, 404);
      return;
    }

    const nmiResponse = await achPayment(
      paymentDetails,
      NmisecretKey.SecurityKey
    );

    // Check the response from NMI
    if (nmiResponse.response_code === "100") {
      const successMessage = `Payment done successfully! Transaction ID: ${nmiResponse.transactionid}`;

      return res.status(200).json({
        statusCode: 100,
        message: successMessage,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "200") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "201") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "202") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "203") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "204") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "220") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "221") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "222") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "223") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "224") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "225") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "226") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "240") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "250") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "251") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "252") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "253") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "260") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "261") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "262") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "263") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "264") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "300") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "400") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "410") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "411") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "420") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "421") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "430") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "440") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "441") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "460") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "461") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else {
      // Payment failed
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res
        .status(400)
        .send(`Failed to process payment: ${nmiResponse.responsetext}`);
    }
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).send(error);
  }
});

//Update Payment functionality
router.put("/update-payment", async (req, res) => {
  try {
    // Extract necessary data from the request
    const { paymentDetails } = req.body;
    const NmisecretKey = await NmiKey.findOne({
      CompanyId: paymentDetails.CompanyId,
    });
    if (!NmisecretKey) {
      sendResponse(res, { status: 404, error: `Security key not found` }, 404);
      return;
    }

    const nmiConfig = {
      type: "update",
      transactionid: paymentDetails.transactionId,
      payment:
        paymentDetails.paymentType === "creditcard" ? "creditcard" : "check",
      // customer_vault_id: paymentDetails.customer_vault_id,
      // billing_id: paymentDetails.billing_id,
      // address1: paymentDetails.address1,
      amount: paymentDetails.amount,
      // surcharge: paymentDetails.surcharge,
      // first_name: paymentDetails.first_name,
      // last_name: paymentDetails.last_name,
      // email: paymentDetails.email,
      security_key: NmisecretKey.SecurityKey,
      processor_id: paymentDetails.processor_id,
      // dup_seconds: 5
    };

    const nmiResponse = await sendNmiRequest(nmiConfig);

    // Check the response from NMI
    if (nmiResponse.response_code === "100") {
      const successMessage = `Payment update successfully! Transaction ID: ${nmiResponse.transactionid}`;

      return res.status(200).json({
        statusCode: 100,
        message: successMessage,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "200") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "201") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "202") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "203") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "204") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "220") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "221") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "222") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "223") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "224") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "225") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "226") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "240") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "250") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "251") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "252") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "253") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "260") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "261") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "262") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "263") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "264") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "300") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "400") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "410") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "411") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "420") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "421") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "430") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "440") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "441") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "460") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "461") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else {
      // Payment failed
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res
        .status(400)
        .send(`Failed to process payment: ${nmiResponse.responsetext}`);
    }
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).send(error);
  }
});

//Void Payment
router.post("/void-payment", async (req, res) => {
  try {
    // Extract necessary data from the request
    const { paymentDetails } = req.body;
    const NmisecretKey = await NmiKey.findOne({
      CompanyId: paymentDetails.CompanyId,
    });
    if (!NmisecretKey) {
      sendResponse(res, { status: 404, error: `Security key not found` }, 404);
      return;
    }

    const nmiConfig = {
      type: "void",
      transactionid: paymentDetails.transactionId,
      payment:
        paymentDetails.paymentType === "creditcard" ? "creditcard" : "check",
      security_key: NmisecretKey.SecurityKey,
      void_reason: paymentDetails.void_reason,
    };

    const nmiResponse = await sendNmiRequest(nmiConfig);

    // Check the response from NMI
    if (nmiResponse.response_code === "100") {
      const successMessage = `Payment Void successfully! Transaction ID: ${nmiResponse.transactionid}`;

      return res.status(200).json({
        statusCode: 100,
        message: successMessage,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "200") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "201") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "202") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "203") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "204") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "220") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "221") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "222") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "223") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "224") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "225") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "226") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "240") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "250") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "251") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "252") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "253") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "260") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "261") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "262") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "263") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "264") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "300") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "400") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "410") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "411") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "420") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "421") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "430") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "440") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "441") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "460") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else if (nmiResponse.response_code === "461") {
      // Duplicate transaction
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res.status(200).json({
        statusCode: 200,
        message: `Failed to process payment: ${nmiResponse.responsetext}`,
        data: nmiResponse,
      });
    } else {
      // Payment failed
      console.log(`Failed to process payment: ${nmiResponse.responsetext}`);
      return res
        .status(400)
        .send(`Failed to process payment: ${nmiResponse.responsetext}`);
    }
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).send(error);
  }
});

//Refund for card/ach payment
router.post("/refund", async (req, res, next) => {
  try {
    const { refundDetails } = req.body;

    const NmisecretKey = await NmiKey.findOne({
      CompanyId: refundDetails.CompanyId,
    });
    if (!NmisecretKey) {
      sendResponse(res, { status: 404, error: `Security key not found` }, 404);
      return;
    }
    const nmiConfig = {
      type: "refund",
      security_key: NmisecretKey.SecurityKey,
      transactionid: refundDetails.transactionId,
      amount: refundDetails.amount,
      payment:
        refundDetails.paymentType === "creditcard" ? "creditcard" : "check",
    };

    const nmiResponse = await sendNmiRequest(nmiConfig);

    if (nmiResponse.response_code === "100") {
      const successMessage = `Refund processed successfully! Transaction ID: ${nmiResponse.transactionid}`;

      return sendResponse(res, successMessage, 200);
    } else if (nmiResponse.response_code === "300") {
      // Refund amount exceeds the transaction balance
      console.log(`Failed to process refund: ${nmiResponse.responsetext}`);
      return sendResponse(res, nmiResponse.responsetext, 201);
    } else {
      // Refund failed
      console.log(`Failed to process refund: ${nmiResponse.responsetext}`);
      return sendResponse(
        res,
        `Failed to process refund: ${nmiResponse.responsetext}`,
        400
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return sendResponse(res, "Something went wrong!", 500);
  }
});

//get NMI-public key for customer
router.get("/nmi_public_key/:CompanyId", async (req, res) => {
  const { CompanyId } = req.params;
  try {
    const nmiKey = await NmiKey.findOne({ CompanyId, IsDelete: false });

    let PublicKey = null;

    if (nmiKey?.PublicKey) {
      PublicKey = nmiKey.PublicKey;
    }

    return res.status(200).json({
      statusCode: 200,
      PublicKey: PublicKey,
      message: "NMI public key fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      // Send proper status code on error
      statusCode: 500,
      message: error.message,
    });
  }
});

router.get("/nmi_public_key_customer/:CustomerId", async (req, res, next) => {
  const CustomerId = req.params.CustomerId;
  try {
    const customer = await Customer.findOne({ CustomerId: CustomerId });
    if (!customer) {
      return res.status(404).json({
        statusCode: 404,
        message: "Customer not found",
      });
    }

    const nmiKey = await NmiKey.findOne({ CompanyId: customer?.CompanyId });

    let PublicKey = null;

    if (nmiKey?.PublicKey) {
      PublicKey = nmiKey?.PublicKey;
    }

    return res.status(200).json({
      statusCode: 200,
      PublicKey: PublicKey,
      message: "NMI public key fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.post("/add-customer-card", verifyLoginToken, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      address1,
      address2,
      city,
      state,
      payment_token,
      type,
      zip,
      country,
      company,
      CompanyId,
      CustomerId,
      phone,
      email,
      billing_id = generateBillingId(),
    } = req.body;

    let errorMsg = null;
    const NmisecretKey = await NmiKey.findOne({ CompanyId });
    if (!NmisecretKey) {
      return sendResponse(res, "Security key not found!", 404);
    }

    if (!payment_token) errorMsg = "Card details required.";
    else if (!first_name) errorMsg = "First name required.";
    else if (!address1) errorMsg = "Address required.";

    if (errorMsg) {
      return sendResponse(res, errorMsg, 405);
    }

    let customerData = {
      security_key: NmisecretKey.SecurityKey,
      billing_id,
      first_name,
      last_name,
      payment_token,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      company,
      phone,
      email,
    };

    const existingCard = await CustomerVault.findOne({
      CompanyId,
      type,
      CustomerId: CustomerId || "",
    });

    if (existingCard && existingCard.customer_vault_id) {
      customerData.customer_vault = "add_billing";
      customerData.customer_vault_id = existingCard.customer_vault_id;
      // customer_vault_id = existingCard.customer_vault_id;
    } else {
      customerData.customer_vault = "add_customer";
    }

    const nmiResponse = await sendNmiRequest(customerData);

    let activityDescription;
    if (nmiResponse.response_code == 100) {
      activityDescription = existingCard
        ? `Added new Card for customer ${first_name} ${last_name}`
        : `Added a new Customer vault and a card for customer ${first_name} ${last_name}`;
    } else {
      activityDescription = existingCard
        ? `Failed to add new Card for customer ${first_name} ${last_name}`
        : `Failed to add a new Customer vault and a card for customer ${first_name} ${last_name}`;
    }

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: CompanyId,
      Action: "Add",
      Entity: "Card",
      EntityId: existingCard ? billing_id : nmiResponse.customer_vault_id,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: activityDescription,
      },
      Reason: nmiResponse.responsetext,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    if (nmiResponse.response_code == 100) {
      let customerVault = await CustomerVault.findOne({
        CompanyId,
        CustomerId: CustomerId || "",
        type,
        customer_vault_id: nmiResponse.customer_vault_id,
      });

      if (!customerVault) {
        customerVault = new CustomerVault({
          CompanyId,
          CustomerId: CustomerId || "",
          customer_vault_id: nmiResponse.customer_vault_id,
          type,
          billing_ids: [{ billing_id }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        customerVault.billing_ids.push({ billing_id });
        customerVault.updatedAt = new Date().toISOString();
      }
      await customerVault.save();

      return sendResponse(res, {
        message: "Customer vault billing created successfully.",
        billing_id,
        customer_vault_id: nmiResponse.customer_vault_id,
      });
    } else {
      // Handle NMI response errors
      return sendResponse(res, nmiResponse.responsetext, 403);
    }
  } catch (error) {
    console.log(error);
    return sendResponse(res, "Something went wrong!", 500);
  }
});

router.get("/getCreditCards/:CustomerId", async (req, res, next) => {
  const CustomerId = req.params.CustomerId;

  try {
    const creditCardData = await CustomerVault.findOne({ CustomerId });
    if (creditCardData) {
      return res.status(200).json(creditCardData);
    } else {
      return res.status(404).json({
        message: "No cards on file.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = { router, achPayment, cardPayment };

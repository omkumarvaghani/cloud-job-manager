var express = require("express");
var router = express.Router();
const moment = require("moment");
var Account = require("./model");
const Activities = require("../ActivitiesModel");
const { verifyLoginToken } = require("../../../authentication");
const { addNotification } = require("../../Notification/notification");
const { accountValidationSchema, validateBody } = require("./validation");

const createAccount = async (data, req) => {
  try {
    const timestamp = Date.now();
    data["account_id"] = `${timestamp}`;
    data["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    data["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

    const newAccount = await Account.create(data);

    const { CompanyId, account_name, account_type } = newAccount;

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId,
      Action: "ADD",
      Entity: "Account",
      EntityId: newAccount.account_id,
      ActivityBy: req.tokenData?.role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Added a new Account: ${account_name} (${account_type})`,
      },
      Reason: "Account creation",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    await addNotification({
      CompanyId: data.CompanyId,
      account_id: data.account_id,
      AddedAt: data.createdAt,
      CreatedBy: "Account",
    });
    return {
      statusCode: 200,
      message: "Add Account Successfully",
      data: newAccount,
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      message: error.message,
    };
  }
};

router.post(
  "/",
  verifyLoginToken,
  validateBody(accountValidationSchema),
  async (req, res) => {
    try {
      const response = await createAccount(req.body, req);
      res.status(response.statusCode).json(response);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

const getAccounts = async (CompanyId, query) => {
  const {
    pageSize = 10,
    pageNumber = 0,
    search = "",
    sortField = "updatedAt",
    sortOrder = "desc",
  } = query;

  const limit = parseInt(pageSize, 10) || 10;
  const skip = parseInt(pageNumber, 10) * limit || 0;
  const sortCriteria =
    sortField === "updatedAt"
      ? { updatedAt: -1 }
      : { [sortField]: sortOrder === "desc" ? -1 : 1 };

  let accountQuery = { CompanyId, IsDelete: false };

  if (search) {
    accountQuery.account_name = { $regex: search, $options: "i" }; // Case-insensitive partial match
  }

  const accounts = await Account.find(accountQuery)
    .skip(skip)
    .limit(limit)
    .sort(sortCriteria);
  const totalCount = await Account.countDocuments(accountQuery);

  return {
    statusCode: accounts.length > 0 ? 200 : 201,
    data: accounts,
    totalCount,
    pageSize,
    pageNumber,
    message:
      accounts.length > 0
        ? "Accounts retrieved successfully"
        : "No accounts found for the given CompanyId",
  };
};

router.get("/:CompanyId", verifyLoginToken, async (req, res, next) => {
  const CompanyId = req.params.CompanyId;
  const query = {
    pageSize: req.query.pageSize,
    pageNumber: req.query.pageNumber,
    search: req.query.search,
    sortField: req.query.sortField,
    sortOrder: req.query.sortOrder,
  };

  try {
    const result = await getAccounts(CompanyId, query);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const getAccountsByCompanyId = async (CompanyId) => {
  try {
    const accounts = await Account.find({
      CompanyId: CompanyId,
      IsDelete: false,
    });

    if (accounts.length === 0) {
      return {
        statusCode: 201,
        message: "No accounts found for the given CompanyId",
      };
    }

    return {
      statusCode: 200,
      data: accounts,
      message: "Accounts found successfully",
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

router.get("/accounts/:CompanyId", verifyLoginToken, async (req, res, next) => {
  const CompanyId = req.params.CompanyId;

  try {
    const response = await getAccountsByCompanyId(CompanyId);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

const getAccount = async (account_id) => {
  try {
    const accountdata = await Account.findOne({
      account_id: account_id,
      IsDelete: false,
    });

    if (!accountdata) {
      return { statusCode: 201, message: "Account not found" };
    }

    return { statusCode: 200, data: accountdata, message: "Account found" };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

router.get("/get_account/:account_id", verifyLoginToken, async (req, res) => {
  const account_id = req.params.account_id;

  try {
    const response = await getAccount(account_id);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

const updateAccount = async (account_id, updateData, tokenData, userName) => {
  // const { role } = tokenData;

  try {
    const updatedAccount = await Account.findOneAndUpdate(
      { account_id: account_id, IsDelete: false },
      { $set: updateData, updatedAt: moment().format("YYYY-MM-DD HH:mm:ss") },
      { new: true }
    );

    if (!updatedAccount) {
      return {
        statusCode: 404,
        message: "Account not found",
      };
    }

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: updatedAccount.CompanyId,
      Action: "UPDATE",
      Entity: "Account",
      EntityId: updatedAccount.account_id,
      ActivityBy: tokenData.role,
      ActivityByUsername: userName,
      Activity: {
        description: `Updated an Account: ${updatedAccount.account_name} (${updatedAccount.account_type})`,
      },
      Reason: "Account updating",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      data: updatedAccount,
      message: "Account updated successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
};

router.put("/:account_id", verifyLoginToken, async (req, res) => {
  try {
    const account_id = req.params.account_id;
    const updateData = req.body;
    const { tokenData, userName } = req;

    const result = await updateAccount(
      account_id,
      updateData,
      tokenData,
      userName
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

const deleteAccount = async (account_id, DeleteReason, req) => {
  try {
    const deletedAccount = await Account.findOneAndUpdate(
      { account_id: account_id },
      { $set: { IsDelete: true, DeleteReason } },
      { new: true }
    );

    if (!deletedAccount) {
      return { statusCode: 404, message: "Account not found" };
    }

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: deletedAccount.CompanyId,
      Action: "DELETE",
      Entity: "Account",
      EntityId: deletedAccount.account_id,
      ActivityBy: req.tokenData.role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Deleted an Account: ${deletedAccount.account_name} (${deletedAccount.account_type})`,
      },
      Reason: DeleteReason,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      data: deletedAccount,
      message: "Account deleted successfully",
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, message: "Internal Server Error" };
  }
};

router.delete("/:account_id", verifyLoginToken, async (req, res) => {
  const account_id = req.params.account_id;
  const DeleteReason = req.body.reason || "No Reason Provided";

  try {
    const response = await deleteAccount(account_id, DeleteReason, req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

module.exports = router;

var express = require("express");
var router = express.Router();
const moment = require("moment");
const Expenses = require("../Expenses/model");
const { verifyLoginToken } = require("../../../../authentication");
const LabourName = require("../../Worker/model");
const Activities = require("../../ActivitiesModel");
const upload = require("./file-upload");
const { validateExpensesBody, expensesValidationSchema } = require("./validation");

const createExpense = async (data, req) => {
  const ExpenseId = Date.now();
  const uniqueId = ExpenseId;

  data["ExpenseId"] = uniqueId;
  data["createdAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  data["updatedAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  try {
    const createdExpense = await Expenses.create(data);

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: data.CompanyId,
      Action: "CREATE",
      Entity: "Expense",
      EntityId: data.ExpenseId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Created a new Expense ${data.ItemName}`,
      },
      Reason: "Expense creation",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      message: "Expense uploaded successfully",
      data: createdExpense,
    };
  } catch (error) {
    return {
      statusCode: 404,
      message: "Failed to create expense.",
      error: error.message,
    };
  }
};

router.post(
  "/",
  verifyLoginToken,
  validateExpensesBody(expensesValidationSchema),
  async (req, res) => {
    try {
      const response = await createExpense(req.body, req);
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

//----------------------GET EXPENSES-----------------------------------------

const fetchExpenseData = async (ContractId, CompanyId) => {
  try {
    const result = await Expenses.find({
      ContractId,
      CompanyId,
      IsDelete: false,
    });

    if (!result || result.length === 0) {
      return {
        statusCode: 204,
        message: `No data found for ContractId: ${ContractId} and CompanyId: ${CompanyId}`,
      };
    }

    const object = [];
    for (const item of result) {
      const data = await LabourName.findOne({
        WorkerId: item.WorkerId,
      });
      object.push({ ...item.toObject(), WorkerId: data });
    }

    return {
      statusCode: 200,
      message: `Data fetched successfully`,
      result: object,
    };
  } catch (error) {
    return {
      statusCode: 404,
      message: "Failed to fetch data.",
      error: error.message,
    };
  }
};
router.get("/:ContractId/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { ContractId, CompanyId } = req.params;
    const response = await fetchExpenseData(ContractId, CompanyId);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//------------------------GET Expenses--------------------------

const getExpenseData = async (ExpenseId, ContractId) => {
  if (!ExpenseId || !ContractId) {
    return {
      statusCode: 400,
      message: "ExpenseId and ContractId are required!",
    };
  }

  const labourData = await Expenses.findOne({
    ExpenseId,
    ContractId,
    IsDelete: false,
  });

  if (labourData) {
    return {
      statusCode: 200,
      data: labourData,
      message: "Data retrieved successfully.",
    };
  } else {
    return {
      statusCode: 404,
      message: "No data found for the given ExpenseId and ContractId.",
    };
  }
};

router.get(
  "/expenses/:ExpenseId/:ContractId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { ExpenseId, ContractId } = req.params;
      const result = await getExpenseData(ExpenseId, ContractId);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//------------------------DELETE EXPENSES-------------------------------------
router.put("/:ExpenseId/:ContractId", verifyLoginToken, async (req, res) => {
  const { ExpenseId, ContractId } = req.params;
  const updateData = req.body;

  try {
    const updateLabour = await Expenses.findOneAndUpdate(
      { ExpenseId, ContractId },
      {
        $set: {
          ...updateData,
          updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updateLabour) {
      return res.status(404).json({
        statusCode: 404,
        message: "Labour not found.",
      });
    }
    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: req.CompanyId,
      Action: "UPDATE",
      Entity: "Expense",
      EntityId: ExpenseId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Updated a Expense ${updateData.ItemName} `,
      },
      Reason: "Expense updating",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return res.status(200).json({
      statusCode: 200,
      message: "Labour updated successfully.",
      data: updateLabour,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});


//-------------------------------------------------------------------------------------

const deleteExpenseData = async (ExpenseId, ContractId, DeleteReason, req) => {
  try {
    const updatedExpense = await Expenses.findOneAndUpdate(
      { ExpenseId, ContractId },
      {
        $set: {
          IsDelete: true,
          DeleteReason,
          updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return {
        statusCode: 404,
        message: `No Expense found`,
      };
    }
    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: req.CompanyId,
      Action: "DELETE",
      Entity: "Expense",
      EntityId: updatedExpense.ExpenseId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Deleted a Expense ${updatedExpense.ItemName}`,
      },
      Reason: req.body.DeleteReason,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      message: `Expense deleted successfully.`,
      data: updatedExpense,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Failed to soft delete Expense data.",
      error: error.message,
    };
  }
};
router.delete("/:ExpenseId/:ContractId", verifyLoginToken, async (req, res) => {
  try {
    const { DeleteReason } = req.body;
    const { ExpenseId, ContractId } = req.params;
    const response = await deleteExpenseData(
      ExpenseId,
      ContractId,
      DeleteReason,
      req
    );
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

module.exports = router;

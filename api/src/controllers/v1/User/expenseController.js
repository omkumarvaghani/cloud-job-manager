const Expense = require("../../../models/User/Expense");
const { logUserEvent } = require("../../../middleware/eventMiddleware");
const moment = require("moment");

//**CREATE EXPENSE IN CONTRACT**
exports.createExpense = async (req, res) => {
    const data = req.body;
    data["createdAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
    data["updatedAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

    try {
        const createdExpense = await Expense.create(data);

        await logUserEvent(data.CompanyId, "CREATE", "Expense record created", createdExpense);
        return res.status(200).json({
            statusCode: 200,
            message: "Expense uploaded successfully",
            data: createdExpense,
        });
    } catch (error) {
        return {
            statusCode: 404,
            message: "Failed to create expense.",
            error: error.message,
        };
    }
};

//**GET EXPENSE IN CONTRACT**
exports.getExpenseData = async (req, res) => {
    const { ExpenseId, ContractId } = req.params;

    if (!ExpenseId || !ContractId) {
        return {
            statusCode: 400,
            message: "ExpenseId and ContractId are required!",
        };
    }

    const expenseData = await Expense.findOne({
        ExpenseId,
        ContractId,
        IsDelete: false,
    });

    if (expenseData) {
        return res.status(200).json({
            statusCode: 200,
            data: expenseData,
            message: "Data retrieved successfully.",
        });
    } else {
        return res.status(404).json({
            statusCode: 404,
            message: "No data found for the given ExpenseId and ContractId.",
        });
    }
};

//**GET EXPENSE IN CONTRACT**
exports.fetchExpenseData = async (req, res) => {
    try {
        const { ContractId, CompanyId } = req.params;

        const result = await Expense.aggregate([
            {
                $match: {
                    ContractId,
                    CompanyId,
                    IsDelete: false,
                }
            },
            {
                $lookup: {
                    from: "user-profiles",
                    localField: "WorkerId",
                    foreignField: "UserId",
                    as: "WorkerDetails"
                }
            },
            {
                $unwind: {
                    path: "$WorkerDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    "Worker": {
                        FirstName: "$WorkerDetails.FirstName",
                        LastName: "$WorkerDetails.LastName"
                    }
                }
            },
            {
                $project: {
                    WorkerDetails: 0
                }
            }
        ]);

        if (!result || result.length === 0) {
            return res.status(204).json({
                statusCode: 204,
                message: `No data found for ContractId: ${ContractId} and CompanyId: ${CompanyId}`,
            });
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Data fetched successfully",
            result
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "Failed to fetch data.",
            error: error.message
        });
    }
};

//**UPDATE EXPENSE IN CONTRACT**
exports.updateExpense = async (req, res) => {
    const { ExpenseId, ContractId } = req.params;
    const updateData = req.body;

    try {
        const updateLabour = await Expense.findOneAndUpdate(
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
        await logUserEvent(
            updateLabour.CompanyId,
            "UPDATE",
            "Expense updated",
            updateLabour
        );

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
};

//**DELETE EXPENSE IN CONTRACT**
exports.deleteExpenseData = async (req, res) => {
    try {
        const { ExpenseId, ContractId } = req.params;
        const { DeleteReason } = req.body;
        const updatedExpense = await Expense.findOneAndUpdate(
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
            return res.status(404).json({
                statusCode: 404,
                message: `No Expense found`,
            });
        }
        await logUserEvent(
            updatedExpense.CompanyId,
            "DELETE",
            "Expense deleted",
            {
                ExpenseId: updatedExpense.ExpenseId,
                ContractId,
                DeleteReason,
            }
        );

        return res.status(200).json({
            statusCode: 200,
            message: `Expense deleted successfully.`,
            data: updatedExpense,
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "Failed to delete Expense data.",
            error: error.message,
        });
    }
};
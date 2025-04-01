const Labour = require("../../../models/User/Labour");
const { logUserEvent } = require("../../../middleware/eventMiddleware");
const moment = require("moment");
const User = require("../../../models/User/User");

//**CREATE LABOUR**
exports.createLabour = async (req, res) => {
    try {
        const data = req.body;
        console.log(data, 'data')
        if (!data.CompanyId) {
            return res.status(400).json({
                statusCode: 400,
                message: "CompanyId is required",
            });
        }

        const userToSave = await Labour.create(data);

        await logUserEvent(data.CompanyId, "CREATE", "Labour record created", { LabourId: userToSave.LabourId });

        return res.status(200).json({
            statusCode: 200,
            message: "Labour Created Successfully",
            data: userToSave,
        });

    } catch (error) {
        console.error("Error Creating Labour:", error.message);
        return res.status(400).json({
            statusCode: 400,
            message: "Failed to create labour.",
            error: error.message,
        });
    }
};

//**GET LABOUR**
exports.fetchLabourData = async (req, res) => {
    try {
        const { ContractId, CompanyId } = req.params;

        const result = await Labour.aggregate([
            {
                $match: {
                    ContractId: ContractId,
                    CompanyId: CompanyId,
                    IsDelete: false
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
                    Worker: {
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
                message: `No data found for ContractId: ${ContractId} and CompanyId: ${CompanyId}`
            });
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Labour data fetched successfully",
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "Failed to fetch labour data.",
            error: error.message
        });
    }
};


exports.getLabourData = async (req, res) => {
    const { LabourId, ContractId } = req.params;

    if (!LabourId || !ContractId) {
        return res.status(400).json({
            statusCode: 400,
            message: "LabourId and ContractId are required!",
        });
    }

    const labourData = await Labour.findOne({
        LabourId,
        ContractId,
        IsDelete: false,
    });

    if (labourData) {
        return res.status(200).json({
            statusCode: 200,
            data: labourData,
            message: "Data retrieved successfully.",
        });
    } else {
        return res.status(404).json({
            statusCode: 404,
            message: "No data found for the given LabourId and ContractId.",
        });
    }
};


//**UPDATE LABOUR**
exports.updateLabour = async (req, res) => {
    try {
        const { LabourId, ContractId } = req.params;
        const updateData = req.body;
        const updatedLabour = await Labour.findOneAndUpdate(
            { LabourId, ContractId },
            {
                $set: {
                    ...updateData,
                    updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
                },
            },
            { new: true, runValidators: true }
        );

        if (!updatedLabour) {
            return res.status(200).json({
                statusCode: 404,
                message: "Labour not found.",
            });
        }
        await logUserEvent(req.user.UserId, "UPDATE", `Labour with ID ${LabourId} for contract ${ContractId} updated.`, {
            LabourId: updatedLabour.LabourId,
            ContractId: updatedLabour.ContractId,
            updateData,
        });
        return res.status(200).json({
            statusCode: 200,
            message: "Labour updated successfully.",
            data: updatedLabour,
        });
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            message: "Internal Server Error",
        };
    }
};

//**DELETE LABOUR**
exports.deleteLabourData = async (req, res) => {
    try {
        const { LabourId, ContractId } = req.params;
        const { DeleteReason } = req.body;

        const updatedLabour = await Labour.findOneAndUpdate(
            { LabourId, ContractId },
            {
                $set: {
                    IsDelete: true,
                    DeleteReason,
                    updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
                },
            },
            { new: true, runValidators: true }
        );

        if (!updatedLabour) {
            return res.status(404).json({
                statusCode: 404,
                message: `No labour found`,
            });
        }
        await logUserEvent(req.user.UserId, "DELETE", `Labour data with ID ${LabourId} deleted.`, {
            LabourId,
            ContractId,
            DeleteReason: DeleteReason || "No reason provided",
        });

        return res.status(200).json({
            statusCode: 200,
            message: `Labour deleted successfully.`,
            data: updatedLabour,
        });
    } catch (error) {
        return {
            statusCode: 500,
            message: "Failed to soft delete labour data.",
            error: error.message,
        };
    }
};

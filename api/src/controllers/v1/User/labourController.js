const Labour = require("../../../models/User/Labour");
const { logUserEvent } = require("../../../middleware/eventMiddleware");
const moment = require("moment");
const User = require("../../../models/User/User");

//**CREATE LABOUR**
exports.createLabour = async (req, res) => {

    try {
        const data = req.body;
        const userToSave = await Labour.create(data);
        await logUserEvent(CompanyId, "CREATE", "Labour record created", { LabourId: userToSave.LabourId });
        return res.status(200).json({
            statusCode: 200,
            message: "Labour Created Successfully",
            data: userToSave,
        });
    } catch (error) {
        return {
            statusCode: 400,
            message: "Failed to create labour.",
            error: error.message,
        };
    }
};

//**CREATE LABOUR**
exports.fetchLabourData = async (req, res) => {
    try {
        const { ContractId, CompanyId } = req.params;

        const result = await Labour.find({
            ContractId,
            CompanyId,
            IsDelete: false,
        });

        if (!result || result.length === 0) {
            return {
                statusCode: 204,
                message: `No data found for ContractId and CompanyId.`,
            };
        }

        const object = [];
        for (const item of result) {
            const data = await User.findOne({
                WorkerId: item.UserId,
                Role: "Worker",
                IsDelete: false,
            });
            object.push({ ...item.toObject(), WorkerId: data });
        }

        return res.status(200).json({
            statusCode: 200,
            message: `Data fetched successfully`,
            data: object,
        });
    } catch (error) {
        return {
            statusCode: 400,
            message: "Failed to fetch data.",
            error: error.message,
        };
    }
};
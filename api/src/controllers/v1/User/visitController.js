const { logUserEvent } = require("../../../middleware/eventMiddleware");
const Visit = require("../../../models/User/Visit");
const convertLocalToUTC = require("../../../Utills/DateFunction");
const moment = require("moment");

//**CREATE VISIT**
exports.createVisit = async (req, res) => {
    const data = req.body;

    if (!Array.isArray(data.WorkerId)) {
        data.WorkerId = [data.WorkerId];
    }
    if (data.StartDate) {
        data.StartDate = convertLocalToUTC(data.StartDate);
    }
    if (data.EndDate) {
        data.EndDate = convertLocalToUTC(data.EndDate);
    }

    try {
        const createdVisit = await Visit.create(data);
        await logUserEvent(
            req.user.UserId,
            "CREATE",
            `Visit created with ID ${createdVisit.VisitId}.`,
            createdVisit,
        );
        return res.status(200).json({
            statusCode: 200,
            message: "Visit created successfully.",
            data: createdVisit,
        });
    } catch (error) {
        return res.status(400).json({
            statusCode: 400,
            message: "Failed to create visit.",
            error: error.message,
        });
    }
};

//**GET VISIT**
exports.getVisits = async (req, res) => {
    const { CompanyId } = req.params;

    const schedule = await Visit.find({
        CompanyId,
        IsDelete: false,
    });

    if (!schedule || schedule.length === 0) {
        return {
            statusCode: 204,
            message: "No visits found.",
        };
    }

    return res.status(200).json({
        statusCode: 200,
        data: schedule,
        message: "Data retrieved successfully.",
    });
};

//**GET SPECIFIC VISIT DATA**
exports.getVisitsData = async (req, res) => {
    const { VisitId, ContractId } = req.params;

    if (!VisitId || !ContractId) {
        return res.status(400).json({
            statusCode: 400,
            message: "VisitId and ContractId are required!",
        });
    }

    const visitData = await Visit.findOne({
        VisitId,
        ContractId,
        IsDelete: false,
    });

    if (!visitData) {
        return res.status(404).json({
            statusCode: 404,
            message: "No data found for the given VisitId and ContractId.",
        });
    }

    return res.status(200).json({
        statusCode: 200,
        data: visitData,
        message: "Data retrieved successfully.",
    });
};

//**GET VISIT FOR SCHEDULE**
exports.getVisitSchedule = async (req, res) => {
    try {
        const { CompanyId } = req.params;

        const contracts = await Visit.aggregate([
            {
                $match: {
                    CompanyId: CompanyId,
                    IsDelete: false,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "UserId",
                    foreignField: "UserId",
                    as: "CustomerData",
                },
            },
            {
                $lookup: {
                    from: "locations",
                    localField: "LocationId",
                    foreignField: "LocationId",
                    as: "LocationData",
                },
            },
            {
                $lookup: {
                    from: "contracts",
                    localField: "ContractId",
                    foreignField: "ContractId",
                    as: "ContractData",
                },
            },
            {
                $unwind: {
                    path: "$CustomerData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$LocationData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$ContractData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    ItemName: 1,
                    Note: 1,
                    VisitId: 1,
                    ContractId: 1,
                    StartDate: 1,
                    EndDate: 1,
                    StartTime: 1,
                    EndTime: 1,
                    FirstName: "$CustomerData.FirstName",
                    LastName: "$CustomerData.LastName",
                    Address: "$LocationData.Address",
                    City: "$LocationData.City",
                    State: "$LocationData.State",
                    Zip: "$LocationData.Zip",
                    Country: "$LocationData.Country",
                    ContractNumber: "$ContractData.ContractNumber",
                },
            }
        ]);
        return res.status(200).json({
            statusCode: 200,
            data: contracts,
            message: "Read All Contracts and Visits",
        });
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            message: "Something went wrong, please try later!",
        };
    }
};

//**GET VISIT IN CONTRACT BY CONTRACT ID**
exports.getVisitDetails = async (req, res) => {
    try {
        const { ContractId, CompanyId } = req.params;

        const result = await Visit.aggregate([
            {
                $match: {
                    ContractId,
                    CompanyId,
                    IsDelete: false,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "WorkerId",
                    foreignField: "UserId",
                    as: "UserDetails",
                },
            },
            {
                $unwind: {
                    path: "$UserDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    "UserDetails.Role": "Worker",
                },
            },
            {
                $lookup: {
                    from: "user-profiles",
                    localField: "UserDetails.UserId",
                    foreignField: "UserId",
                    as: "ProfileDetails",
                },
            },
            {
                $unwind: {
                    path: "$ProfileDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $group: {
                    _id: "$_id",
                    VisitId: { $first: "$VisitId" },
                    ContractId: { $first: "$ContractId" },
                    WorkerId: { $first: "$WorkerId" },
                    UserId: { $first: "$UserDetails.UserId" },
                    ItemName: { $first: "$ItemName" },
                    Note: { $first: "$Note" },
                    StartDate: { $first: "$StartDate" },
                    EndDate: { $first: "$EndDate" },
                    AssignPersons: { $push: { $concat: ["$ProfileDetails.FirstName", " ", "$ProfileDetails.LastName"] } },
                    IsConfirm: { $first: "$IsConfirm" },
                    IsConfirmByWorker: { $first: "$IsConfirmByWorker" },
                    IsComplete: { $first: "$IsComplete" },
                },
            },
            {
                $project: {
                    VisitId: 1,
                    ContractId: 1,
                    WorkerId: 1,
                    UserId: 1,
                    ItemName: 1,
                    Note: 1,
                    StartDate: 1,
                    EndDate: 1,
                    AssignPersons: 1,
                    IsConfirm: 1,
                    IsConfirmByWorker: 1,
                    IsComplete: 1,
                },
            },
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const Today = result.filter((visit) => new Date(visit.StartDate).getTime() === today.getTime());
        const Upcoming = result.filter((visit) => new Date(visit.StartDate) > today);
        const Past = result.filter((visit) => new Date(visit.StartDate) < today);

        Today.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
        Upcoming.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
        Past.sort((a, b) => new Date(b.StartDate) - new Date(a.StartDate));

        const sortedVisits = [...Today, ...Upcoming, ...Past];

        if (!result || result.length === 0) {
            return res.status(204).json({
                statusCode: 204,
                message: "No data found for ContractId and CompanyId.",
            });
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Data fetched successfully",
            data: sortedVisits,
        });
    } catch (error) {
        return {
            statusCode: 400,
            message: "Failed to fetch data.",
            error: error.message,
        };
    }
};

//**GET CONTRACT SCHEDULE DATA**
exports.getContractScheduleData = async (req, res) => {
    try {
        const { CompanyId } = req.params;

        const contracts = await Visit.aggregate([
            {
                $match: {
                    CompanyId: CompanyId,
                    IsDelete: false,
                },
            },
            {
                $lookup: {
                    from: "user-profiles",
                    localField: "UserId",
                    foreignField: "UserId",
                    as: "CustomerData",
                },
            },
            // {
            //   $lookup: {
            //     from: "visits",
            //     localField: "ContractId",
            //     foreignField: "ContractId",
            //     as: "contractData",
            //   },
            // },
            {
                $lookup: {
                    from: "locations",
                    localField: "LocationId",
                    foreignField: "LocationId",
                    as: "LocationData",
                },
            },
            {
                $unwind: {
                    path: "$CustomerData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $unwind: {
                    path: "$LocationData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // {
            //   $unwind: {
            //     path: "$contractData",
            //     preserveNullAndEmptyArrays: true,
            //   },
            // },
            {
                $project: {
                    ItemName: 1,
                    Note: 1,
                    VisitId: 1,
                    ContractId: 1,
                    StartDate: 1,
                    StartTime: 1,
                    Status: 1,
                    // ContractId: "$contractData.ContractId",
                    // ContractNumber: "$contractData.ContractNumber",
                    FirstName: "$CustomerData.FirstName",
                    LastName: "$CustomerData.LastName",
                    Address: "$LocationData.Address",
                    City: "$LocationData.City",
                    State: "$LocationData.State",
                    Zip: "$LocationData.Zip",
                    Country: "$LocationData.Country",
                    // Visits: 1,
                },
            },
        ]);
        return res.status(200).json({
            statusCode: 200,
            data: contracts,
            message: "Read All Contracts and Visits",
        });
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            message: "Something went wrong, please try later!",
        };
    }
};

//**VISIT CONFIRM**
exports.confirmVisits = async (req, res) => {
    const { VisitId, ContractId } = req.params;

    try {
        const updatedVisit = await Visit.findOneAndUpdate(
            { VisitId, ContractId, IsDelete: false },
            {
                $set: {
                    IsConfirm: true,
                    updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
                },
            },
            { new: true, runValidators: true }
        );

        if (!updatedVisit) {
            return res.status(404).json({
                statusCode: 404,
                message: "Visit not found.",
            });
        }
        await logUserEvent(
            req.user.CompanyId,
            "UPDATE",
            `Visit confirmed for VisitId: ${VisitId}`,
            { ContractId, VisitId }
        );
        return res.status(200).json({
            statusCode: 200,
            message: "Visit updated successfully.",
            data: updatedVisit,
        });
    } catch (error) {
        console.error("Error updating visit:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

//**VISIT CONFIRM BY WORKER**
exports.confirByWorker = async (req, res) => {
    const { VisitId, ContractId } = req.params;
    const updateData = req.body;

    try {
        const updatedVisit = await Visit.findOneAndUpdate(
            { VisitId, ContractId, IsDelete: false },
            {
                $set: {
                    IsConfirmByWorker: true,
                    IsConfirm: true,
                    updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
                },
                $addToSet: { ConfirmWorker: updateData.WorkerId },
            },
            { new: true, runValidators: true }
        );

        if (!updatedVisit) {
            return res.status(404).json({
                statusCode: 404,
                message: "Visit not found.",
            });
        }
        await logUserEvent(
            req.user.CompanyId,
            "UPDATE",
            `Visit confirmed by Worker for VisitId: ${VisitId}`,
            { ContractId, VisitId, WorkerId: updateData.WorkerId }
        );
        return res.status(200).json({
            statusCode: 200,
            message: "Visit confirmed successfully.",
            data: updatedVisit,
        });
    } catch (error) {
        console.error("Error confirming visit:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

//**VISIT UPDATE**
exports.updateVisitData = async (req, res) => {
    const { VisitId, ContractId } = req.params;
    const { WorkerId, ...updateData } = req.body;

    try {
        let assignPersonArray = WorkerId;
        if (!Array.isArray(assignPersonArray)) {
            assignPersonArray = [WorkerId];
        }

        const updatedVisit = await Visit.findOneAndUpdate(
            { VisitId, ContractId },
            {
                $set: {
                    ...updateData,
                    WorkerId: assignPersonArray,
                    updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
                },
            },
            { new: true, runValidators: true }
        );

        if (!updatedVisit) {
            return res.status(404).json({
                statusCode: 404,
                message: "Visit not found.",
            });
        }
        await logUserEvent(req.user.UserId, "UPDATE", `Visit with ID ${VisitId} updated.`, {
            VisitId,
            ContractId,
            WorkerId: assignPersonArray,
            UpdateData: updateData,
        });

        return res.status(200).json({
            statusCode: 200,
            message: "Visit updated successfully.",
            data: updatedVisit,
        });
    } catch (error) {
        console.error("Error during update:", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

//**DELETE VISIT**
exports.deleteVisitData = async (req, res) => {
    try {
        const { VisitId, ContractId } = req.params;
        const { DeleteReason } = req.body;

        const updatedVisit = await Visit.findOneAndUpdate(
            { VisitId, ContractId },
            {
                $set: {
                    IsDelete: true,
                    DeleteReason,
                    updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
                },
            },
            { new: true, runValidators: true }
        );

        if (!updatedVisit) {
            return {
                statusCode: 404,
                message: `No Visit found `,
            };
        }
        await logUserEvent(
            req.user.CompanyId,
            "DELETE",
            `Visit deleted for VisitId: ${VisitId}`,
            { ContractId, VisitId, DeleteReason }
        );
        return res.status(200).json({
            statusCode: 200,
            message: `Visit deleted successfully.`,
            data: updatedVisit,
        });
    } catch (error) {
        return {
            statusCode: 500,
            message: "Failed to soft delete Visit data.",
            error: error.message,
        };
    }
};

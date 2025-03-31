const User = require("../../../models/User/User");

//**GET ALL WORKER FOR COMPANY**
exports.getAllWorkers = async (req, res) => {
    try {
        const { CompanyId } = req.user;

        if (!CompanyId) {
            return res.status(400).json({
                statusCode: 400,
                message: "CompanyId is required",
            });
        }

        const workers = await User.aggregate([
            {
                $match: {
                    CompanyId: CompanyId,
                    Role: "Worker",
                    IsDelete: false,
                },
            },
            {
                $lookup: {
                    from: "user-profiles",
                    localField: "UserId",
                    foreignField: "UserId",
                    as: "profile",
                },
            },
            {
                $unwind: {
                    path: "$profile",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    UserId: 1,
                    EmailAddress: 1,
                    FirstName: "$profile.FirstName",
                    LastName: "$profile.LastName",
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
            { $sort: { createdAt: -1 } },
        ]);

        return res.status(200).json({
            statusCode: 200,
            message: "Workers retrieved successfully",
            data: workers,
        });

    } catch (error) {
        console.error("Error fetching workers:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
            error: error.message,
        });
    }
};

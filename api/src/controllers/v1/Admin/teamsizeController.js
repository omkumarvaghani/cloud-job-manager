const TeamSize = require("../../../models/Admin/TeamSize");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

// **Add TeamSize Function**
exports.addTeamSize = async (req, res) => {
    try {
        const { TeamSize: teamSize } = req.body;

        if (!teamSize) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "TeamSize name is required",
            });
        }

        const existingTeamSize = await TeamSize.findOne({
            TeamSize: { $regex: new RegExp("^" + teamSize + "$", "i") },
            IsDelete: false,
        });

        if (existingTeamSize) {
            return res.status(409).json({
                status: false,
                statusCode: 409,
                message: `${teamSize} already exists`,
            });
        }

        const newTeamSize = new TeamSize({
            TeamSizeId: uuidv4(),
            TeamSize: teamSize,
            IsDelete: false,
            createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
            updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        });

        await newTeamSize.save();

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: "TeamSize added successfully",
        });
    } catch (error) {
        console.error("Error adding TeamSize:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **Get TeamSizes Function**
exports.getTeamSizes = async (req, res) => {
    try {
        const { searchQuery, sortField, sortOrder, pageSize, pageNumber } = req.query;

        let query = { IsDelete: false };

        if (searchQuery) {
            query = {
                $or: [
                    { TeamSize: { $regex: searchQuery, $options: "i" } },
                    { updatedAt: { $regex: searchQuery, $options: "i" } },
                ],
            };
        }

        let sortOptions = {};
        if (sortField) {
            sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
        }

        const totalDataCount = await TeamSize.countDocuments(query);
        const data = await TeamSize.find(query)
            .sort(sortOptions)
            .skip(pageNumber * pageSize)
            .limit(parseInt(pageSize) || 10);

        return res.status(200).json({
            statusCode: 200,
            data,
            count: totalDataCount,
        });
    } catch (error) {
        console.error("Error fetching TeamSizes:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **Update TeamSize Function**
exports.updateTeamSize = async (req, res) => {
    try {
        const { TeamSizeId } = req.params;
        const updateData = req.body;

        if (!updateData.TeamSize) {
            return res.status(400).json({
                statusCode: 400,
                message: "TeamSize is required",
            });
        }

        const existingTeamSize = await TeamSize.findOne({
            TeamSize: {
                $regex: new RegExp("^" + updateData.TeamSize + "$", "i"),
            },
            IsDelete: false,
        });

        if (existingTeamSize) {
            return res.status(409).json({
                statusCode: 409,
                message: `${updateData.TeamSize} name already exists`,
            });
        }

        updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

        const result = await TeamSize.findOneAndUpdate(
            { TeamSizeId: TeamSizeId, IsDelete: false },
            { $set: updateData },
            { new: true }
        );

        if (result) {
            return res.status(200).json({
                statusCode: 200,
                message: "TeamSize updated successfully",
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: "TeamSize not found",
            });
        }
    } catch (error) {
        console.error("Error updating TeamSize:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **Delete TeamSize Function**
exports.deleteTeamSize = async (req, res) => {
    try {
        const { TeamSizeId } = req.params;

        const result = await TeamSize.findOneAndUpdate(
            { TeamSizeId: TeamSizeId },
            { $set: { IsDelete: true } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                statusCode: 404,
                message: "TeamSize not found",
            });
        }

        return res.status(200).json({
            statusCode: 200,
            message: "TeamSize Deleted Successfully",
        });
    } catch (error) {
        console.error("Error deleting TeamSize:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **Get All TeamSizes for Dropdown (Company Signup)**
exports.getTeamSizesDropdown = async (req, res) => {
    try {
        const data = await TeamSize.find({ IsDelete: false }).sort({ createdAt: -1 });

        return res.status(200).json({
            statusCode: 200,
            data: data,
            message: "TeamSizes fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching TeamSizes:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

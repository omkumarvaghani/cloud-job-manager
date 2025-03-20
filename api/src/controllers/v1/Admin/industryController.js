const Industry = require("../../../models/Admin/Industry");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

// **Add Industry Function**
exports.addIndustry = async (req, res) => {
    try {
        const industry = req.body;

        const existingIndustry = await Industry.findOne({
            industry: {
                $regex: new RegExp("^" + industry.industry + "$", "i"),
            },
            IsDelete: false,
        });

        if (existingIndustry) {
            return res.status(409).json({
                status: false,
                statusCode: 409,
                message: `${industry.industry} already exists`,
            });
        }

        industry.IndustryId = uuidv4();
        industry.createdAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
        industry.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

        await Industry.create(industry);

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Industry added successfully",
        });
    } catch (error) {
        console.error("Error adding Industry:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **Get Industries Function**
exports.getIndustries = async (req, res) => {
    try {
        const { searchQuery, sortField, sortOrder, pageSize, pageNumber } = req.query;

        let query = { IsDelete: false };

        if (searchQuery) {
            query = {
                $or: [
                    { industry: { $regex: searchQuery, $options: "i" } },
                    { updatedAt: { $regex: searchQuery, $options: "i" } },
                ],
            };
        }

        let sortOptions = {};
        if (sortField) {
            sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
        }

        const totalDataCount = await Industry.countDocuments(query);
        const data = await Industry.find(query)
            .sort(sortOptions)
            .skip(pageNumber * pageSize)
            .limit(parseInt(pageSize) || 10);

        return res.status(200).json({
            statusCode: 200,
            data,
            count: totalDataCount,
        });
    } catch (error) {
        console.error("Error fetching Industries:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};
// **Update Industry Function**
exports.updateIndustry = async (req, res) => {
    try {
        const { IndustryId } = req.params;
        const updateData = req.body;

        updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

        const result = await Industry.findOneAndUpdate(
            { IndustryId: IndustryId, IsDelete: false },
            { $set: updateData },
            { new: true }
        );

        if (result) {
            return res.status(200).json({
                statusCode: 200,
                message: "Industry updated successfully",
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: "Industry not found",
            });
        }
    } catch (error) {
        console.error("Error updating Industry:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **Delete Industry Function**
exports.deleteIndustry = async (req, res) => {
    try {
        const { IndustryId } = req.params;

        const result = await Industry.findOneAndUpdate(
            { IndustryId: IndustryId },
            { $set: { IsDelete: true } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                statusCode: 404,
                message: "Industry not found",
            });
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Industry Deleted Successfully",
        });
    } catch (error) {
        console.error("Error deleting Industry:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **Get All Industries (For Dropdown)**
exports.getIndustrie = async (req, res) => {
    try {
        const data = await Industry.find({ IsDelete: false }).sort({ createdAt: -1 });
        return res.status(200).json({
            statusCode: 200,
            data: data,
            message: "Read All Industries",
        });
    } catch (error) {
        console.error("Error fetching Industries:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};


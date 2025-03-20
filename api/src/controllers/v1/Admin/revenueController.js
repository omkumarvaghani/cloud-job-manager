const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const Revenues = require("../../../models/Admin/Revenue");

// **Add Revenue Function**
exports.addRevenue = async (req, res) => {
    try {
        const { Revenue } = req.body;

        if (!Revenue) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "Revenue name is required",
            });
        }

        const existingRevenue = await Revenues.findOne({
            Revenue: { $regex: new RegExp("^" + Revenue + "$", "i") },
            IsDelete: false,
        });

        if (existingRevenue) {
            return res.status(409).json({
                status: false,
                statusCode: 409,
                message: `${Revenue} already exists`,
            });
        }

        const newRevenue = new Revenues({
            RevenueId: uuidv4(),
            Revenue: Revenue,
            IsDelete: false,
        });

        await newRevenue.save();

        return res.status(201).json({
            status: true,
            statusCode: 201,
            message: "Revenue added successfully",
        });
    } catch (error) {
        console.error("Error adding Revenue:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **Get Revenues Function**
exports.getRevenues = async (req, res) => {
    try {
        const { searchQuery, sortField, sortOrder, pageSize, pageNumber } = req.query;

        let query = { IsDelete: false };

        if (searchQuery) {
            query = {
                $or: [
                    { revenue: { $regex: searchQuery, $options: "i" } },
                    { updatedAt: { $regex: searchQuery, $options: "i" } },
                ],
            };
        }

        let sortOptions = {};
        if (sortField) {
            sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
        }

        const totalDataCount = await Revenues.countDocuments(query);
        const data = await Revenues.find(query)
            .sort(sortOptions)
            .skip(pageNumber * pageSize)
            .limit(parseInt(pageSize) || 10);

        return res.status(200).json({
            statusCode: 200,
            data,
            count: totalDataCount,
        });
    } catch (error) {
        console.error("Error fetching Revenues:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **Update Revenue Function**
exports.updateRevenue = async (req, res) => {
    try {
        const { RevenueId } = req.params;
        const updateData = req.body;

        if (!updateData.Revenue) {
            return res.status(400).json({
                statusCode: 400,
                message: "Revenue is required",
            });
        }

        const existingRevenue = await Revenues.findOne({
            Revenue: {
                $regex: new RegExp("^" + updateData.revenue + "$", "i"),
            },
            IsDelete: false,
        });

        if (existingRevenue) {
            return res.status(409).json({
                statusCode: 409,
                message: `${updateData.revenue} name already exists`,
            });
        }

        updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

        const result = await Revenues.findOneAndUpdate(
            { RevenueId: RevenueId, IsDelete: false },
            { $set: updateData },
            { new: true }
        );

        if (result) {
            return res.status(200).json({
                statusCode: 200,
                message: "Revenue updated successfully",
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: "Revenue not found",
            });
        }
    } catch (error) {
        console.error("Error updating Revenue:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **Delete Revenue Function**
exports.deleteRevenue = async (req, res) => {
    try {
        const { RevenueId } = req.params;

        const result = await Revenues.findOneAndUpdate(
            { RevenueId: RevenueId },
            { $set: { IsDelete: true } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                statusCode: 404,
                message: "Revenue not found",
            });
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Revenue Deleted Successfully",
        });
    } catch (error) {
        console.error("Error deleting Revenue:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};


// **Get All Revenues for Dropdown (Company Signup)**
exports.getAllRevenue = async (req, res) => {
    try {
        const data = await Revenues.find({ IsDelete: false }).sort({ createdAt: -1 });

        return res.status(200).json({
            statusCode: 200,
            data: data,
            message: "Revenues fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching Revenues:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};


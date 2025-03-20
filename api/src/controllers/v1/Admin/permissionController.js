const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const Permission = require("../../../models/Admin/Permission");

// **Create Permission Function**
exports.addPermission = async (req, res) => {
    try {
        const { Title } = req.body;

        if (!Title) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "Title is required",
            });
        }

        const existingPermission = await Permission.findOne({
            Title,
            IsDelete: false,
        });

        if (existingPermission) {
            return res.status(409).json({
                status: false,
                statusCode: 409,
                message: `Permission with title '${Title}' already exists`,
            });
        }

        const permission = new Permission({
            PermissionId: uuidv4(),
            Title,
            createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
            updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        });

        await permission.save();

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Permission added successfully",
        });
    } catch (error) {
        console.error("Error adding Permission:", error.message);
        return res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **Get Permission Function**
exports.getPermission = async (req, res) => {
    try {
        const { PermissionId } = req.params;

        const permission = await Permission.findOne({
            PermissionId,
            IsDelete: false,
        });

        if (!permission) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: `Permission with ID '${PermissionId}' not found`,
            });
        }

        return res.status(200).json({
            status: true,
            statusCode: 200,
            data: permission,
        });
    } catch (error) {
        console.error("Error fetching Permission:", error);
        return res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Internal Server Error",
        });
    }
};

// **Get All Permissions Function**
exports.getPermissions = async (req, res) => {
    try {
        const { pageSize = 10, pageNumber = 0, search = '', sortField = 'createdAt', sortOrder = 'desc' } = req.query;


        const sortOrderValue = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
        const allowedSortFields = ['Title', 'createdAt', 'updatedAt'];

        const sortFieldValue = allowedSortFields.includes(sortField) ? sortField : 'createdAt';

        const collation = { locale: 'en', strength: 2 };
        let query = { IsDelete: false };

        if (search) {
            query.$or = [
                { Title: { $regex: search, $options: 'i' } },
                { Description: { $regex: search, $options: 'i' } },
            ];
        }


        const totalDataCount = await Permission.countDocuments(query);

        const permissions = await Permission.find(query)
            .sort({ [sortFieldValue]: sortOrderValue })
            .skip(pageNumber * pageSize)
            .limit(Number(pageSize))
            .collation(collation);

        return res.status(200).json({
            status: true,
            statusCode: 200,
            data: permissions,
            count: totalDataCount,
        });
    } catch (error) {
        console.error("Error fetching permissions:", error);
        return res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Internal Server Error",
        });
    }
};

// **Update Permission Function**
exports.updatePermission = async (req, res) => {
    try {
        const { PermissionId } = req.params;
        const updatedTitle = req.body.Title?.trim();

        if (!updatedTitle) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: "Title is required for update",
            });
        }

        const existingPermission = await Permission.findOne({
            Title: updatedTitle,
            IsDelete: false,
        });

        if (existingPermission) {
            return res.status(409).json({
                status: false,
                statusCode: 409,
                message: `Permission with title '${updatedTitle}' already exists`,
            });
        }

        const permission = await Permission.findOneAndUpdate(
            { PermissionId, IsDelete: false },
            { Title: updatedTitle, updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss") },
            { new: true }
        );

        if (!permission) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: `Permission with ID '${PermissionId}' not found`,
            });
        }

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Permission updated successfully",
            data: permission,
        });
    } catch (error) {
        console.error("Error updating Permission:", error);
        return res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Internal Server Error",
        });
    }
};

// **Delete Permission Function**
exports.deletePermission = async (req, res) => {
    try {
        const { PermissionId } = req.params;

        const permission = await Permission.findOneAndUpdate(
            { PermissionId, IsDelete: false },
            { IsDelete: true, updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss") },
            { new: true }
        );

        if (!permission) {
            return res.status(404).json({
                status: false,
                statusCode: 404,
                message: `Permission with ID '${PermissionId}' not found`,
            });
        }

        return res.status(200).json({
            status: true,
            statusCode: 200,
            message: "Permission deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting Permission:", error);
        return res.status(500).json({
            status: false,
            statusCode: 500,
            message: "Internal Server Error",
        });
    }
};


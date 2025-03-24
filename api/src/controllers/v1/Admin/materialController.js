const MaterialsAndLabor = require("../../../models/Admin/Material&Labor");
const { logUserEvent } = require("../../../middleware/eventMiddleware");
const moment = require("moment");

// **POST MATERIAL AND LABORS**
exports.handleMaterialsAndLabor = async (req, res) => {
    try {
        const {
            Name,
            Type,
            Cost,
            Markup,
            CostPerUnit,
            CostPerHour,
            CostPerSquare,
            Square,
            CostPerFixed,
            Fixed,
            Unit,
            Attachment,
            Description,
        } = req.body;

        let CompanyId = req.user.CompanyId;
        let AdminId = req.user.UserId;

        if (Array.isArray(CompanyId) && CompanyId.length > 0) {
            CompanyId = CompanyId[0];
        }

        const assignedId = CompanyId || AdminId;

        if (!Name || !Type) {
            return res.status(400).json({ statusCode: 400, message: "Name and Type are required fields." });
        }

        const query = { Name: { $regex: new RegExp(`^${Name}$`, "i") }, Type, IsDelete: false };

        if (CompanyId) {
            query.IsSuperadminAdd = false;
            query.CompanyId = CompanyId;
        } else {
            query.IsSuperadminAdd = true;
        }

        const existingProduct = await MaterialsAndLabor.findOne(query);
        if (existingProduct) {
            return res.status(409).json({ statusCode: 409, message: `${Name} name already exists.` });
        }

        const newProduct = await MaterialsAndLabor.create({
            Name,
            Type,
            Cost,
            Markup,
            CostPerUnit,
            CostPerHour,
            CostPerSquare,
            Square,
            CostPerFixed,
            Fixed,
            Unit,
            Attachment,
            Description,
            CompanyId: CompanyId || null,
            AdminId: !CompanyId ? AdminId : null,
            IsSuperadminAdd: !CompanyId,
        });

        await logUserEvent(
            assignedId,
            "CREATE",
            `New ${Type} added: ${Name}`,
            { ProductId: newProduct.ProductId, Type, Name }
        );

        return res.status(200).json({
            statusCode: 200,
            message: "Product added successfully",
            data: newProduct,
        });
    } catch (error) {
        console.error("Error in handleMaterialsAndLabor:", error);
        return res.status(500).json({ statusCode: 500, message: "Failed to add product.", error: error.message });
    }
};

// **MATERIALS GET IN COMPANY TABLE**
exports.getMaterialsAndLabor = async (req, res) => {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const pageNumber = parseInt(req.query.pageNumber) || 0;
    const searchQuery = req.query.search;
    const sortField = req.query.sortField || "updatedAt";
    const sortOrder = req.query.sortOrder || "desc";

    const allowedSortFields = [
        "Name",
        "Description",
        "Type",
        "CostPerHour",
        "CostPerUnit",
        "CostPerSquare",
        "CostPerFixed",
        "updatedAt",
        "createdAt",
    ];

    const sortOptions = allowedSortFields.includes(sortField)
        ? { [sortField]: sortOrder === "asc" ? 1 : -1 }
        : { updatedAt: -1 };

    let query = { IsDelete: false, IsSuperadminAdd: true };

    if (searchQuery) {
        const searchRegex = new RegExp(searchQuery, "i");
        query = {
            ...query,
            $or: [
                { Name: { $regex: searchRegex } },
                { Description: { $regex: searchRegex } },
                { Type: { $regex: searchRegex } },
            ],
        };
    }

    try {
        const totalDataCount = await MaterialsAndLabor.countDocuments(query);

        const data = await MaterialsAndLabor.find(query)
            .sort(sortOptions)
            .skip(pageNumber * pageSize)
            .limit(pageSize);

        res.status(200).json({
            statusCode: 200,
            data,
            count: totalDataCount,
            totalPages: Math.ceil(totalDataCount / pageSize),
            currentPage: pageNumber,
            message: data.length > 0 ? "Materials and Labor retrieved successfully" : "No data found",
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **MATERIALS GET IN COMPANY **
exports.getMaterialsAndLabors = async (req, res) => {
    const { CompanyId } = req.params;

    const queryParams = {
        pageSize: parseInt(req.query.pageSize) || 10,
        pageNumber: parseInt(req.query.pageNumber) || 0,
        searchQuery: req.query.search,
        sortField: req.query.sortField || "updatedAt",
        sortOrder: req.query.sortOrder || "desc",
        selectedStatus: req.query.selectedStatus,
    };

    const {
        pageSize,
        pageNumber,
        searchQuery,
        sortField,
        sortOrder,
        selectedStatus,
    } = queryParams;

    const sortDirection = sortOrder?.toLowerCase() === "desc" ? -1 : 1;

    const allowedSortFields = [
        "Name",
        "Type",
        "Description",
        "CostPerHour",
        "CostPerUnit",
        "CostPerSquare",
        "CostPerFixed",
        "updatedAt",
        "createdAt",
    ];

    const sortOptionsField = allowedSortFields.includes(sortField)
        ? { [sortField]: sortDirection }
        : { updatedAt: -1 };

    let query = {
        $and: [
            { IsDelete: false },
            { $or: [{ CompanyId }, { IsSuperadminAdd: true }] },
        ],
    };

    if (searchQuery) {
        const searchParts = searchQuery.split(" ").filter(Boolean);
        const searchConditions = searchParts.map((part) => {
            const searchRegex = new RegExp(part, "i");
            return {
                $or: [
                    { Type: { $regex: searchRegex } },
                    { Name: { $regex: searchRegex } },
                    { Description: { $regex: searchRegex } },
                ],
            };
        });
        query.$and.push({ $and: searchConditions });
    }

    if (selectedStatus) {
        const statusCondition = {
            Hourly: { Hourly: { $ne: null } },
            Unit: { Unit: { $ne: null } },
            SqFt: { Square: { $ne: null } },
        }[selectedStatus];

        if (statusCondition) {
            query.$and.push(statusCondition);
        }
    }

    if (query.$and.length === 0) {
        delete query.$and;
    }

    const collation = { locale: "en", strength: 2 };

    try {
        const allData = await MaterialsAndLabor.find(query)
            .sort(sortOptionsField)
            .skip(pageNumber * pageSize)
            .limit(pageSize)
            .collation(collation);

        const adminModifiedRecordsMap = new Map();
        allData.forEach((item) => {
            if (item.OldProductId && !item.IsSuperadminAdd) {
                adminModifiedRecordsMap.set(item.OldProductId, item);
            }
        });

        const filteredData = allData.filter((item) => {
            if (item.IsSuperadminAdd) {
                return !adminModifiedRecordsMap.has(item.ProductId);
            }
            return true;
        });

        const totalItems = await MaterialsAndLabor.countDocuments(query);

        res.status(totalItems > 0 ? 200 : 204).json({
            statusCode: totalItems > 0 ? 200 : 204,
            message:
                totalItems > 0
                    ? "Products retrieved successfully"
                    : "No products found",
            data: filteredData,
            count: totalItems,
            totalPages: Math.ceil(totalItems / pageSize),
            currentPage: pageNumber,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **MATERIALS GET IN COMPANY FOR DROPDOWN
exports.getMaterialsAndLaborDropdown = async (req, res) => {
    const { CompanyId } = req.params;

    try {
        let query = {
            IsDelete: false,
            $or: [{ CompanyId }, { IsSuperadminAdd: true }],
        };

        const allData = await MaterialsAndLabor.find(query).select("-_id");

        const adminModifiedRecordsMap = new Map();
        allData.forEach((item) => {
            if (item.OldProductId && !item.IsSuperadminAdd) {
                adminModifiedRecordsMap.set(item.OldProductId, item);
            }
        });

        const filteredData = allData.filter((item) => {
            if (item.IsSuperadminAdd) {
                return !adminModifiedRecordsMap.has(item.ProductId);
            }
            return true;
        });

        const data = [
            {
                label: "Materials",
                options: filteredData
                    .filter((product) => product.Type === "Materials")
                    .map((product) => ({
                        ...product.toObject(),
                        label: `${product.Name}`,
                        value: product.ProductId,
                    })),
            },
            {
                label: "Labor",
                options: filteredData
                    .filter((product) => product.Type === "Labor")
                    .map((product) => ({
                        ...product.toObject(),
                        label: `${product.Name}`,
                        value: product.ProductId,
                    })),
            },
        ];

        if (data.length > 0) {
            return res.status(200).json({
                statusCode: 200,
                message: "Materials and Labor retrieved successfully",
                data,
            });
        } else {
            return res.status(204).json({
                statusCode: 204,
                message: "No data found",
                data: [],
            });
        }
    } catch (error) {
        console.error("Error in getMaterialsAndLaborDropdown:", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Failed to retrieve materials and labor",
            error: error.message,
        });
    }
};

// **Put Product and Service (Superadmin)**
exports.updateMaterialsAndLabor = async (req, res) => {
    const { ProductId } = req.params;
    const updateData = req.body;

    updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

    try {
        const existingProduct = await MaterialsAndLabor.findOne({
            Name: { $regex: new RegExp("^" + updateData.Name + "$", "i") },
            Type: updateData.Type,
            IsSuperadminAdd: true,
            IsDelete: false,
        });

        if (existingProduct && ProductId !== existingProduct.ProductId) {
            return res.status(400).json({
                statusCode: 400,
                message: `${updateData.Name} name already exists`,
            });
        }

        const result = await MaterialsAndLabor.findOneAndUpdate(
            { ProductId, IsDelete: false },
            { $set: updateData },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                statusCode: 404,
                message: "Product not found",
            });
        }

        await logUserEvent(
            req.user.UserId,
            "UPDATE",
            `Updated ${updateData.Type} product: ${updateData.Name}`,
            { ProductId: result.ProductId, Type: updateData.Type, Name: updateData.Name }
        );

        return res.status(200).json({
            statusCode: 200,
            message: "Product updated successfully",
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};


// **Delete Product and Service (Superadmin)
exports.deleteMaterialsAndLabor = async (req, res) => {
    const { ProductId } = req.params;
    const { DeleteReason } = req.body;

    try {
        const result = await MaterialsAndLabor.findOneAndUpdate(
            { ProductId },
            { $set: { IsDelete: true, DeleteReason } },
            { new: true }
        );

        if (result) {
            if (req.Role !== "Superadmin") {
                await logUserEvent(
                    req.user.UserId,
                    "DELETE",
                    `Deleted ${result.Type} product: ${result.Name}`,
                    { ProductId: result.ProductId, Type: result.Type, Name: result.Name }
                );
            }

            return res.status(200).json({
                statusCode: 200,
                message: "Material & Labour deleted successfully",
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: "Material & Labour not found",
            });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};


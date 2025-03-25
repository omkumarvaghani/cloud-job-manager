const User = require("../../../models/User/User");

// **GET CUSTOMERS FOR COMPANY API**
exports.getCustomersByCompanyId = async (req, res) => {
    try {
        const { CompanyId } = req.params;
        const query = req.query;

        const pageSize = Math.max(parseInt(query.pageSize) || 10, 1);
        const pageNumber = Math.max(parseInt(query.pageNumber) || 0, 0);
        const search = query.search;
        const sortOrder = query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;

        const allowedSortFields = [
            "FirstName",
            "LastName",
            "EmailAddress",
            "PhoneNumber",
            "Address",
            "City",
            "State",
            "Country",
            "Zip",
            "createdAt",
            "updatedAt",
        ];

        const sortField = allowedSortFields.includes(query.sortField)
            ? query.sortField
            : "updatedAt";

        let customerSearchQuery = {
            CompanyId,
            Role: "Customer",
            IsDelete: false,
        };

        let searchConditions = [];
        if (search) {
            const searchRegex = new RegExp(search, "i");
            searchConditions = [
                { "profile.FirstName": searchRegex },
                { "profile.LastName": searchRegex },
                { EmailAddress: searchRegex },
                { "profile.PhoneNumber": searchRegex },
                { "profile.Address": searchRegex },
                { "profile.City": searchRegex },
                { "profile.State": searchRegex },
                { "profile.Country": searchRegex },
                { "profile.Zip": searchRegex },
            ];

            customerSearchQuery = {
                $and: [
                    customerSearchQuery,
                    { $or: searchConditions },
                ],
            };
        }

        let sortOptions = {};
        if (sortField === "Address" || sortField === "City" || sortField === "State" || sortField === "Country" || sortField === "Zip") {
            sortOptions[`profile.${sortField}`] = sortOrder;
        } else {
            sortOptions[sortField] = sortOrder;
        }

        const collation = { locale: "en", strength: 2 };

        const customers = await User.aggregate([
            { $match: customerSearchQuery },
            {
                $lookup: {
                    from: "user-profiles",
                    localField: "UserId",
                    foreignField: "UserId",
                    as: "profile",
                },
            },
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
            {
                $set: {
                    Address: "$profile.Address",
                    City: "$profile.City",
                    State: "$profile.State",
                    Country: "$profile.Country",
                    Zip: "$profile.Zip",
                },
            },
            {
                $project: {
                    UserId: 1,
                    EmailAddress: 1,
                    IsActive: 1,
                    "profile.FirstName": 1,
                    "profile.LastName": 1,
                    "profile.PhoneNumber": 1,
                    "profile.Address": 1,
                    "profile.City": 1,
                    "profile.State": 1,
                    "profile.Country": 1,
                    "profile.Zip": 1,
                    "profile.ProfileImage": 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
            { $sort: sortOptions },
            { $skip: pageNumber * pageSize },
            { $limit: pageSize },
        ]).collation(collation);

        const total = await User.aggregate([
            { $match: customerSearchQuery },
            { $count: "totalCount" },
        ]);

        const totalCount = total[0]?.totalCount || 0;

        if (customers.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Customers retrieved successfully",
                data: customers,
                totalPages: Math.ceil(totalCount / pageSize),
                currentPage: pageNumber,
                totalCount: totalCount,
            });
        } else {
            return res.status(204).json({
                success: false,
                message: "No customers found",
            });
        }
    } catch (error) {
        console.error("Error getting customers:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong, please try later.",
        });
    }
};

// **GET CUSTOMERS DETAILS WITH ALL LOCATIONS API**
exports.getCustomerDetail = async (req, res) => {
    try {
        const { UserId } = req.params;
        const queryParams = req.query;
        const sortField = queryParams.sortField || "updatedAt";
        const sortOrder = queryParams.sortOrder === "desc" ? -1 : 1;

        let userSearchQuery = { UserId, Role: "Customer", IsDelete: false };

        let sortOptions = {};
        if (sortField) {
            sortOptions[sortField] = sortOrder;
        }

        const customers = await User.aggregate([
            {
                $match: userSearchQuery,
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
                $lookup: {
                    from: "locations",
                    localField: "UserId",
                    foreignField: "UserId",
                    as: "locationDetails",
                },
            },
            {
                $project: {
                    _id: 1,
                    UserId: 1,
                    EmailAddress: 1,
                    FirstName: "$profile.FirstName",
                    LastName: "$profile.LastName",
                    Address: "$profile.Address",
                    City: "$profile.City",
                    State: "$profile.State",
                    Country: "$profile.Country",
                    Zip: "$profile.Zip",
                    PhoneNumber: "$profile.PhoneNumber",
                    createdAt: 1,
                    updatedAt: 1,
                    IsDelete: 1,

                    locationDetails: "$locationDetails",
                },
            },
            { $sort: sortOptions },
        ]);

        if (customers.length > 0) {
            return res.status(200).json({
                statusCode: 200,
                message: "Customer retrieved successfully",
                data: customers[0],
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: "No Customer found",
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

// **GET CUSTOMER WITH LOCATIONS**
exports.getCustomersWithLocations = async (req, res) => {
    try {
        const { CompanyId } = req.params;

        const customers = await User.aggregate([
            {
                $match: {
                    CompanyId: CompanyId,
                    Role: "Customer",
                    IsDelete: false,
                },
            },
            {
                $sort: { updatedAt: -1 },
            },
            {
                $lookup: {
                    from: "user-profiles",
                    localField: "UserId",
                    foreignField: "UserId",
                    as: "location",
                },
            },
            {
                $addFields: {
                    location: {
                        $filter: {
                            input: "$location",
                            as: "loc",
                            cond: { $eq: ["$$loc.IsDelete", false] },
                        },
                    },
                    addressData: {
                        $map: {
                            input: "$location",
                            as: "loc",
                            in: {
                                Address: "$$loc.Address",
                                City: "$$loc.City",
                                State: "$$loc.State",
                                Country: "$$loc.Country",
                                Zip: "$$loc.Zip",
                                FirstName: "$$loc.FirstName",
                                LastName: "$$loc.LastName",
                                PhoneNumber: "$$loc.PhoneNumber",
                            },
                        },
                    },
                },
            },
            {
                $unwind: "$addressData",
            },
            {
                $group: {
                    _id: "$UserId",
                    EmailAddress: { $first: "$EmailAddress" },
                    Role: { $first: "$Role" },
                    IsActive: { $first: "$IsActive" },
                    IsDelete: { $first: "$IsDelete" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    locations: { $push: "$addressData" },
                },
            },
            {
                $project: {
                    _id: 0,
                    UserId: "$_id",
                    EmailAddress: 1,
                    FirstName: { $arrayElemAt: ["$locations.FirstName", 0] },
                    LastName: { $arrayElemAt: ["$locations.LastName", 0] },
                    PhoneNumber: { $arrayElemAt: ["$locations.PhoneNumber", 0] },
                    Role: 1,
                    IsActive: 1,
                    IsDelete: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    locations: 1,
                },
            },
        ]);

        if (customers.length === 0) {
            return res.status(204).json({
                message: "No customers found for this company.",
            });
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Customers retrieved successfully with location details",
            data: customers,
        });
    } catch (error) {
        console.error("Error in getCustomersWithLocations:", error.message);
        return res.status(500).json({
            message: "Failed to fetch customers with locations",
        });
    }
};

// **GET CUSTOMERS DETAILS WITH ALL LOCATIONS API**
exports.getUserDetailWithInvoices = async (req, res) => {
    try {
        const { UserId } = req.params;

        const data = await User.aggregate([
            {
                $match: {
                    UserId,
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
                $lookup: {
                    from: "locations",
                    let: { customerId: "$UserId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$UserId", "$$customerId"] },
                                        { $eq: ["$IsDelete", false] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "properties",
                },
            },
            {
                $addFields: {
                    filteredLocations: {
                        $filter: {
                            input: "$properties",
                            as: "property",
                            cond: { $eq: ["$$property.IsDelete", false] },
                        },
                    },
                },
            },
            {
                $group: {
                    _id: "$_id",
                    CompanyId: { $first: "$CompanyId" },
                    UserId: { $first: "$UserId" },
                    FirstName: { $first: "$profile.FirstName" },
                    LastName: { $first: "$profile.LastName" },
                    PhoneNumber: { $first: "$profile.PhoneNumber" },
                    EmailAddress: { $first: "$EmailAddress" },
                    Password: { $first: "$Password" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    IsDelete: { $first: "$IsDelete" },
                    location: { $first: "$filteredLocations" },
                },
            },
        ]);

        if (data.length > 0) {
            return res.status(200).json({
                statusCode: 200,
                message: "User retrieved successfully",
                data: data[0],
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: "No user found",
            });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try again later!",
        });
    }
};


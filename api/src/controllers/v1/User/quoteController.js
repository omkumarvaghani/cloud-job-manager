const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const Quote = require("../../../models/User/Quote");
const QuoteDetail = require("../../../models/User/QuoteItem");
const { logUserEvent } = require("../../../middleware/eventMiddleware");
const { addNotification } = require("../../../models/User/AddNotification");
const Notification = require("../../../models/User/Notification");

// **CREATE QUOTE WITH DETAILS**
exports.createQuoteWithDetails = async (req, res) => {
    try {
        const uniqueId = uuidv4();
        const companyId = req.user.CompanyId.toString();
        const quoteData = req.body;
        quoteData.CompanyId = companyId;
        quoteData.QuoteId = uniqueId;
        quoteData.CustomerId = quoteData.UserId;

        const details = Array.isArray(quoteData.details) ? quoteData.details : [];

        const newQuote = await Quote.create(quoteData);

        if (details.length > 0) {
            const detailPromises = details.map((detail) => {
                const uniqueDetailId = uuidv4();

                detail.QuoteId = uniqueId;
                detail.QuoteItemId = uniqueDetailId;
                detail.CustomerId = quoteData.UserId;
                detail.CompanyId = companyId;

                return QuoteDetail.create(detail);
            });

            await Promise.all(detailPromises);
        }

        await logUserEvent(companyId, "CREATE", `Created a new quote #${quoteData.QuoteNumber} titled "${quoteData.Title}"`, {
            newQuote
        });

        await addNotification({
            CompanyId: quoteData.CompanyId,
            CustomerId: quoteData.UserId,
            QuoteId: uniqueId,
            LocationId: quoteData.LocationId,
            CreatedBy: "Quote creation",
            AddedAt: quoteData.AddedAt,
        });

        return res.status(200).json({
            statusCode: 200,
            data: newQuote,
            message: details.length > 0 ? "Quote added successfully" : "Quote added with no details",
        });
    } catch (error) {
        console.error("Error in createQuoteWithDetails:", error.message);
        throw error;
    }
};

// **CHECK IF QUOTE NUMBER EXISTS**
exports.checkQuoteNumberExists = async (req, res) => {
    try {
        const { CompanyId } = req.params;
        const { QuoteNumber } = req.body;

        if (!QuoteNumber) {
            return res.status(400).json({ statusCode: 400, message: "QuoteNumber is required" });
        }

        const findNumber = await Quote.findOne({
            CompanyId,
            QuoteNumber,
            IsDelete: false,
        });

        if (findNumber) {
            await logUserEvent(req.user.CompanyId, `Quote number ${QuoteNumber} already exists for Company ${CompanyId}`, "warning");
            return res.status(203).json({ statusCode: 203, message: "Quote number already exists" });
        }

        return res.status(200).json({ statusCode: 200, message: "Quote number is available" });
    } catch (error) {
        await logUserEvent(req.user.CompanyId, `Error checking quote number: ${error.message}`, "error");
        return res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
    }
};

// **GET CUSTOMER ASSIGN QUOTES**
exports.getCustomerQuotes = async (req, res) => {
    try {
        const { CustomerId } = req.params;

        if (!CustomerId) {
            return res.status(400).json({ statusCode: 400, message: "CustomerId is required!" });
        }

        const quotes = await Quote.aggregate([
            { $match: { CustomerId, IsDelete: false } },

            {
                $lookup: {
                    from: "users",
                    localField: "CompanyId",
                    foreignField: "UserId",
                    as: "companyData",
                },
            },
            { $unwind: "$companyData" },

            {
                $lookup: {
                    from: "users",
                    localField: "CustomerId",
                    foreignField: "UserId",
                    as: "customerData",
                },
            },
            { $unwind: "$customerData" },

            {
                $lookup: {
                    from: "user-profiles",
                    localField: "CustomerId",
                    foreignField: "UserId",
                    as: "usersDetails",
                },
            },
            { $unwind: "$usersDetails" },

            {
                $project: {
                    _id: 1,
                    CompanyId: 1,
                    CustomerId: 1,
                    QuoteId: 1,
                    Title: 1,
                    SubTotal: 1,
                    Discount: 1,
                    Tax: 1,
                    Total: 1,
                    CustomerMessage: 1,
                    ContractDisclaimer: 1,
                    Notes: 1,
                    Attachment: 1,
                    ChangeRequest: 1,
                    Status: 1,
                    QuoteNumber: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    company: { companyName: "$companyData.Name" },
                    customer: { customerName: "$customerData.Name" },
                    address: {
                        Address: "$usersDetails.Address",
                        City: "$usersDetails.City",
                        State: "$usersDetails.State",
                        Zip: "$usersDetails.Zip",
                        Country: "$usersDetails.Country",
                    },
                },
            },

            {
                $facet: {
                    awaitingResponse: [
                        { $match: { Status: "Awaiting Response" } },
                    ],
                    changesRequested: [
                        { $match: { Status: "Request changed" } },
                    ],
                    approved: [
                        { $match: { Status: "Approved" } },
                    ],
                },
            },
        ]);

        return res.status(200).json({
            statusCode: 200,
            data: {
                "Awaiting Response": quotes[0]?.awaitingResponse || [],
                "Request changed": quotes[0]?.changesRequested || [],
                Approved: quotes[0]?.approved || [],
            },
            message: quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
        });
    } catch (error) {
        console.error("Error in getCustomerQuotes:", error.message);
        await logUserEvent(req.user.UserId, "ERROR", `Error fetching quotes: ${error.message}`, { UserId: req.user.UserId });

        return res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
    }
};

// **GET QUOTES TABLE**
exports.getQuotes = async (req, res) => {
    try {
        const { CompanyId } = req.params;
        const query = req.query;
        const pageSize = parseInt(query.pageSize) || 10;
        const pageNumber = parseInt(query.pageNumber) || 0;
        const search = query.search;

        const sortOrder = query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;
        const statusFilter = query.statusFilter?.toLowerCase() || "";

        let quoteSearchQuery = { CompanyId, IsDelete: false };
        if (statusFilter && statusFilter !== "all") {
            quoteSearchQuery.Status = { $regex: statusFilter, $options: "i" };
        }

        const allowedSortFields = [
            "customerData.FirstName",
            "customerData.LastName",
            "location.Address",
            "location.City",
            "location.State",
            "location.Country",
            "location.Zip",
            "QuoteNumber",
            "Total",
            "updatedAt",
            "createdAt",
        ];

        const sortField = allowedSortFields.includes(query.sortField) ? query.sortField : "updatedAt";
        const collation = { locale: "en", strength: 2 };

        const basePipeline = [
            { $match: quoteSearchQuery },
            {
                $lookup: {
                    from: "user-profiles",
                    localField: "CustomerId",
                    foreignField: "UserId",
                    as: "usersDetails",
                },
            },
            { $unwind: { path: "$usersDetails", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "locations",
                    localField: "LocationId",
                    foreignField: "LocationId",
                    as: "locationDetails",
                },
            },
            { $unwind: { path: "$usersDetails", preserveNullAndEmptyArrays: true } },

            {
                $addFields: {
                    customer: {
                        FirstName: "$usersDetails.FirstName",
                        LastName: "$usersDetails.LastName",
                    },
                    location: {
                        Address: "$locationDetails.Address",
                        City: "$locationDetails.City",
                        State: "$locationDetails.State",
                        Country: "$locationDetails.Country",
                        Zip: "$locationDetails.Zip",
                    },
                    Total: {
                        $toInt: { $round: [{ $toDouble: "$Total" }, 0] },
                    },
                },
            },
        ];

        if (search) {
            const searchParts = search.split(" ").filter(Boolean);
            const searchConditions = searchParts.map((part) => {
                const searchRegex = new RegExp(part, "i");
                return {
                    $or: [
                        { "customerData.FirstName": { $regex: searchRegex } },
                        { "customerData.LastName": { $regex: searchRegex } },
                        { "location.Address": { $regex: searchRegex } },
                        { "location.City": { $regex: searchRegex } },
                        { "location.State": { $regex: searchRegex } },
                        { "location.Country": { $regex: searchRegex } },
                        { "location.Zip": { $regex: searchRegex } },
                        { Title: { $regex: searchRegex } },
                        { QuoteNumber: { $regex: searchRegex } },
                    ],
                };
            });

            basePipeline.push({
                $match: {
                    $and: searchConditions,
                },
            });
        }

        const sortOptions = { [sortField]: sortOrder };
        basePipeline.push({ $sort: sortOptions });

        const countPipeline = [...basePipeline, { $count: "totalCount" }];

        const mainPipeline = [
            ...basePipeline,
            { $skip: pageNumber * pageSize },
            { $limit: pageSize },
            {
                $project: {
                    CompanyId: 1,
                    CustomerId: 1,
                    QuoteId: 1,
                    Title: 1,
                    QuoteNumber: 1,
                    Status: 1,
                    customer: 1,
                    location: 1,
                    Total: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
            {
                $group: {
                    _id: "$QuoteId",
                    QuoteId: { $first: "$QuoteId" },
                    Title: { $first: "$Title" },
                    QuoteNumber: { $first: "$QuoteNumber" },
                    Status: { $first: "$Status" },
                    customer: { $first: "$customer" },
                    location: { $first: "$location" },
                    Total: { $first: "$Total" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                },
            },
        ];

        const [countResult, quotes] = await Promise.all([
            Quote.aggregate(countPipeline),
            Quote.aggregate(mainPipeline).collation(collation),
        ]);
        const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

        return res.status(200).json({
            statusCode: quotes.length > 0 ? 200 : 204,
            data: quotes,
            totalPages: Math.ceil(totalCount / pageSize),
            currentPage: pageNumber,
            message: quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
            totalCount,
        });
    } catch (error) {
        console.error("Error in getQuotes:", error.message);
        return res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
    }
};

// **GET QUOTES DETAILS PAGE**
exports.getQuoteDetails = async (req, res) => {
    try {
        const { QuoteId } = req.params;

        const quotes = await Quote.aggregate([
            {
                $match: { QuoteId, IsDelete: false }
            },
            {
                $lookup: {
                    from: "quote-items",
                    localField: "QuoteId",
                    foreignField: "QuoteId",
                    as: "products"
                },
            },
            {
                $lookup: {
                    from: "user-profiles",
                    localField: "CustomerId",
                    foreignField: "UserId",
                    as: "customerData"
                },
            },
            {
                $unwind: {
                    path: "$customerData",
                    preserveNullAndEmptyArrays: true
                },
            },
            {
                $lookup: {
                    from: "locations",
                    localField: "LocationId",
                    foreignField: "LocationId",
                    as: "locationData"
                },
            },
            {
                $unwind: {
                    path: "$locationData",
                    preserveNullAndEmptyArrays: true
                },
            },
            {
                $project: {
                    QuoteId: 1,
                    CompanyId: 1,
                    CustomerId: 1,
                    Title: 1,
                    QuoteNumber: 1,
                    SubTotal: 1,
                    Discount: 1,
                    Tax: 1,
                    Total: 1,
                    CustomerMessage: 1,
                    ContractDisclaimer: 1,
                    Notes: 1,
                    Attachment: 1,
                    Status: 1,
                    DeleteReason: 1,
                    ChangeRequest: 1,
                    SignatureType: 1,
                    Signature: 1,
                    ApproveDate: 1,
                    IsDelete: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    IsApprovedByCustomer: 1,
                    "customerData.FirstName": 1,
                    "customerData.LastName": 1,
                    "locationData.Address": 1,
                    "locationData.City": 1,
                    "locationData.State": 1,
                    "locationData.Zip": 1,
                    "locationData.Country": 1,
                    products: 1,
                },
            },
        ]);

        if (quotes.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                data: {},
                message: "Quote not found!",
            });
        }

        return res.status(200).json({
            statusCode: 200,
            data: quotes[0],
            message: "Quote retrieved successfully",
        });

    } catch (error) {
        console.error("Error in getQuoteDetails:", error.message);
        return res.status(500).json({
            statusCode: 500,
            data: {},
            message: "Internal Server Error",
        });
    }
};

// **GET QUOTES MAX QUOTE-NUMBER**
exports.getMaxQuoteNumber = async (req, res) => {
    try {
        const { CompanyId } = req.params;

        const totalQuotes = await Quote.find({
            CompanyId,
            IsDelete: false,
        }).select("QuoteNumber");

        const quoteNumbers = totalQuotes.map((quote) => parseInt(quote.QuoteNumber, 10));

        quoteNumbers.sort((a, b) => a - b);

        let maxQuoteNumber = 1;

        for (let i = 0; i < quoteNumbers.length; i++) {
            if (quoteNumbers[i] === maxQuoteNumber) {
                maxQuoteNumber++;
            }
        }

        return res.status(200).json({
            statusCode: 200,
            quoteNumber: maxQuoteNumber,
        });
    } catch (error) {
        console.error("Error in getMaxQuoteNumber:", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Failed to get max quote number.",
            error: error.message,
        });
    }
};

// **UPDATE QUOTES**
exports.updateQuote = async (req, res) => {
    const { QuoteId } = req.params;
    const { details = [], ...quoteData } = req.body;

    quoteData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

    try {
        const updatedQuote = await Quote.findOneAndUpdate(
            { QuoteId },
            { $set: quoteData },
            { new: true }
        );

        if (!updatedQuote) {
            await logUserEvent(req.user.UserId, "ERROR", `Quote with ID ${QuoteId} not found during update.`);
            return res.status(404).json({
                statusCode: 404,
                message: "Quote not found!",
            });
        }

        const existingDetails = await QuoteDetail.find({
            QuoteId,
            IsDelete: false,
        });

        const incomingDetailIds = details
            .map((detail) => detail.QuoteItemId)
            .filter(Boolean);
        const detailsToDelete = existingDetails.filter(
            (detail) => !incomingDetailIds.includes(detail.QuoteItemId)
        );

        const deletePromises = detailsToDelete.map((detail) =>
            QuoteDetail.findOneAndDelete({ QuoteItemId: detail.QuoteItemId })
        );
        await Promise.all(deletePromises);

        if (Array.isArray(details) && details.length > 0) {
            const detailPromises = details.map(async (detail, index) => {
                detail.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

                if (!detail.QuoteItemId) {
                    const newQuoteDetail = {
                        ...detail,
                        QuoteId: updatedQuote.QuoteId,
                        QuoteItemId: `${Date.now()}-${index}`,
                        createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
                    };

                    return await QuoteDetail.create(newQuoteDetail);
                } else {
                    const updatedDetail = await QuoteDetail.findOneAndUpdate(
                        { QuoteItemId: detail.QuoteItemId, IsDelete: false },
                        { $set: detail },
                        { new: true }
                    );
                    if (!updatedDetail) {
                        return res.status(404).json({
                            statusCode: 404,
                            message: "QuoteItem not found!",
                        });
                    }
                    return updatedDetail;
                }
            });

            await Promise.all(detailPromises);
        }

        const activityDescription = `Updated a quote #${updatedQuote.QuoteNumber} ${updatedQuote.Title}`;
        await logUserEvent(req.user.UserId, "UPDATE", activityDescription, {
            updatedQuote
        });
        const notificationData = {
            CompanyId: updatedQuote.CompanyId,
            CustomerId: updatedQuote.CustomerId,
            QuoteId: updatedQuote.QuoteId,
            LocationId: updatedQuote.LocationId,
            CreatedBy: "Quote creation",
            AddedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        };

        await addNotification(notificationData);

        return res.status(200).json({
            statusCode: 200,
            message: "Quote updated successfully",
            data: updatedQuote,
        });
    } catch (error) {
        console.error("Error in updateQuote:", error.message);

        // Log the error event
        await logUserEvent(req.user.UserId, "ERROR", `Error updating quote: ${error.message}`, { QuoteId });

        return res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// **DELETE QUOTES AND RELATED DATA**
exports.deleteQuoteAndRelatedData = async (req, res) => {
    const { QuoteId } = req.params;
    const { DeleteReason } = req.body;

    try {
        const updatedQuote = await Quote.findOneAndUpdate(
            { QuoteId, IsDelete: false },
            { $set: { IsDelete: true, DeleteReason } },
            { new: true }
        );
        const updatedQuoteDetails = await QuoteDetail.updateMany(
            { QuoteId, IsDelete: false },
            { $set: { IsDelete: true } }
        );

        // Mark related notifications as deleted (Uncomment if needed)
        // const updatedNotifications = await Notification.updateMany(
        //     { QuoteId, IsDelete: false },
        //     { $set: { IsDelete: true } }
        // );

        if (updatedQuote || updatedQuoteDetails.modifiedCount > 0) {
            const quoteId = updatedQuote ? updatedQuote.QuoteId : QuoteId;
            const quoteNumber = updatedQuote ? updatedQuote.QuoteNumber : "Unknown";
            const title = updatedQuote ? updatedQuote.Title : "Unknown";

            await logUserEvent(req.user.UserId, "DELETE", `Quote #${quoteNumber} titled '${title}' deleted.`, {
                QuoteId: quoteId,
                QuoteNumber: quoteNumber,
                Title: title,
            });

            await Notification.updateMany(
                { QuoteId: QuoteId, IsDelete: false },
                { $set: { IsDelete: true } }
            );

            return res.status(200).json({
                statusCode: 200,
                message: "Quote deleted successfully!",
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: "Quote not found or deletion failed.",
            });
        }
    } catch (error) {
        console.error("Error in deleteQuoteAndRelatedData:", error.message);

        await logUserEvent(req.user.UserId, "ERROR", `Error deleting quote with ID ${QuoteId}: ${error.message}`, {
            QuoteId,
            DeleteReason,
        });

        return res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


// **CUSTOMER APPROVED QUOTE**
exports.approveQuote = async (req, res) => {
    const { QuoteId } = req.params;
    const { Status } = req.body;

    if (!Status) {
        return res.status(400).json({
            statusCode: 400,
            message: "Status is required",
        });
    }

    try {
        const updatedQuote = await Quote.findOneAndUpdate(
            { QuoteId },
            {
                $set: {
                    Status,
                    updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
                },
            },
            { new: true }
        );

        if (!updatedQuote) {
            return res.status(404).json({
                statusCode: 404,
                message: "Quote not found!",
            });
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Quote status updated successfully",
            data: updatedQuote,
        });
    } catch (error) {
        console.error("Error updating quote status:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **SCHEDULE CALENDAR IN COMPANY**
exports.getScheduleData = async (req, res) => {
    const { CompanyId } = req.params;

    try {
        const data = await Quote.aggregate([
            {
                $match: {
                    CompanyId: CompanyId,
                    IsDelete: false,
                },
            },
            {
                $lookup: {
                    from: "user-profiles",
                    localField: "CustomerId",
                    foreignField: "UserId",
                    as: "customerData",
                },
            },
            {
                $unwind: {
                    path: "$customerData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "locations",
                    localField: "LocationId",
                    foreignField: "LocationId",
                    as: "locationData",
                },
            },
            {
                $unwind: {
                    path: "$locationData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    Title: 1,
                    QuoteNumber: 1,
                    CompanyId: 1,
                    QuoteId: 1,
                    CustomerId: 1,
                    LocationId: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    FirstName: "$customerData.FirstName",
                    LastName: "$customerData.LastName",
                    Address: {
                        $ifNull: [
                            { $ifNull: ["$locationData.Address", "$customerData.Address"] },
                            "N/A"
                        ],
                    },
                    City: { $ifNull: ["$locationData.City", "$customerData.City"] },
                    State: { $ifNull: ["$locationData.State", "$customerData.State"] },
                    Zip: { $ifNull: ["$locationData.Zip", "$customerData.Zip"] },
                    Country: { $ifNull: ["$locationData.Country", "$customerData.Country"] },
                    sheduleDate: {
                        $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
                    },
                },
            },
        ]);

        return res.status(200).json({
            statusCode: 200,
            data: data,
            message: "Read All Plans",
        });
    } catch (error) {
        console.error("Error in getScheduleData:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error",
        });
    }
};

// **GET QUOTE DETAILS FOR ASSIGN CUSTOMER**
exports.fetchQuoteDetails = async (req, res) => {
    const { QuoteId } = req.params;
    const sortField = req.query.sortField || "updatedAt";
    const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

    const quotesSearchQuery = { QuoteId, IsDelete: false };

    const sortOptions = {};
    if (sortField) {
        sortOptions[sortField] = sortOrder === "desc" ? -1 : 1;
    }

    try {
        const quotes = await Quote.aggregate([
            {
                $match: quotesSearchQuery,
            },
            {
                $lookup: {
                    from: "user-profiles",
                    localField: "CustomerId",
                    foreignField: "UserId",
                    as: "customerDetails",
                },
            },
            {
                $unwind: {
                    path: "$customerDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "locations",
                    let: { quoteLocationId: "$LocationId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$LocationId", "$$quoteLocationId"] },
                            },
                        },
                    ],
                    as: "propertyDetails",
                },
            },
            {
                $unwind: {
                    path: "$propertyDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "quotedetails",
                    localField: "QuoteId",
                    foreignField: "QuoteId",
                    as: "products",
                },
            },
            {
                $addFields: {
                    property: "$propertyDetails",
                    FirstName: "$customerDetails.FirstName",
                    LastName: "$customerDetails.LastName",
                    PhoneNumber: "$customerDetails.PhoneNumber",
                    Address: {
                        $ifNull: ["$propertyDetails.Address", "$customerDetails.Address"],
                    },
                    City: {
                        $ifNull: ["$propertyDetails.City", "$customerDetails.City"],
                    },
                    State: {
                        $ifNull: ["$propertyDetails.State", "$customerDetails.State"],
                    },
                    Zip: {
                        $ifNull: ["$propertyDetails.Zip", "$customerDetails.Zip"],
                    },
                    Country: {
                        $ifNull: ["$propertyDetails.Country", "$customerDetails.Country"],
                    },
                },
            },
            {
                $unset: ["propertyDetails", "customerDetails"],
            },
            { $sort: sortOptions },
        ]);

        return res.status(200).json({
            statusCode: quotes.length > 0 ? 200 : 204,
            message:
                quotes.length > 0 ? "Quotes retrieved successfully" : "No quotes found",
            data: quotes,
        });
    } catch (error) {
        console.error("Error in fetchQuoteDetails:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error",
        });
    }
};


// **GET QUOTE IN CUSTOMER DETAILS OVERVIEW** 
exports.getQuotesByCustomer = async (req, res) => {
    const { CompanyId, CustomerId } = req.params;

    const quoteSearchQuery = {
        CompanyId,
        CustomerId,
        IsDelete: false,
    };

    const quotes = await Quote.aggregate([
        {
            $lookup: {
                from: "user-profiles",
                localField: "UserId",
                foreignField: "CustomerId",
                as: "customerData",
            },
        },
        { $unwind: "$customerData" },
        {
            $lookup: {
                from: "locations",
                localField: "LocationId",
                foreignField: "LocationId",
                as: "locationData",
            },
        },
        { $unwind: "$locationData" },
        {
            $addFields: {
                customer: {
                    FirstName: "$customerData.FirstName",
                    LastName: "$customerData.LastName",
                },
                location: {
                    Address: "$locationData.Address",
                    City: "$locationData.City",
                    State: "$locationData.State",
                    Country: "$locationData.Country",
                    Zip: "$locationData.Zip",
                },
            },
        },
        { $match: quoteSearchQuery },
        { $sort: { updatedAt: -1 } },
        {
            $project: {
                CompanyId: 1,
                CustomerId: 1,
                QuoteId: 1,
                LocationId: 1,
                Title: 1,
                QuoteNumber: 1,
                Status: 1,
                customer: 1,
                location: 1,
                Total: 1,
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);

    return res.status(200).json({
        statusCode: quotes.length > 0 ? 200 : 204,
        data: quotes.length > 0 ? quotes : null,
        message: quotes.length > 0 ? null : "No quotes found",
    });
};
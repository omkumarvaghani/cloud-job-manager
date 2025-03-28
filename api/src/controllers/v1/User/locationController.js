const { logUserEvent } = require("../../../middleware/eventMiddleware");
const User = require("../../../models/User/User");
const Location = require("../../../models/User/Location");
const moment = require("moment");

// **Post Properties for customer**
exports.addLocation = async (req, res) => {
    const locationData = req.body;

    try {
        if (!locationData || !locationData.Address || !locationData.City) {
            return res.status(400).json({
                statusCode: 400,
                message: "Location data is incomplete.",
            });
        }

        const newLocation = await Location.create(locationData);

        await logUserEvent(
            req.user.CompanyId,
            "CREATE",
            `New location added: ${locationData.Address}, ${locationData.City}`,
            { LocationId: newLocation._id, UserId: req.user._id }
        );

        return res.status(200).json({
            statusCode: 200,
            message: "Location added successfully",
            data: newLocation,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            statusCode: 500,
            message: "Failed to add location.",
            error: error.message,
        });
    }
};

// **Put Properties for customer**
exports.updateLocation = async (req, res) => {
    const { LocationId } = req.params;
    const updateData = req.body;

    try {
        updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

        const result = await Location.findOneAndUpdate(
            { LocationId: LocationId, IsDelete: false },
            { $set: updateData },
            { new: true }
        );

        if (result) {
            await logUserEvent(
                req.user.CompanyId,
                "UPDATE",
                `Updated a Location: ${updateData.Address}, ${updateData.City}, ${updateData.State}, ${updateData.Zip}, ${updateData.Country}`,
                { LocationId: result._id, UserId: req.user._id }
            );

            return res.status(200).json({
                statusCode: 200,
                message: "Location updated successfully",
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: "Location not found",
            });
        }
    } catch (error) {
        console.error(error.message);

        // **Log Failure Event**
        await logUserEvent(
            req.user ? req.user.CompanyId : null,
            "UPDATE_LOCATION_FAILED",
            "Failed to update location",
            { error: error.message }
        );

        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
            error: error.message,
        });
    }
};

// **GET LOCATION FOR CUSTOMERS**
exports.getPropertyByLocationId = async (req, res) => {
    const { LocationId } = req.params;

    const pipeline = [
        {
            $match: {
                LocationId,
                IsDelete: false,
            }
        },
        {
            $lookup: {
                from: "locations",
                let: { locationId: "$LocationId" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$LocationId", "$$locationId"] },
                        }
                    }
                ],
                as: "propertyDetails"
            }
        },
        {
            $unwind: {
                path: "$propertyDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                property: "$propertyDetails",
                LocationId: 1,
                IsDelete: 1,
            }
        }
    ];

    try {
        const result = await Location.aggregate(pipeline);

        if (result.length > 0) {
            return res.status(200).json({
                statusCode: 200,
                data: result[0].property,
            });
        } else {
            return res.status(404).json({
                statusCode: 404,
                message: "Location not found",
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

// **DELETE LOCATION IN CUSTOMER**
exports.deleteLocation = async (req, res) => {
    const { LocationId } = req.params;
    const { DeleteReason } = req.body;

    try {
        // const findContract = await Contract.findOne({ LocationId });
        // const findQuote = await Quote.findOne({ LocationId });

        // if (findContract || findQuote) {
        //     await logUserEvent(
        //         req.user.CompanyId,
        //         "DELETE_LOCATION_FAILED",
        //         `Cannot delete LocationId: ${LocationId}. It is in use.`,
        //         { LocationId, userId: req.user._id, reason: "In use by contract or quote" }
        //     );

        //     return res.status(202).json({
        //         statusCode: 202,
        //         message: "You can't delete Location, It's already in use",
        //     });
        // }

        const findLocation = await Location.findOneAndUpdate(
            { LocationId, IsDelete: false },
            { $set: { IsDelete: true, DeleteReason } },
            { new: true }
        );

        if (findLocation) {
            await logUserEvent(
                req.user.CompanyId,
                "DELETE",
                `LocationId: ${LocationId} deleted successfully. Reason: ${DeleteReason}`,
                { LocationId, userId: req.user._id }
            );

            return res.status(200).json({
                statusCode: 200,
                message: "Location deleted successfully",
            });
        } else {
            await logUserEvent(
                req.user.CompanyId,
                "DELETE",
                `Failed to delete LocationId: ${LocationId}. Location not found.`,
                { LocationId, userId: req.user._id }
            );

            return res.status(404).json({
                statusCode: 404,
                message: "Location not found or deletion failed",
            });
        }
    } catch (error) {
        console.error(error.message);

        await logUserEvent(
            req.user.CompanyId,
            "DELETE",
            `Error occurred while deleting LocationId: ${LocationId}. Error: ${error.message}`,
            { LocationId, userId: req.user._id, error: error.message }
        );

        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};


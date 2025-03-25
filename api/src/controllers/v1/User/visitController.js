const Visit = require("../../../models/User/Visit");

exports.createVisit = async (req, res) => {
    const data = req.body;

    if (!Array.isArray(data.WorkerId)) {
        data.WorkerId = [data.WorkerId];
    }
    try {
        const createdVisit = await Visit.create(data);

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
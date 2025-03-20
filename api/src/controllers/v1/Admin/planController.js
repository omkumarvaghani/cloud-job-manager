const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const Plan = require("../../../models/Admin/Plan");

// **Create Plan (Superadmin)**
exports.createPlan = async (req, res) => {
    try {
        const planData = req.body;

        const findPlanName = await Plan.findOne({
            PlanName: {
                $regex: new RegExp("^" + planData.PlanName + "$", "i"),
            },
            IsDelete: false,
        });

        const findMostPopularPlan = await Plan.findOne({
            IsMostpopular: true,
            IsDelete: false,
        });

        if (
            findMostPopularPlan &&
            planData.IsMostpopular &&
            !planData.confirmReplace
        ) {
            return res.status(202).json({
                statusCode: 202,
                message:
                    "The most popular plan already exists. Do you want to replace it with the new plan?",
                existingPlan: findMostPopularPlan,
            });
        }

        if (!findPlanName) {
            const uniqueId = uuidv4();
            planData.PlanId = uniqueId;
            planData.createdAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
            planData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

            if (planData.IsMostpopular && findMostPopularPlan) {
                await Plan.updateOne(
                    { PlanId: findMostPopularPlan.PlanId },
                    { $set: { IsMostpopular: false } }
                );
            }

            const data = await Plan.create(planData);

            return res.status(200).json({
                statusCode: 200,
                message: "Plan added successfully.",
                data: data,
            });
        } else {
            return res.status(201).json({
                statusCode: 201,
                message: `Plan name ${planData.PlanName} is already added.`,
            });
        }
    } catch (error) {
        console.error("Error creating Plan:", error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **Get Plans (Superadmin)**
exports.getPlans = async (req, res) => {
    try {
        const { pageSize, pageNumber, searchQuery, sortField, sortOrder } = req.query;

        let query = { IsDelete: false };

        if (searchQuery) {
            query.$and = [
                { IsDelete: false },
                {
                    $or: [
                        { PlanName: { $regex: searchQuery, $options: "i" } },
                        { PlanPrice: { $regex: searchQuery, $options: "i" } },
                        { MonthFrequency: { $regex: searchQuery, $options: "i" } },
                        { PlanDetail: { $regex: searchQuery, $options: "i" } },
                    ],
                },
            ];
        }

        let sortOptions = {};
        if (sortField) {
            sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;
        }

        const totalDataCount = await Plan.countDocuments(query);
        const data = await Plan.find(query)
            .sort(sortOptions)
            .skip(pageNumber * pageSize)
            .limit(pageSize);

        return res.status(200).json({
            statusCode: 200,
            data,
            count: totalDataCount,
        });
    } catch (error) {
        console.error("Error fetching plans:", error);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try again later!",
        });
    }
};

// **Get Plans Graph Data**
exports.getPlansGraphData = async (req, res) => {
    const { CompanyId, startDate, endDate } = req.query;
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    try {
        const data = await Plan.aggregate([
            {
                $match: {
                    IsDelete: false,
                    createdAt: { $exists: true, $ne: null },

                },
            },
            {
                $addFields: {
                    createdAtDate: { $toDate: "$createdAt" },
                    yearGroup: { $year: { $toDate: "$createdAt" } },
                    monthGroup: { $month: { $toDate: "$createdAt" } },
                },
            },
            {
                $match: {
                    yearGroup: { $in: [currentYear, previousYear] },
                },
            },
            {
                $group: {
                    _id: { year: "$yearGroup", month: "$monthGroup" },
                    totalPlans: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: "$_id.year",
                    months: {
                        $push: {
                            month: "$_id.month",
                            totalPlans: "$totalPlans",
                        },
                    },
                },
            },
            {
                $sort: {
                    _id: -1,
                },
            },
        ]);

        return res.status(200).json({
            statusCode: 200,
            data,
        });
    } catch (error) {
        console.error("Error fetching graph data:", error);
        return res.status(500).json({
            statusCode: 500,
            message: "An error occurred while fetching graph data",
        });
    }
};

// **Update Plan (Superadmin)**
exports.updatePlan = async (req, res) => {
    const { PlanId } = req.params;
    const updateData = req.body;

    updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

    const existingPlan = await Plan.findOne({
        PlanName: {
            $regex: new RegExp("^" + updateData.PlanName + "$", "i"),
        },
        IsDelete: false,
    });

    if (existingPlan && PlanId !== existingPlan.PlanId) {
        return res.status(201).json({
            statusCode: 201,
            message: `${updateData.PlanName} name already exists`,
        });
    }

    const findMostPopularPlan = await Plan.findOne({
        IsMostpopular: true,
        IsDelete: false,
    });

    if (
        findMostPopularPlan &&
        PlanId !== findMostPopularPlan.PlanId &&
        updateData.IsMostpopular
    ) {
        return res.status(202).json({
            statusCode: 202,
            message: `The most popular plan has already been added.`,
        });
    }

    const result = await Plan.findOneAndUpdate(
        { PlanId: PlanId, IsDelete: false },
        { $set: updateData },
        { new: true }
    );

    if (result) {
        return res.status(200).json({
            statusCode: 200,
            message: "Plan updated successfully",
        });
    } else {
        return res.status(404).json({
            statusCode: 404,
            message: "Plan not found",
        });
    }
};

// **Delete Plan (Superadmin)**
exports.deletePlan = async (req, res) => {
    const { PlanId } = req.params;

    try {
        const result = await Plan.findOneAndUpdate(
            { PlanId: PlanId },
            { $set: { IsDelete: true } },
            { new: true }
        );

        if (!result) {
            return res.status(201).json({
                statusCode: 201,
                message: "Plan not found",
            });
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Plan Deleted Successfully",
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};

// **Get All Plans (Company)**
exports.getAllPlans = async (req, res) => {
    try {
        const data = await Plan.find({ IsDelete: false });

        return res.status(200).json({
            statusCode: 200,
            message: "Read All Plans",
            data,
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            statusCode: 500,
            message: "Something went wrong, please try later!",
        });
    }
};
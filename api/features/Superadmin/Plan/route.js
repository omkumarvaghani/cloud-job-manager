var express = require("express");
var router = express.Router();
const moment = require("moment");
const Plan = require("./model");
const { verifyLoginToken } = require("../../../authentication");
const { validatePlanBody, planValidationSchema } = require("./validation");

// Plan Post (Superadmin)
const createPlan = async (planData) => {
  const findPlanName = await Plan.findOne({
    PlanName: {
      $regex: new RegExp("^" + planData.plan_name + "$", "i"),
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
    return {
      statusCode: 202,
      message:
        "The most popular plan already exists. Do you want to replace it with the new plan?",
      existingPlan: findMostPopularPlan,
    };
  }

  if (!findPlanName) {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    planData["PlanId"] = uniqueId;
    planData["createdAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    planData["updatedAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");

    if (planData.IsMostpopular && findMostPopularPlan) {
      await Plan.updateOne(
        { PlanId: findMostPopularPlan.PlanId },
        { $set: { IsMostpopular: false } }
      );
    }

    const data = await Plan.create(planData);

    return {
      statusCode: 200,
      message: "Plan added successfully.",
      data: data,
    };
  } else {
    return {
      statusCode: 201,
      message: `Plan name ${planData.plan_name} is already added.`,
    };
  }
};

router.post("/", verifyLoginToken,validatePlanBody(planValidationSchema), async (req, res) => {
  try {
    const result = await createPlan(req.body);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

// Plan Get (Superadmin)
const getPlans = async (queryOptions) => {
  const { pageSize, pageNumber, searchQuery, sortField, sortOrder } =
    queryOptions;

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

  try {
    const totalDataCount = await Plan.countDocuments(query);
    const data = await Plan.find(query)
      .sort(sortOptions)
      .skip(pageNumber * pageSize)
      .limit(pageSize);

    return {
      statusCode: 200,
      data,
      count: totalDataCount,
    };
  } catch (error) {
    console.error("Error fetching plans:", error);
    return {
      statusCode: 404,
      message: "An error occurred while fetching plans",
    };
  }
};
router.get("/", verifyLoginToken, async (req, res) => {
  try {
    const pageSize =
      parseInt(req.query.pageSize) > 0 ? parseInt(req.query.pageSize) : 10;
    const pageNumber =
      parseInt(req.query.pageNumber) >= 0 ? parseInt(req.query.pageNumber) : 0;
    const searchQuery = req.query.search || "";
    const sortField = req.query.sortField || "updatedAt";
    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

    const queryOptions = {
      pageSize,
      pageNumber,
      searchQuery,
      sortField,
      sortOrder,
    };

    const result = await getPlans(queryOptions);

    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later!",
    });
  }
});

//-------------------------------------------------------------------------------------

  const getPlansGraphData = async (CompanyId, startDate, endDate) => {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    try {
      const data = await Plan.aggregate([
        {
          $match: {
            IsDelete: false,
            createdAt: { $exists: true, $ne: null },
            // CompanyId,
            // createdAt: {
            //   $gte: new Date(startDate), // Filter by start date
            //   $lte: new Date(endDate),   // Filter by end date
            // },
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
            yearGroup: { $in: [currentYear, previousYear] }, // Include only current and previous year
          },
        },
        {
          $group: {
            _id: { year: "$yearGroup", month: "$monthGroup" }, // Group by year and month
            totalPlans: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.year", // Group by year
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
            _id: -1, // Sort years descending (e.g., 2025 first, then 2024)
          },
        },
      ]);

      return {
        statusCode: 200,
        data,
      };
    } catch (error) {
      console.error("Error fetching graph data:", error);
      return {
        statusCode: 500,
        message: "An error occurred while fetching graph data",
      };
    }
  };

router.get("/graph",verifyLoginToken, async (req, res) => {
  try {
    const result = await getPlansGraphData();
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later!",
    });
  }
});

//-------------------------------------------------------------------------------------

// Plan Update (Superadmin)
const updatePlan = async (PlanId, updateData) => {
  updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  const existingPlan = await Plan.findOne({
    PlanName: {
      $regex: new RegExp("^" + updateData.PlanName + "$", "i"),
    },
    IsDelete: false,
  });

  if (existingPlan && PlanId !== existingPlan.PlanId) {
    return {
      statusCode: 201,
      message: `${updateData.PlanName} name already exists`,
    };
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
    return {
      statusCode: 202,
      message: `The most popular plan has already been added.`,
    };
  }

  const result = await Plan.findOneAndUpdate(
    { PlanId: PlanId, IsDelete: false },
    { $set: updateData },
    { new: true }
  );

  if (result) {
    return {
      statusCode: 200,
      message: "Plan updated successfully",
    };
  } else {
    return {
      statusCode: 404,
      message: "Plan not found",
    };
  }
};

router.put("/:PlanId", verifyLoginToken, async (req, res) => {
  try {
    const { PlanId } = req.params;
    const updateData = req.body;

    const result = await updatePlan(PlanId, updateData);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

// Plan Delete (Superadmin)
const deletePlan = async (PlanId) => {
  const result = await Plan.findOneAndUpdate(
    { PlanId: PlanId },
    { $set: { IsDelete: true } },
    { new: true }
  );

  if (!result) {
    return {
      statusCode: 201,
      message: "Plan not found",
    };
  }

  return {
    statusCode: 200,
    message: "Plan Deleted Successfully",
  };
};

router.delete("/:PlanId", verifyLoginToken, async (req, res) => {
  try {
    const { PlanId } = req.params;
    const result = await deletePlan(PlanId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

// Plan Get (Company)
const getAllPlans = async () => {
  const data = await Plan.find({ IsDelete: false });
  return {
    statusCode: 200,
    message: "Read All Plans",
    data,
  };
};

router.get("/plan", verifyLoginToken, async (req, res) => {
  try {
    const result = await getAllPlans();
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

module.exports = router;

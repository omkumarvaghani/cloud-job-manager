var express = require("express");
var router = express.Router();
var PlanPurchase = require("./model");
var Plan = require("../../Superadmin/Plan/model");
var Company = require("../Company/model");
const moment = require("moment");
const Activities = require("../ActivitiesModel");
const { verifyLoginToken, createToken } = require("../../../authentication");

const postPlanPurchase = async (data,req) => {
  const PlanPurchaseId = Date.now();
  const uniqueId = PlanPurchaseId;

  data["PlanPurchaseId"] = uniqueId;
  data["createdAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  data["updatedAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  try {
    await PlanPurchase.create(data);

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: PlanPurchase.CompanyId,
      Action: "ADD",
      Entity: "PlanPurchase",
      EntityId: PlanPurchase.PlanPurchaseId,
      ActivityBy: req.tokenData?.role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Added a new PlanPurchase)`,
      },
      Reason: "PlanPurchase creation",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      message: "Data posted successfully...",
    };
  } catch (error) {
    return {
      statusCode: 400,
      message: "Failed to post data.",
      error: error.message,
    };
  }
};
router.post("/", verifyLoginToken, async (req, res) => {
  try {
    const response = await postPlanPurchase(req.body);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

const getCompanyPlans = async (CompanyId) => {
  const company = await Company.findOne({
    companyId: CompanyId,
    IsDelete: false,
    IsActive: true,
    // IsPlanActive: true,
  });

  if (!company) {
    return {
      statusCode: 204,
      message: "Plan not found or already deleted",
    };
  }

  const data = await PlanPurchase.aggregate([
    {
      $match: {
        CompanyId: company.companyId,
        IsDelete: false,
      },
    },
    {
      $lookup: {
        from: "plans",
        localField: "PlanId",
        foreignField: "PlanId",
        as: "planDetails",
      },
    },
    {
      $unwind: {
        path: "$planDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 0,
        date: "$createdAt",
        status: "$IsActive",
        plan: "$planDetails.PlanName",
        MonthFrequency: "$planDetails.MonthFrequency",
        PlanPurchaseId: "$PlanPurchaseId",
        purchaseData: "$planDetails",
        SubscriptionId: "$SubscriptionId",
      },
    },
  ]);

  let activePlan = data.find((item) => item.status);

  if (activePlan) {
    let dueDate = new Date(activePlan.date);
    dueDate.setMonth(
      new Date(activePlan.date).getMonth() +
        Number(activePlan?.MonthFrequency?.split(" ")[0])
    );
    activePlan.dueDate = moment(dueDate).format("YYYY-MM-DD");
  }

  data.push({
    date: company.createdAt,
    status: company.IsPlanActive && !activePlan,
    plan: "Trial",
  });

  return {
    statusCode: 200,
    data: data.sort((a, b) => new Date(b.date) - new Date(a.date)),
    activePlan: activePlan
      ? {
          ...activePlan?.purchaseData,
          SubscriptionId: activePlan?.SubscriptionId,
          dueDate: activePlan?.dueDate,
        }
      : company.IsPlanActive
      ? {
          plan: "Trial",
          dueDate: moment(new Date(company.createdAt))
            .add(2, "weeks")
            .format("YYYY-MM-DD"),
          PlanDetail: "-",
          PlanName: "Trial",
        }
      : "",
  };
};

router.get("/company_plans/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const response = await getCompanyPlans(CompanyId);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------------------------------------------------------------------

const cancelPlan = async (CompanyId) => {
  const updateFields = {
    IsDelete: true,
    IsActive: false,
    updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
  };

  const result = await PlanPurchase.findOneAndUpdate(
    { CompanyId, IsDelete: false, IsActive: true },
    { $set: updateFields },
    { new: true }
  );

  if (!result) {
    return {
      statusCode: 204,
      message:
        "There was an issue with account cancelation. Please try again later.",
    };
  }

  const company = await Company.findOneAndUpdate(
    { companyId: CompanyId, IsDelete: false },
    { $set: { IsPlanActive: false } }
  );

  if (!company) {
    return {
      statusCode: 204,
      message:
        "There was an issue with account cancelation. Please try again later.",
    };
  }

  const tokenData = {
    companyId: company.companyId,
    full_name: company.ownerName,
    phoneNumber: company.phoneNumber,
    EmailAddress: company.EmailAddress,
    companyName: company.companyName,
    role: company.role,
    Address: company.Address,
    City: company.City,
    State: company.State,
    Country: company.Country,
    Zip: company.Zip,
    isActive: false,
    IsPlanActive: company.IsPlanActive,
  };

  const token = createToken(tokenData);

  return {
    statusCode: 200,
    token,
    message: "Account canceled successfully",
  };
};
router.delete("/cancel_plan/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const response = await cancelPlan(CompanyId);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

module.exports = router;

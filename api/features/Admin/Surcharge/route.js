var express = require("express");
var router = express.Router();
const moment = require("moment");
var Surcharge = require("./model");
const Activities = require("../ActivitiesModel");
const { verifyLoginToken } = require("../../../authentication");

// router.post("/",verifyLoginToken, async (req, res, next) => {
//   try {
//     const timestamp = Date.now();
//     const uniqueId = `${timestamp}`;

//     req.body["surchargeId"] = uniqueId;
//     let findSurcharge = await Surcharge.findOne({
//       CompanyId: req.body.CompanyId,
//       surchargePercent: req.body.surchargePercent,
//       surchargePercentDebit: req.body.surchargePercentDebit,
//       surchargePercentACH: req.body.surchargePercentACH,
//       surchargeFlatACH: req.body.surchargeFlatACH,
//       IsDelete: false,
//     });
//     if (!findSurcharge) {
//       const timestamp = Date.now();
//       const uniqueId = `${timestamp}`;

//       req.body["surchargeId"] = uniqueId;
//       req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
//       req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

//       var data = await Surcharge.create(req.body);
        
//       const admin = await Surcharge.findOne({ CompanyId: data.CompanyId });

//       await Activities.create({
//         ActivityId: `${Date.now()}`,
//         CompanyId: data.CompanyId,
//         Action: "ADD",
//         Entity: "Surcharge",
//         EntityId: data.surchargeId,
//         ActivityBy: req.role,
//         ActivityByUsername: req.userName,
//         Activity: {
//           description: `Added new Surcharge Setting for ${admin.first_name} ${admin.last_name}`,
//         },
//         createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//         updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//       });

//       return res.json({
//         statusCode: 200,
//         data: data,
//         message: "Add Surcharge Successfully",
//       });
//     } else {
//       return res.json({
//         statusCode: 201,
//         message: `${req.body.surchargePercent} Already Added`,
//       });
//     }
//   } catch (error) {
//     return res.status(500).json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });

const addSurcharge = async (req) => {
  try {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    req.body["surchargeId"] = uniqueId;
    
    const existingSurcharge = await Surcharge.findOne({
      CompanyId: req.body.CompanyId,
      surchargePercent: req.body.surchargePercent,
      surchargePercentDebit: req.body.surchargePercentDebit,
      surchargePercentACH: req.body.surchargePercentACH,
      surchargeFlatACH: req.body.surchargeFlatACH,
      IsDelete: false,
    });

    if (existingSurcharge) {
      return {
        statusCode: 201,
        message: `${req.body.surchargePercent} Already Added`,
      };
    }

    req.body["createdAt"] = moment().format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment().format("YYYY-MM-DD HH:mm:ss");

    const newSurcharge = await Surcharge.create(req.body);
    const admin = await Surcharge.findOne({ CompanyId: newSurcharge.CompanyId });

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: newSurcharge.CompanyId,
      Action: "ADD",
      Entity: "Surcharge",
      EntityId: newSurcharge.surchargeId,
      ActivityBy: req.role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Added new Surcharge Setting for ${admin.first_name} ${admin.last_name}`,
      },
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      data: newSurcharge,
      message: "Add Surcharge Successfully",
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

router.post("/", verifyLoginToken, async (req, res) => {
  try {
    const response = await addSurcharge(req);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

const getSurchargeByCompanyId = async (CompanyId) => {
  try {
    const data = await Surcharge.find({ CompanyId });

    
    if (data.length === 0) {
      return {
        statusCode: 404,
        message: "No record found for the specified CompanyId",
      };
    }

    return {
      statusCode: 200,
      data: data,
      message: "Data retrieved successfully.",
    };       
  } catch (error) {
    throw new Error(error.message);
  }
};

router.get("/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const CompanyId = req.params.CompanyId;
    const response = await getSurchargeByCompanyId(CompanyId);     
    return res.status(response.statusCode).json(response);
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});


// router.get("/:CompanyId",verifyLoginToken, async (req, res, next) => {
//   try {
//     const CompanyId = req.params.CompanyId;
//     const data = await Surcharge.find({ CompanyId });
       
//     if (data.length === 0) {
//       return res.json({
//         statusCode: 404,
//         message: "No record found for the specified CompanyId",
//       });
//     }

//     return res.json({
//       data: data,
//       statusCode: 200,
//       message: "Data retrive successfully.",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       statusCode: 500,
//       message: error.message,
//     });
//   }
// });


const updateSurcharge = async (surchargeId, body, role, userName) => {
  try {
    if (!body.surchargeFlatACH) {
      body.surchargeFlatACH = null;
    } else if (!body.surchargePercentACH) {
      body.surchargePercentACH = null;
    }

    body.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

    const result = await Surcharge.findOneAndUpdate(
      { surchargeId },
      { $set: body },
      { new: true }
    );

    if (result) {
      const admin = await Surcharge.findOne({ CompanyId: result.CompanyId });

      await Activities.create({
        ActivityId: `${Date.now()}`,
        CompanyId: result.CompanyId,
        Action: "UPDATE",
        Entity: "Surcharge",
        EntityId: result.surchargeId,
        ActivityBy: role,
        ActivityByUsername: userName,
        Activity: {
          description: `Updated Surcharge Setting for ${admin.first_name} ${admin.last_name}`,
        },
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      return {
        statusCode: 200,
        data: result,
        message: "Surcharge Updated Successfully",
      };
    } else {
      return {
        statusCode: 404,
        message: "Surcharge not found",
      };
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

router.put("/:surchargeId", verifyLoginToken, async (req, res) => {
  try {
    const { surchargeId } = req.params;
    const response = await updateSurcharge(surchargeId, req.body, req.role, req.userName);
    return res.status(response.statusCode).json(response);
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

// router.put("/:surchargeId",verifyLoginToken,  async (req, res, next) => {
//   try {
//     const { surchargeId } = req.params;

//     if (!surchargeId) {
//       return res.status(401).json({
//         statusCode: 401,
//         message: "surchargeId is required in the request body",
//       });
//     }
//     if (!req.body.surchargeFlatACH) {
//       req.body.surchargeFlatACH = null;
//     } else if (!req.body.surchargePercentACH ) {
//       req.body.surchargePercentACH = null;
//     }

//     req.body.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");

//     // Update the property if it exists
//     const result = await Surcharge.findOneAndUpdate(
//       { surchargeId },
//       { $set: req.body },
//       { new: true }
//     );

//     if (result) {
//       const admin = await Surcharge.findOne({ CompanyId: result.CompanyId });

//       await Activities.create({
//         ActivityId: `${Date.now()}`,
//         CompanyId: result.CompanyId,
//         Action: "UPDATE",
//         Entity: "Surcharge",
//         EntityId: result.surchargeId,
//         ActivityBy: req.role,
//         ActivityByUsername: req.userName,
//         Activity: {
//           description: `Updated Surcharge Setting for ${admin.first_name} ${admin.last_name}`,
//         },
//         createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//         updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//       });

//       return res.json({
//         statusCode: 200,
//         data: result,
//         message: "Surcharge Updated Successfully",
//       });
//     } else {
//       return res.status(404).json({
//         statusCode: 404,
//         message: "Surcharge not found",
//       });
//     }
//   } catch (err) {
//     return res.status(500).json({
//       statusCode: 500,
//       message: err.message,
//     });
//   }
// });

module.exports = router;

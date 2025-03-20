var express = require("express");
var router = express.Router();
const moment = require("moment");
const Labour = require("../Labour/model");
const LabourName = require("../../Worker/model");
const { verifyLoginToken } = require("../../../../authentication");
const Activities = require("../../ActivitiesModel");
const { validateLabourBody, labourValidationSchema } = require("./validation");

//Create labour for contract
const createLabour = async (data, req) => {
  const LabourId = Date.now();
  const uniqueId = LabourId;

  data["LabourId"] = uniqueId;
  data["createdAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  data["updatedAt"] = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  try {
    const userToSave = await Labour.create(data);

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: userToSave.CompanyId,
      Action: "CREATE",
      Entity: "Labour",
      EntityId: userToSave.LabourId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Created a new Labour`,
      },
      Reason: "Labour creation",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });
    return {
      statusCode: 200,
      message: "Labour Created Successfully",
      data: userToSave,
    };
  } catch (error) {
    return {
      statusCode: 400,
      message: "Failed to create labour.",
      error: error.message,
    };
  }
};
router.post("/", verifyLoginToken,validateLabourBody(labourValidationSchema), async (req, res) => {
  try {
    const response = await createLabour(req.body, req);
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

const fetchLabourData = async (ContractId, CompanyId) => {
  try {
    const result = await Labour.find({
      ContractId,
      CompanyId,
      IsDelete: false,
    });

    if (!result || result.length === 0) {
      return {
        statusCode: 204,
        message: `No data found for ContractId and CompanyId.`,
      };
    }

    const object = [];
    for (const item of result) {
      const data = await LabourName.findOne({
        WorkerId: item.WorkerId,
      });
      object.push({ ...item.toObject(), WorkerId: data });
    }

    return {
      statusCode: 200,
      message: `Data fetched successfully`,
      data: object,
    };
  } catch (error) {
    return {
      statusCode: 400,
      message: "Failed to fetch data.",
      error: error.message,
    };
  }
};
router.get("/:ContractId/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { ContractId, CompanyId } = req.params;
    const response = await fetchLabourData(ContractId, CompanyId);
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

// router.put("/:LabourId/:ContractId", verifyLoginToken, async (req, res) => {
//   const { LabourId, ContractId } = req.params;
//   const updateData = req.body;

//   try {
//     const updateLabour = await Labour.findOneAndUpdate(
//       { LabourId, ContractId },
//       {
//         $set: {
//           ...updateData,
//           updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
//         },
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updateLabour) {
//       return res.status(404).json({
//         statusCode: 404,
//         message: "Labour not found.",
//       });
//     }
//     await Activities.create({
//       ActivityId: `${Date.now()}`,
//       CompanyId: req.CompanyId,
//       Action: "UPDATE",
//       Entity: "Labour",
//       EntityId: LabourId,
//       ActivityBy: req.Role,
//       ActivityByUsername: req.userName,
//       Activity: {
//         description: `Updated a Labour `,
//       },
//       Reason: "Labour updating",
//       createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//       updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//     });
//     return res.status(200).json({
//       statusCode: 200,
//       message: "Labour updated successfully.",
//       data: updateLabour,
//     });
//   } catch (error) {
//     console.error(error.message);
//     return res.status(500).json({
//       statusCode: 500,
//       message: "Something went wrong, please try later!",
//     });
//   }
// });

const updateLabour = async (LabourId, ContractId, updateData, tokenData, userName, CompanyId) => {
  try {
    const updatedLabour = await Labour.findOneAndUpdate(
      { LabourId, ContractId },
      {
        $set: {
          ...updateData,
          updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedLabour) {
      return {
        statusCode: 404,
        message: "Labour not found.",
      };
    }

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: CompanyId,
      Action: "UPDATE",
      Entity: "Labour",
      EntityId: LabourId,
      ActivityBy: tokenData.role,
      ActivityByUsername: userName,
      Activity: {
        description: `Updated a Labour`,
      },
      Reason: "Labour updating",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      message: "Labour updated successfully.",
      data: updatedLabour,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Internal Server Error",
    };
  }
};

router.put("/:LabourId/:ContractId", verifyLoginToken, async (req, res) => {
  try {
    const { LabourId, ContractId } = req.params;
    const updateData = req.body;
    const { tokenData, userName, CompanyId } = req;

    const result = await updateLabour(LabourId, ContractId, updateData, tokenData, userName, CompanyId);

    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});


//-------------------------------------------------------------------------------------

const getLabourData = async (LabourId, ContractId) => {
  if (!LabourId || !ContractId) {
    return {
      statusCode: 400,
      message: "LabourId and ContractId are required!",
    };
  }

  const labourData = await Labour.findOne({
    LabourId,
    ContractId,
    IsDelete: false,
  });

  if (labourData) {
    return {
      statusCode: 200,
      data: labourData,
      message: "Data retrieved successfully.",
    };
  } else {
    return {
      statusCode: 404,
      message: "No data found for the given LabourId and ContractId.",
    };
  }
};

router.get("/labours/:LabourId/:ContractId", verifyLoginToken, async (req, res) => {
  try {
    const { LabourId, ContractId } = req.params;
    const result = await getLabourData(LabourId, ContractId);
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

const deleteLabourData = async (LabourId, ContractId, DeleteReason, req) => {
  try {
    const updatedLabour = await Labour.findOneAndUpdate(
      { LabourId, ContractId },
      {
        $set: {
          IsDelete: true,
          DeleteReason,
          updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedLabour) {
      return {
        statusCode: 404,
        message: `No labour found`,
      };
    }

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: req.CompanyId,
      Action: "DELETE",
      Entity: "Labour",
      EntityId: updatedLabour.LabourId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Deleted a Labour `,
      },
      Reason: req.body.DeleteReason,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      message: `Labour deleted successfully.`,
      data: updatedLabour,
    };
  } catch (error) {
    return {
      statusCode: 500,
      message: "Failed to soft delete labour data.",
      error: error.message,
    };
  }
};

router.delete("/:LabourId/:ContractId", verifyLoginToken, async (req, res) => {
  const { DeleteReason } = req.body;
  try {
    const { LabourId, ContractId } = req.params;
    const response = await deleteLabourData(
      LabourId,
      ContractId,
      DeleteReason,
      req
    );
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

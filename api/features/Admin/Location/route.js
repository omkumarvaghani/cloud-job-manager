var express = require("express");
var router = express.Router();
var Location = require("./model");
const moment = require("moment");
const { verifyLoginToken } = require("../../../authentication");
const Contract = require("../Contract/model");
const Quote = require("../Quote/model");
const Activities = require("../ActivitiesModel");
const { validateBody, LocationValidationSchema } = require("./validation");

// Post Properties for customer
const addLocation = async (locationData, req) => {
  const timestamp = Date.now();
  const uniqueId = `${timestamp}`;

  locationData["LocationId"] = uniqueId;
  locationData["createdAt"] = moment()
    .utcOffset(330)
    .format("YYYY-MM-DD HH:mm:ss");
  locationData["updatedAt"] = moment()
    .utcOffset(330)
    .format("YYYY-MM-DD HH:mm:ss");

  await Location.create(locationData);

  await Activities.create({
    ActivityId: `${Date.now()}`,
    CompanyId: locationData.CompanyId,
    Action: "CREATE",
    Entity: "Location",
    EntityId: locationData.CustomerId,
    ActivityBy:req.Role,
    ActivityByUsername: req.userName,
    Activity: {
      description: `Created a new Location ${locationData.Address} ${locationData.City} ${locationData.State} ${locationData.Zip} - ${locationData.Country}`,
    },
    Reason: "Location creation",
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  });
  return {
    statusCode: 200,
    message: "Location added successfully",
  };
};
router.post("/", verifyLoginToken,validateBody(LocationValidationSchema), async (req, res) => {
  try {
    const response = await addLocation(req.body, req);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//------------------------PUT PROPERTIES---------------------------------------

// Put Properties for customer
const updateLocation = async (LocationId, updateData, req) => {
  updateData.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

  const result = await Location.findOneAndUpdate(
    { LocationId: LocationId, IsDelete: false },
    { $set: updateData },
    { new: true }
  );
  await Activities.create({
    ActivityId: `${Date.now()}`,
    CompanyId: req.CompanyId,
    Action: "UPDATE",
    Entity: "Location",
    EntityId: updateData.CustomerId,
    ActivityBy: req.Role,
    ActivityByUsername: req.userName,
    Activity: {
      description: `Updated a Location ${updateData.Address} ${updateData.City} ${updateData.State} ${updateData.Zip} - ${updateData.Country}`,
    },
    Reason: "Location updating",
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  });

  if (result) {
    return {
      statusCode: 200,
      message: "Location updated successfully",
    };
  } else {
    return {
      statusCode: 404,
      message: "Location not found",
    };
  }
};
router.put("/:LocationId", verifyLoginToken, async (req, res) => {
  const { LocationId } = req.params;
  const updateData = req.body;

  try {
    const result = await updateLocation(LocationId, updateData, req);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//-------------------------GET PROPERTIES--------------------------------------

const getPropertyByLocationId = async (LocationId) => {
  const pipeline = [
    {
      $match: {
        LocationId: LocationId,
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

  const result = await Location.aggregate(pipeline);

  if (!result || result.length === 0 || !result[0].property) {
    return {
      statusCode: 404,
      message: "Property not found or already deleted",
    };
  }

  return {
    statusCode: 200,
    data: result[0].property,
  };
};

router.get("/properties/:LocationId", verifyLoginToken, async (req, res) => {
  const { LocationId } = req.params;

  try {
    const result = await getPropertyByLocationId(LocationId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//--------------------------DELETE PROPERTIES------------------------------------------

// Delete Property in customer
const deleteLocation = async (req,LocationId ,DeleteReason) => {
  const findContract = await Contract.findOne({ LocationId });
  const findQuote = await Quote.findOne({ LocationId });

  if (findContract || findQuote) {
    return {
      statusCode: 202,
      message: "You can't delete Location, It's already in use",
    };
  }

  const findLocation = await Location.findOneAndUpdate(
    { LocationId, IsDelete: false },
    { $set: { IsDelete: true, DeleteReason} },
    { new: true }
  );

  await Activities.create({
    ActivityId: `${Date.now()}`,
    CompanyId: req.CompanyId,
    Action: "DELETE",
    Entity: "Location",
    EntityId: findLocation.LocationId,
    ActivityBy: req.Role,
    ActivityByUsername: req.userName,
    Activity: {
      description: `Deleted a Location ${findLocation.Address} ${findLocation.City} ${findLocation.State} ${findLocation.Zip} - ${findLocation.Country}`,
    },
    Reason: "Location deletion",
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  }); 

  if (findLocation) {
    return {
      statusCode: 200,
      message: "Location deleted successfully",
    };
  } else {
    return {
      statusCode: 404,
      message: "Location not found or deletion failed",
    };
  }
};
router.delete("/:LocationId", verifyLoginToken, async (req, res) => {
  const { LocationId } = req.params;
  const { DeleteReason } = req.body; 
  try {
    const result = await deleteLocation(req,LocationId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});


module.exports = router;

var express = require("express");
var router = express.Router();
var Key = require("./model");
var Company = require("../../Admin/Company/model");
const { verifyLoginToken } = require("../../../authentication");
const moment = require("moment");

router.post("/", verifyLoginToken, async (req, res) => {
  try {
    const timestamp = Date.now();
    const uniqueId = `${timestamp}`;

    const companyId = req.body.CompanyId;

    const company = await Company.findOne({
      companyId: companyId,
      IsDelete: false,
    });

    if (!company) {
      return res.status(404).json({
        statusCode: 404,
        message: "Company not found",
      });
    }

    const companyName = company.companyName;

    req.body["NmiKeyId"] = uniqueId;
    req.body["createdAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    req.body["updatedAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    req.body["CompanyId"] = companyId;
    req.body["CompanyName"] = companyName;

    await Key.create(req.body);

    return res.status(201).json({
      statusCode: 201,
      message: "NMI Key added successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});
router.get("/", verifyLoginToken, async (req, res) => {
  try {
    
    //5206 code start: "Search filter"
    const pageNumber = parseInt(req.query.pageNumber) || 0;
    const limit = parseInt(req.query.pageSize) || 10;
    let startIndex = pageNumber * limit;

    const search = req.query.search || "";

    const query = {
      IsDelete: false,
      CompanyName: { $regex: search, $options: "i" },
    };

    const data = await Key.find(query)
      .sort("_id")
      .skip(startIndex)
      .limit(limit)
      .exec();

    const count = await Key.countDocuments(query).exec();

    return res.status(200).json({
      message: "Posts Data Fetched successfully",
      data,
      count,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Sorry, something went wrong",
    });
  }
});

router.put("/:NmiKeyId", verifyLoginToken, async (req, res) => {
  try {
    const { NmiKeyId } = req.params;

    req.body.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

    const result = await Key.findOneAndUpdate(
      { NmiKeyId: NmiKeyId, IsDelete: false },
      { $set: req.body },
      { new: true }
    );

    if (result) {
      res.status(200).json({
        statusCode: 200,
        message: "Security key updated successfully",
      });
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "Security key not found",
      });
    }
  } catch (err) {
    console.error("Error updating Security key:", err);
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

router.delete("/:NmiKeyId", verifyLoginToken, async (req, res) => {
  const NmiKeyId = req.params.NmiKeyId;
  try {
    let result = await Key.findOneAndUpdate(
      { NmiKeyId: NmiKeyId },
      { $set: { IsDelete: true } },
      { new: true }
    );

    if (!result) {
      return res.status(200).json({
        statusCode: 201,
        message: "NMI Key not found",
      });
    }

    res.json({
      statusCode: 200,
      message: "NMI Key Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err.message,
    });
  }
});

module.exports = router;

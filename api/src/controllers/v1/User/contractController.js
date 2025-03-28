const Contract = require("../../../models/User/Contract");
const ContractItem = require("../../../models/User/ContractItem");
const Visit = require("../../../models/User/Visit");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const { logUserEvent } = require("../../../middleware/eventMiddleware");
const User = require("../../../models/User/User");
const { addNotification } = require("../../../models/User/AddNotification");

// **CREATE CONTRACT**
const createOneoffVisits = async (
  oneOffJob,
  title,
  description,
  companyId,
  customerId,
  contractId,
  workerId,
  locationId
) => {
  const { StartDate, EndDate } = oneOffJob;

  const startDate = moment(StartDate);
  const endDate = EndDate ? moment(EndDate) : startDate;
  const visits = [];

  const visitData = {
    ItemName: title,
    Note: description,
    CompanyId: companyId,
    UserId: customerId,
    ContractId: contractId,
    WorkerId: workerId,
    LocationId: locationId,
  };

  for (
    let date = startDate.clone();
    date.isBefore(endDate) || date.isSame(endDate, "day");
    date.add(1, "days")
  ) {
    const VisitId = `${Date.now()}-${date.format("YYYYMMDD")}`;

    visits.push({
      ...visitData,
      VisitId,
      StartDate: date.format("YYYY-MM-DD"),
      StartTime: oneOffJob.StartTime,
      EndDate: date.format("YYYY-MM-DD"),
      EndTime: oneOffJob.EndTime,
    });
  }

  if (visits.length > 0) {
    await Visit.insertMany(visits);
  }
};

const createRecuringVisits = async (
  jobData,
  title,
  description,
  companyId,
  customerId,
  contractId,
  workerId,
  locationId,
  isRecurring = false
) => {
  try {
    const { StartDate, Repeats, StartTime, EndTime, Duration, Frequency } =
      jobData;
    const startDate = moment(StartDate);
    const visits = [];

    const visitData = {
      ItemName: title,
      Note: description,
      CompanyId: companyId,
      UserId: customerId,
      ContractId: contractId,
      WorkerId: workerId,
      LocationId: locationId,
      StartTime,
      EndTime,
      Duration,
    };

    const calculateTotalVisits = (repeats, duration, frequency) => {
      switch (repeats) {
        case "Weekly on":
          if (duration === "day(s)") {
            return 1;
          } else if (duration === "week(s)") {
            return frequency;
          } else if (duration === "month(s)") {
            return frequency * 4;
          } else if (duration === "year(s)") {
            return frequency * 52;
          }
          break;

        case "Every 2 Weeks on":
          if (duration === "day(s)") {
            return 1;
          } else if (duration === "week(s)") {
            return Math.ceil(frequency / 2);
          } else if (duration === "month(s)") {
            return frequency * 2;
          } else if (duration === "year(s)") {
            return frequency * 26;
          }
          break;

        case "Monthly on the date":
          if (duration === "day(s)") {
            return 1;
          } else if (duration === "week(s)") {
            return Math.ceil(frequency / 4);
          } else if (duration === "month(s)") {
            return frequency;
          } else if (duration === "year(s)") {
            return frequency * 12;
          }
          break;

        default:
          return 1;
      }
    };
    const totalVisits = calculateTotalVisits(Repeats, Duration, Frequency);

    for (let i = 0; i < totalVisits; i++) {
      let visitDate;
      switch (Repeats) {
        case "Weekly on":
          visitDate = startDate.clone().add(i, "weeks");
          break;
        case "Every 2 Weeks on":
          visitDate = startDate.clone().add(i * 2, "weeks");
          break;
        case "Monthly on the date":
          visitDate = startDate.clone().add(i, "months");
          break;
        default:
          visitDate = startDate.clone();
      }

      const VisitId = Date.now() + i;

      visits.push({
        ...visitData,
        VisitId,
        StartDate: visitDate.format("YYYY-MM-DD"),
        EndDate: visitDate.format("YYYY-MM-DD"),
      });
    }

    if (visits.length > 0) {
      const visitPromises = visits.map((visit) => Visit.create(visit));
      await Promise.all(visitPromises);
    }

    return visits.length;
  } catch (error) {
    console.error("Error creating visits:", error);
    throw new Error("Error creating visits: " + error.message);
  }
};

exports.createContract = async (req, res) => {
  const contractData = req.body;
  if (contractData._id) {
    delete contractData._id;
  }
  const uniqueId = uuidv4();
  contractData.ContractId = uniqueId;

  try {
    const assignPersonIds = Array.isArray(contractData.UserId)
      ? contractData.UserId
      : contractData.UserId
        ? [contractData.UserId]
        : [];

    contractData.WorkerId = assignPersonIds;

    const createdContract = await Contract.create(contractData);

    await logUserEvent(
      contractData.CompanyId,
      "CREATE",
      `Successfully created contract with ContractId: ${createdContract.ContractId}`,
      { ContractId: createdContract.ContractId }
    );

    if (createdContract.QuoteId) {
      const status = await Contract.updateOne(
        { ContractId: createdContract.ContractId },
        { $set: { Status: "Converted" } }
      );
      Contract.Status = "Converted";
      await logUserEvent(
        contractData.CompanyId,
        "UPDATE",
        `Contract with ContractId: ${createdContract.ContractId} converted to 'Converted' status`,
        { ContractId: createdContract.ContractId }
      );
    }

    if (
      Array.isArray(contractData.products) &&
      contractData.products.length > 0
    ) {
      const productPromises = contractData.products.map(
        async (product, index) => {
          const uniqueItemId = uuidv4();

          if (product._id) {
            delete product._id;
          }
          product.ContractId = uniqueId;
          product.ContractItemId = uniqueItemId;
          product.LocationId = contractData.LocationId;
          product.UserId = contractData.UserId;
          product.CompanyId = contractData.CompanyId;
          product.createdAt = moment()
            .utcOffset(330)
            .format("YYYY-MM-DD HH:mm:ss");
          product.updatedAt = moment()
            .utcOffset(330)
            .format("YYYY-MM-DD HH:mm:ss");

          const createdProduct = await ContractItem.create(product);
          return createdProduct;
        }
      );

      await Promise.all(productPromises);
    }

    if (
      contractData.OneoffJob &&
      contractData.OneoffJob.StartDate !== "" &&
      contractData.OneoffJob.EndDate !== ""
    ) {
      await createOneoffVisits(
        contractData.OneoffJob,
        contractData.Title,
        contractData.Description,
        contractData.CompanyId,
        contractData.UserId,
        contractData.ContractId,
        assignPersonIds,
        contractData.LocationId
      );
      await logUserEvent(
        contractData.CompanyId,
        "CREATE",
        `Created one-off visits for ContractId: ${contractData.ContractId}`,
        { ContractId: contractData.ContractId }
      );
    }

    if (contractData.RecuringJob && contractData.RecuringJob.StartDate !== "") {
      await createRecuringVisits(
        contractData.RecuringJob,
        contractData.Title,
        contractData.Description,
        contractData.CompanyId,
        contractData.UserId,
        contractData.ContractId,
        assignPersonIds,
        contractData.LocationId,
        true
      );
      await logUserEvent(
        contractData.CompanyId,
        "CREATE",
        `Created recurring visits for ContractId: ${contractData.ContractId}`,
        { ContractId: contractData.ContractId }
      );
    }
    console.log(contractData, 'contractData')
    const notificationData = {
      CompanyId: contractData.CompanyId,
      UserId: contractData.UserId,
      ContractId: contractData.ContractId,
      LocationId: contractData.LocationId,
      WorkerId: assignPersonIds,
      CreatedBy: "ContractCreated",
      AddedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
    };

    await addNotification(notificationData);
    return res.status(200).json({
      statusCode: 200,
      message: "Contract created successfully",
      data: createdContract,
    });
  } catch (error) {
    console.error("Error creating contract:", error);
    await logUserEvent(
      contractData.CompanyId,
      "ERROR",
      `Failed to create contract with ContractId: ${contractData.ContractId}`,
      { error: error.message }
    );
    return res.status(500).json({
      statusCode: 500,
      message: "Error creating contract",
      error: error.message,
    });
  }
};

// **CHECK CONTRACT NUMBER**
exports.checkContractNumber = async (req, res) => {
  const { CompanyId } = req.params;
  const { ContractNumber } = req.body;

  const findNumber = await Contract.findOne({
    CompanyId: CompanyId,
    ContractNumber: ContractNumber,
    IsDelete: false,
  });

  if (findNumber) {
    return res.status(203).json({
      statusCode: 203,
      message: "Number already exists",
    });
  } else {
    return res.status(200).json({
      statusCode: 200,
      message: "Ok",
    });
  }
};

// **GET CONTRACT FOR COMPANY TABLE**
exports.getContracts = async (req, res) => {
  try {
    const { CompanyId } = req.params;
    if (!CompanyId) {
      return res.status(400).json({ message: "CompanyId is required" });
    }

    const query = req.query;
    const pageSize = parseInt(query.pageSize) || 10;
    const pageNumber = parseInt(query.pageNumber) || 0;
    const search = query.search;
    const sortOrder = query.sortOrder?.toLowerCase() === "desc" ? -1 : 1;
    const statusFilter = query.statusFilter;

    const allowedSortFields = [
      "customer.FirstName",
      "customer.LastName",
      "location.Address",
      "location.City",
      "location.State",
      "location.Country",
      "location.Zip",
      "updatedAt",
      "createdAt",
      "Total",
      "Status",
    ];
    const sortField = allowedSortFields.includes(query.sortField)
      ? query.sortField
      : "updatedAt";

    let contractSearchQuery = { CompanyId, IsDelete: false };

    if (statusFilter && statusFilter !== "All") {
      contractSearchQuery.Status = statusFilter;
    }

    const sortOptions = { [sortField]: sortOrder };

    const basePipeline = [
      { $match: contractSearchQuery },
      {
        $lookup: {
          from: "user-profiles",
          localField: "UserId",
          foreignField: "UserId",
          as: "customerData",
        },
      },
      { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "locations",
          localField: "LocationId",
          foreignField: "LocationId",
          as: "locationData",
        },
      },
      { $unwind: { path: "$locationData", preserveNullAndEmptyArrays: true } },
      {
        $set: {
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
            { "customer.FirstName": { $regex: searchRegex } },
            { "customer.LastName": { $regex: searchRegex } },
            { "location.Address": { $regex: searchRegex } },
            { "location.City": { $regex: searchRegex } },
            { "location.State": { $regex: searchRegex } },
            { "location.Country": { $regex: searchRegex } },
            { "location.Zip": { $regex: searchRegex } },
            { Title: { $regex: searchRegex } },
            { ContractNumber: { $regex: searchRegex } },
          ],
        };
      });

      basePipeline.push({
        $match: {
          $and: [contractSearchQuery, { $and: searchConditions }],
        },
      });
    }

    const countPipeline = [
      { $match: contractSearchQuery },
      { $count: "totalCount" },
    ];

    const collation = { locale: "en", strength: 2 };

    const mainPipeline = [
      ...basePipeline,
      {
        $project: {
          CompanyId: 1,
          UserId: 1,
          ContractId: 1,
          LocationId: 1,
          WorkerId: 1,
          Title: 1,
          Status: 1,
          OneoffJob: 1,
          RecuringJob: 1,
          ContractNumber: 1,
          IsOneoffJob: 1,
          IsRecuringJob: 1,
          QuoteId: 1,
          customer: 1,
          location: 1,
          Total: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: sortOptions },
      { $skip: pageNumber * pageSize },
      { $limit: pageSize },
    ];

    const [countResult, contractData] = await Promise.all([
      Contract.aggregate(countPipeline),
      Contract.aggregate(mainPipeline).collation(collation),
    ]);

    const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

    return res.status(200).json({
      data: contractData,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: pageNumber,
      message:
        contractData.length > 0
          ? "Contracts retrieved successfully"
          : "No contracts found",
    });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// **GET CONTRACT DETAILS FOR COMPANY**
exports.getContractDetails = async (req, res) => {
  const { ContractId } = req.params;
  console.log(ContractId, "ContractId");
  if (!ContractId) {
    return res.status(400).json({ message: "ContractId is required!" });
  }

  const contracts = await Contract.aggregate([
    {
      $match: { ContractId, IsDelete: false },
    },
    {
      $lookup: {
        from: "user-profiles",
        localField: "UserId",
        foreignField: "UserId",
        as: "customerData",
      },
    },
    { $unwind: "$customerData" },
    {
      $lookup: {
        from: "users",
        localField: "UserId",
        foreignField: "UserId",
        as: "userData",
      },
    },
    { $unwind: "$userData" },
    {
      $set: {
        customer: {
          FirstName: "$customerData.FirstName",
          LastName: "$customerData.LastName",
          PhoneNumber: "$customerData.PhoneNumber",
          EmailAddress: "$userData.EmailAddress",
          UserId: "$customerData.UserId",
        },
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
    { $unwind: { path: "$locationData", preserveNullAndEmptyArrays: true } },
    {
      $set: {
        location: {
          Address: "$locationData.Address",
          City: "$locationData.City",
          State: "$locationData.State",
          Country: "$locationData.Country",
          Zip: "$locationData.Zip",
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "CompanyId",
        foreignField: "CompanyId",
        as: "companyData",
      },
    },
    { $unwind: "$companyData" },
    {
      $lookup: {
        from: "contract-items",
        let: { contractId: "$ContractId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$ContractId", "$$contractId"] },
                  { $eq: ["$IsDelete", false] },
                ],
              },
            },
          },
          {
            $project: {
              ContractItemId: 1,
              CompanyId: 1,
              Type: 1,
              Name: 1,
              Description: 1,
              Unit: 1,
              CostPerUnit: 1,
              Hourly: 1,
              CostPerHour: 1,
              Square: 1,
              CostPerSquare: 1,
              Fixed: 1,
              CostPerFixed: 1,
              Total: 1,
              Attachment: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
        as: "Items",
      },
    },
    {
      $project: {
        ContractId: 1,
        CompanyId: 1,
        UserId: 1,
        LocationId: 1,
        WorkerId: 1,
        Title: 1,
        Description: 1,
        StartDate: 1,
        ContractNumber: 1,
        CompletionDate: 1,
        Status: 1,
        EventLog: 1,
        IsOneoffJob: 1,
        IsRecuringJob: 1,
        OneoffJob: 1,
        RecuringJob: 1,
        Team: 1,
        RemindInvoice: 1,
        Notes: 1,
        Attachment: 1,
        Discount: 1,
        Tax: 1,
        subTotal: 1,
        Total: 1,
        createdAt: 1,
        updatedAt: 1,
        Items: 1,
        customer: 1,
        location: 1,
        companyData: 1,
      },
    },
  ]);

  if (contracts.length === 0) {
    return res.status(204).json({
      message: "Contract not found!",
      data: {},
    });
  }

  return res.status(200).json({
    statusCode: 200,
    data: contracts[0] || {},
    message: "Contract retrieved successfully",
  });
};

// **GET CONTRACT MAX CONTRACT NUMBER**
exports.getMaxContractNumber = async (req, res) => {
  try {
    const { CompanyId } = req.params;

    const totalContract = await Contract.find({
      CompanyId,
      IsDelete: false,
    }).select("ContractNumber");

    const contractNumbers = totalContract.map((contract) =>
      parseInt(contract.ContractNumber, 10)
    );

    contractNumbers.sort((a, b) => a - b);

    let maxContractNumber = 1;

    for (let i = 0; i < contractNumbers.length; i++) {
      if (contractNumbers[i] === maxContractNumber) {
        maxContractNumber++;
      }
    }

    return res.status(200).json({
      statusCode: 200,
      contractNumber: maxContractNumber,
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

// **GET CUSTOMER ASSIGN CONTRACT**
exports.getContractByCustomer = async (req, res) => {
  const { CompanyId, UserId } = req.params;

  if (!CompanyId || !UserId) {
    return res
      .status(400)
      .json({ message: "CompanyId and UserId are required!" });
  }

  const contracts = await Contract.aggregate([
    {
      $match: { CompanyId, UserId, IsDelete: false },
    },
    {
      $lookup: {
        from: "user-profiles",
        localField: "UserId",
        foreignField: "UserId",
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
    { $unwind: { path: "$locationData", preserveNullAndEmptyArrays: true } },
    {
      $set: {
        customer: {
          FirstName: "$customerData.FirstName",
          LastName: "$customerData.LastName",
        },
        location: {
          Address: {
            $ifNull: ["$locationData.Address", "$customerData.Address"],
          },
          City: { $ifNull: ["$locationData.City", "$customerData.City"] },
          State: { $ifNull: ["$locationData.State", "$customerData.State"] },
          Country: {
            $ifNull: ["$locationData.Country", "$customerData.Country"],
          },
          Zip: { $ifNull: ["$locationData.Zip", "$customerData.Zip"] },
        },
      },
    },
    { $sort: { updatedAt: -1 } },
    {
      $project: {
        CompanyId: 1,
        UserId: 1,
        ContractId: 1,
        LocationId: 1,
        Title: 1,
        ContractNumber: 1,
        Status: 1,
        IsOneoffJob: 1,
        IsRecuringJob: 1,
        OneoffJob: 1,
        RecuringJob: 1,
        StartDate: 1,
        customer: 1,
        location: 1,
        Total: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (contracts.length === 0) {
    return res.status(204).json({
      message: "Contract not found!",
      data: {},
    });
  }

  return res.status(200).json({
    data: contracts,
    message: "Contracts retrieved successfully",
  });
};

// **UPDATE CONTRACT**
exports.updateContract = async (req, res) => {
  const { ContractId } = req.params;
  const { products, ...contractData } = req.body;

  if (!ContractId) {
    return {
      statusCode: 400,
      message: "ContractId is required!",
    };
  }

  const contract = await Contract.findOne({ ContractId, IsDelete: false });

  if (!contract) {
    return {
      statusCode: 404,
      message: "Contract not found!",
    };
  }

  Object.assign(contract, contractData);
  contract.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  await contract.save();

  if (
    contractData.OneoffJob &&
    contractData.OneoffJob.StartDate !== "" &&
    contractData.OneoffJob.EndDate !== ""
  ) {
    const assignPersonIds = Array.isArray(contract.UserId)
      ? contract.UserId
      : [];

    await createOneoffVisits(
      contractData.OneoffJob,
      contractData.Title,
      contractData.Description,
      contract.CompanyId,
      contract.UserId,
      contract.ContractId,
      assignPersonIds,
      contract.LocationId
    );
  }

  await Visit.updateMany({ ContractId, IsRecurring: true }, { IsDelete: true });

  if (contractData.RecuringJob && contractData.RecuringJob.StartDate !== "") {
    const assignPersonIds = Array.isArray(contract.UserId)
      ? contract.UserId
      : [];

    await createRecuringVisits(
      contractData.RecuringJob,
      contractData.Title,
      contractData.Description,
      contract.CompanyId,
      contract.UserId,
      contract.ContractId,
      assignPersonIds,
      contract.LocationId,
      true
    );
  }

  const existingItems = await ContractItem.find({
    ContractId,
    IsDelete: false,
  });

  const incomingItemIds = products
    .map((item) => item.ContractItemId)
    .filter(Boolean);

  const itemsToDelete = existingItems.filter(
    (item) => !incomingItemIds.includes(item.ContractItemId)
  );

  const deletePromises = itemsToDelete.map((item) =>
    ContractItem.findOneAndUpdate(
      { ContractItemId: item.ContractItemId },
      { IsDelete: true }
    )
  );
  await Promise.all(deletePromises);

  if (Array.isArray(products) && products.length > 0) {
    const detailPromises = products.map(async (detail, index) => {
      detail.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");

      if (!detail.ContractItemId) {
        const newContractItem = {
          ...detail,
          ContractId: contract.ContractId,
          ContractItemId: `${Date.now() + index}`,
          createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
        };
        return await ContractItem.create(newContractItem);
      } else {
        const updatedItem = await ContractItem.findOneAndUpdate(
          { ContractItemId: detail.ContractItemId, IsDelete: false },
          { $set: detail },
          { new: true }
        );
        if (!updatedItem) {
          return {
            statusCode: 404,
            message: "ContractItem not found!",
          };
        }
        return updatedItem;
      }
    });

    await Promise.all(detailPromises);
  }
  await logUserEvent(
    contract.CompanyId,
    "UPDATE",
    `Contract ${contract.ContractId} updated.`,
    {
      ContractId: contract.ContractId,
      CompanyId: contract.CompanyId,
      UpdatedFields: contractData,
      DeletedItems: itemsToDelete.map((item) => item.ContractItemId),
      AddedItems: products
        .filter((item) => !item.ContractItemId)
        .map((item) => item.ContractItemId),
      UpdatedItems: products
        .filter((item) => item.ContractItemId)
        .map((item) => item.ContractItemId),
    }
  );

  return res.status(200).json({
    statusCode: 200,
    message: "Contract updated successfully.",
    data: contract,
    products,
  });
};

// **DELETE CONTRACT**
exports.deleteContract = async (req, res) => {
  const { ContractId } = req.params;
  const { DeleteReason } = req.body;

  if (!ContractId) {
    return {
      statusCode: 400,
      message: "ContractId is required!",
    };
  }
  // const [findLabour, findExpenses, findVisits, findInvoices] =
  //     await Promise.all([
  //         Labour.findOne({ ContractId, IsDelete: false }),
  //         Expenses.findOne({ ContractId, IsDelete: false }),
  //         Visits.findOne({ ContractId, IsDelete: false }),
  //         Invoice.findOne({ ContractId, IsDelete: false }),
  //     ]);

  // if (findLabour || findExpenses || findVisits || findInvoices) {
  //     return {
  //         statusCode: 202,
  //         message:
  //             "You can't delete the contract; it's already assigned to other records (labour, expenses, visits, or invoices).",
  //     };
  // }

  // const dropboxEntry = await Dropbox.findOne({ ContractId });
  // if (dropboxEntry && dropboxEntry.signatureRequestId) {
  //     await removeSignatureRequest(dropboxEntry.signatureRequestId);
  // }

  const [deletedContract, updatedItems] = await Promise.all([
    Contract.findOneAndUpdate(
      { ContractId },
      { $set: { IsDelete: true } },
      { new: true }
    ),
    ContractItem.updateMany({ ContractId }, { $set: { IsDelete: true } }),
  ]);

  // Mark related notifications as deleted (if needed in the future)
  // const updatedNotifications = await Notification.updateMany(
  //     { ContractId },
  //     { $set: { IsDelete: true } }
  // );

  if (!deletedContract) {
    return {
      statusCode: 404,
      message: "Contract not found or deletion failed.",
    };
  }

  await logUserEvent(
    deletedContract.CompanyId,
    "DELETE",
    `Contract ${ContractId} was deleted.`,
    {
      ContractId,
      CompanyId: deletedContract.CompanyId,
      DeleteReason: DeleteReason || "No reason provided",
      DeletedItemsCount: updatedItems.modifiedCount,
    }
  );

  return res.status(200).json({
    statusCode: 200,
    message: "Contract deleted successfully!",
  });
};

// **GET CONTRACT IN INVOICE AFTER SELECT CUSTOMER INVOICE**
exports.getInvoiceDataByCustomerId = async (req, res) => {
  try {
    const { UserId } = req.params;
    if (!UserId) {
      return res.status(400).json({
        statusCode: 400,
        message: "UserId is required",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isoToday = new Date(today).toISOString();

    console.log("isoToday:", isoToday);

    const result = await User.aggregate([
      {
        $match: {
          UserId: UserId,
          IsDelete: false,
        },
      },
      {
        $lookup: {
          from: "contracts",
          localField: "UserId",
          foreignField: "UserId",
          as: "contracts",
          pipeline: [
            {
              $match: {
                IsDelete: false,
              },
            },
            {
              $lookup: {
                from: "locations",
                localField: "LocationId",
                foreignField: "LocationId",
                as: "locationDetails",
              },
            },
            {
              $unwind: {
                path: "$locationDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "visits",
                localField: "ContractId",
                foreignField: "ContractId",
                as: "visits",
                pipeline: [
                  {
                    $match: {
                      IsDelete: false,
                      $or: [
                        {
                          $and: [
                            { StartDate: { $lte: new Date(isoToday) } }, // First argument: field, Second: value to compare
                            { EndDate: { $gte: new Date(isoToday) } },
                          ],
                        },
                        {
                          StartDate: { $gt: new Date(isoToday) }, // For upcoming visits
                        },
                      ],
                    },
                  },
                  { $sort: { StartDate: 1 } },
                  {
                    $group: {
                      _id: "$ContractId",
                      todayVisit: {
                        $first: {
                          $cond: [
                            {
                              $and: [
                                { StartDate: { $lte: new Date(isoToday) } },
                                { EndDate: { $gte: new Date(isoToday) } },
                              ],
                            },
                            "$$ROOT",
                            null,
                          ],
                        },
                      },
                      upcomingVisits: { $push: "$$ROOT" },
                    },
                  },
                  {
                    $project: {
                      todayVisit: 1,
                      upcomingVisits: { $slice: ["$upcomingVisits", 2] },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ]);

    if (!result || !result.length) {
      return res.status(404).json({
        statusCode: 404,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      data: result[0],
      message: "Data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching invoice data:", error.message);
    return res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
      error: error.message,
    });
  }
};

const Contract = require("../../../models/User/Contract");
const ContractItem = require("../../../models/User/ContractItem");
const Visit = require("../../../models/User/Visit");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const { logUserEvent } = require("../../../middleware/eventMiddleware");
const User = require("../../../models/User/User");
const { addNotification } = require("../../../models/User/AddNotification");
const Notification = require("../../../models/User/Notification");

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
    CustomerId: customerId,
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
      CustomerId: customerId,
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
  contractData.CustomerId = contractData.UserId;

  try {
    const existingContract = await Contract.findOne({
      ContractNumber: contractData.ContractNumber,
      CompanyId: contractData.CompanyId,
    });

    if (existingContract) {
      return res.status(400).json({
        statusCode: 400,
        message: `ContractNumber ${contractData.ContractNumber} is already in use.`,
      });
    }

    const assignPersonIds = contractData.selectedTeams.map(
      (team) => team.WorkerId
    );

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
          product.CustomerId = contractData.CustomerId;
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
        contractData.CustomerId,
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
        contractData.CustomerId,
        contractData.ContractId,
        assignPersonIds,
        contractData.LocationId,
        true
      );
      await logUserEvent(
        contractData.CompanyId,
        "CREATE",
        `Created recurring visits for ContractId: ${contractData.ContractId}`,
        { createdContract }
      );
    }

    const notificationData = {
      CompanyId: contractData.CompanyId,
      CustomerId: contractData.CustomerId,
      ContractId: contractData.ContractId,
      LocationId: contractData.LocationId,
      WorkerId: assignPersonIds,
      CreatedBy: "Contract creation",
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
    const search = query.search?.trim();
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
          localField: "CustomerId",
          foreignField: "UserId",
          as: "customerData",
        },
      },
      { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "CustomerId",
          foreignField: "UserId",
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
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
            EmailAddress: "$userData.EmailAddress",
          },
          location: {
            Address: "$locationData.Address",
            City: "$locationData.City",
            State: "$locationData.State",
            Country: "$locationData.Country",
            Zip: "$locationData.Zip",
          },
          Total: { $toInt: { $round: [{ $toDouble: "$Total" }, 0] } },
        },
      },
    ];

    if (search) {
      const searchParts = search.split(" ").filter(Boolean);
      const searchConditions = searchParts.map((part) => ({
        $or: [
          { "customer.FirstName": { $regex: new RegExp(part, "i") } },
          { "customer.LastName": { $regex: new RegExp(part, "i") } },
          { "customer.EmailAddress": { $regex: new RegExp(part, "i") } },
          { "location.Address": { $regex: new RegExp(part, "i") } },
          { "location.City": { $regex: new RegExp(part, "i") } },
          { "location.State": { $regex: new RegExp(part, "i") } },
          { "location.Country": { $regex: new RegExp(part, "i") } },
          { "location.Zip": { $regex: new RegExp(part, "i") } },
          { Title: { $regex: new RegExp(part, "i") } },
          { ContractNumber: { $regex: new RegExp(part, "i") } },
        ],
      }));

      basePipeline.push({ $match: { $and: searchConditions } });
    }

    const countPipeline = [...basePipeline, { $count: "totalCount" }];
    const mainPipeline = [
      ...basePipeline,
      {
        $project: {
          CompanyId: 1,
          CustomerId: 1,
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
      Contract.aggregate(mainPipeline).collation({ locale: "en", strength: 2 }),
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
        localField: "CustomerId",
        foreignField: "UserId",
        as: "customerData",
      },
    },
    { $unwind: "$customerData" },
    {
      $lookup: {
        from: "users",
        localField: "CustomerId",
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
        CustomerId: 1,
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
  const { CompanyId, CustomerId } = req.params;

  if (!CompanyId || !CustomerId) {
    return res
      .status(400)
      .json({ message: "CompanyId and CustomerId are required!" });
  }

  const contracts = await Contract.aggregate([
    {
      $match: { CompanyId, CustomerId, IsDelete: false },
    },
    {
      $lookup: {
        from: "user-profiles",
        localField: "CustomerId",
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
        CustomerId: 1,
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
  console.log(contractData, "contractData");
  console.log(contract, "contract");
  Object.assign(contract, contractData);
  contract.updatedAt = moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss");
  await contract.save();

  if (
    contractData.OneoffJob &&
    contractData.OneoffJob.StartDate !== "" &&
    contractData.OneoffJob.EndDate !== ""
  ) {
    const assignPersonIds = Array.isArray(contractData.WorkerId)
      ? contractData.WorkerId
      : [];

    await createOneoffVisits(
      contractData.OneoffJob,
      contractData.Title,
      contractData.Description,
      contract.CompanyId,
      contract.CustomerId,
      contract.ContractId,
      assignPersonIds,
      contract.LocationId
    );
  }

  await Visit.updateMany({ ContractId, IsRecurring: true }, { IsDelete: true });

  if (contractData.RecuringJob && contractData.RecuringJob.StartDate !== "") {
    const assignPersonIds = Array.isArray(contractData.WorkerId)
      ? contractData.WorkerId
      : [];

    await createRecuringVisits(
      contractData.RecuringJob,
      contractData.Title,
      contractData.Description,
      contract.CompanyId,
      contract.CustomerId,
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

  const notificationData = {
    CompanyId: contract.CompanyId,
    CustomerId: contract.CustomerId,
    ContractId: contract.ContractId,
    LocationId: contract.LocationId,
    // WorkerId: assignPersonIds,
    CreatedBy: req.user.UserId,
    AddedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
  };

  await addNotification(notificationData);

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
  await Notification.updateMany(
    { ContractId: ContractId, IsDelete: false },
    { $set: { IsDelete: true } }
  );

  return res.status(200).json({
    statusCode: 200,
    message: "Contract deleted successfully!",
  });
};

// **GET CONTRACT IN INVOICE AFTER SELECT CUSTOMER INVOICE**
exports.getInvoiceDataByCustomerId = async (req, res) => {
  const { CustomerId } = req.params;

  if (!CustomerId) {
    return {
      statusCode: 400,
      message: "CustomerId is required",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isoToday = today.toISOString();

  const result = await User.aggregate([
    {
      $match: {
        UserId: CustomerId,
        IsDelete: false,
      },
    },
    {
      $lookup: {
        from: "user-profiles",
        localField: "UserId",
        foreignField: "UserId",
        as: "profile",
      },
    },
    {
      $unwind: {
        path: "$profile",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "locations",
        localField: "UserId",
        foreignField: "CustomerId",
        as: "locations",
      },
    },
    {
      $unwind: {
        path: "$locations",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "contracts",
        localField: "locations.LocationId",
        foreignField: "LocationId",
        as: "contracts",
        pipeline: [
          {
            $match: { IsDelete: false },
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
                    StartDate: { $exists: true, $ne: null, $ne: "" },
                  },
                },
                { $sort: { StartDate: 1 } },
                {
                  $group: {
                    _id: "$ContractId",
                    todayVisit: {
                      // $first: {
                      //   $cond: [
                      //     { $gte: ["$StartDate", new Date(isoToday)] },
                      //     "$$ROOT",
                      //     null,
                      //   ],
                      // },
                      $first: "$$ROOT",
                    },
                    upcomingVisit: { $first: "$$ROOT" },
                  },
                },
                {
                  $project: {
                    todayVisit: 1,
                    upcomingVisit: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $group: {
        _id: "$UserId",
        customer: {
          $first: {
            UserId: "$UserId",
            FirstName: "$profile.FirstName",
            LastName: "$profile.LastName",
          },
        },
        data: {
          $push: {
            location: {
              LocationId: "$locations.LocationId",
              address: "$locations.Address",
              city: "$locations.City",
              state: "$locations.State",
              zip: "$locations.Zip",
              country: "$locations.Country",
            },
            contracts: "$contracts",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        customer: 1,
        data: 1,
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
    ...result[0],
    message: "Data fetched successfully",
  });
};

// **GET CONTRACT IN CUSTOMER LOCATION WISE**
exports.getContractCustomerProperty = async (req, res) => {
  try {
    const { CustomerId, LocationId } = req.params;
    const CompanyId = Array.isArray(req.user.CompanyId)
      ? req.user.CompanyId
      : [req.user.CompanyId];

    if (!CompanyId || !CustomerId || !LocationId) {
      return res.status(400).json({
        message: "CompanyId, CustomerId, and LocationId are required!",
      });
    }

    const contractSearchQuery = {
      CompanyId: String(CompanyId),
      CustomerId: String(CustomerId),
      LocationId: String(LocationId),
      IsDelete: false,
    };

    const contracts = await Contract.aggregate([
      { $match: contractSearchQuery },
      {
        $lookup: {
          from: "user-profiles",
          localField: "CustomerId",
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
        $addFields: {
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
        },
      },
      { $sort: { updatedAt: -1 } },
      {
        $project: {
          CompanyId: 1,
          CustomerId: 1,
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

    return res.status(200).json({
      data: contracts,
      totalCount: contracts.length,
      message:
        contracts.length > 0
          ? "Contracts retrieved successfully"
          : "No contract found",
    });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

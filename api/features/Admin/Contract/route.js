var express = require("express");
var router = express.Router();
const moment = require("moment");
const Contract = require("../Contract/model");
const Customer = require("../Customer/model");
const ContractItem = require("../Contract/ContractItem/model");
const Location = require("../Location/model");
const CompanyMail = require("../../Superadmin/CompanyMail/model");
const MailConfig = require("../../Superadmin/MailConfiguration/model");
const { contractPdf } = require("../../htmlFormates/ContractFunction");
const { generateAndSavePdf } = require("../../generatePdf");
var SuperAdmin = require("../../Superadmin/SignupLogin/model");
var Worker = require("../../Admin/Worker/model");
var Company = require("../../Admin/Company/model");
// const { addNotification } = require("../../Notification/notification");
const { verifyLoginToken } = require("../../../authentication");
const Contracts = require("../Contract/ContractItem/model");
const ContractTeam = require("../Worker/model");
const Expenses = require("./Expenses/model");
const Labour = require("./Labour/model");
const Visits = require("./Visits/model");
const Invoice = require("../Invoice/model");
const { addNotification } = require("../../Notification/notification");
const Notification = require("../../Notification/model");
const Activities = require("../ActivitiesModel");
const Dropbox = require("../Dropbox/model");

const {
  getFileDataUri,
  getSignatureRequestDetails,
  removeSignatureRequest,
} = require("../Dropbox/route");
const { handleTemplate } = require("../Template/route");
const { validateBody, ContractValidationSchema } = require("./validation");

//Contract post
// 5206 code start
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
  const { StartDate, EndDate, Repeats } = oneOffJob;

  const startDate = moment(StartDate);
  const endDate = moment(EndDate);
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

  if (Repeats === "Daily") {
    for (
      let date = startDate.clone();
      date.isBefore(endDate) || date.isSame(endDate, "day");
      date.add(1, "days")
    ) {
      const VisitId = Date.now();
      const uniqueId = `${VisitId}-${date.format("YYYYMMDD")}`;

      visits.push({
        ...visitData,
        VisitId: uniqueId,
        StartDate: date.format("YYYY-MM-DD"),
        StartTime: oneOffJob.StartTime,
        EndDate: date.format("YYYY-MM-DD"),
        EndTime: oneOffJob.EndTime,
      });
    }
  } else if (Repeats === "Weekly") {
    for (
      let date = startDate.clone();
      date.isBefore(endDate) || date.isSame(endDate, "day");
      date.add(1, "weeks")
    ) {
      const VisitId = Date.now();
      const uniqueId = `${VisitId}-${date.format("YYYYMMDD")}`;

      visits.push({
        ...visitData,
        VisitId: uniqueId,
        StartDate: date.format("YYYY-MM-DD"),
        StartTime: oneOffJob.StartTime,
        EndDate: date.format("YYYY-MM-DD"),
        EndTime: oneOffJob.EndTime,
      });
    }
  } else if (Repeats === "Monthly") {
    for (
      let date = startDate.clone();
      date.isBefore(endDate) || date.isSame(endDate, "day");
      date.add(1, "months")
    ) {
      const VisitId = Date.now();
      const uniqueId = `${VisitId}-${date.format("YYYYMMDD")}`;

      visits.push({
        ...visitData,
        VisitId: uniqueId,
        StartDate: date.format("YYYY-MM-DD"),
        StartTime: oneOffJob.StartTime,
        EndDate: date.format("YYYY-MM-DD"),
        EndTime: oneOffJob.EndTime,
      });
    }
  } else if (Repeats && !isNaN(Repeats)) {
    const customInterval = parseInt(Repeats, 10);
    for (
      let date = startDate.clone();
      date.isBefore(endDate) || date.isSame(endDate, "day");
      date.add(customInterval, "days")
    ) {
      const VisitId = Date.now();
      const uniqueId = `${VisitId}-${date.format("YYYYMMDD")}`;

      visits.push({
        ...visitData,
        VisitId: uniqueId,
        StartDate: date.format("YYYY-MM-DD"),
        StartTime: oneOffJob.StartTime.format("hh:mm A"),
        EndDate: date.format("YYYY-MM-DD"),
        EndTime: oneOffJob.EndTime,
      });
    }
  }

  const visitPromises = visits.map((visit) => Visits.create(visit));
  await Promise.all(visitPromises);
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
      const visitPromises = visits.map((visit) => Visits.create(visit));
      await Promise.all(visitPromises);
    }

    return visits.length;
  } catch (error) {
    console.error("Error creating visits:", error);
    throw new Error("Error creating visits: " + error.message);
  }
};
const createContract = async (contractData, req) => {
  if (contractData._id) {
    delete contractData._id;
  }
  // const existingContract = await Contract.findOne({
  //   ContractNumber: contractData.ContractNumber,
  // });

  // if (existingContract) {
  //   return {
  //     statusCode: 400,
  //     message: `Contract Number ${contractData.ContractNumber} already exists. Please use a different number.`,
  //   };
  // }
  try {
    const ContractId = Date.now();
    contractData["ContractId"] = ContractId;
    contractData["createdAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");
    contractData["updatedAt"] = moment()
      .utcOffset(330)
      .format("YYYY-MM-DD HH:mm:ss");

    const assignPersonIds = Array.isArray(contractData.WorkerId)
      ? contractData.WorkerId
      : contractData.WorkerId
      ? [contractData.WorkerId]
      : [];

    contractData.WorkerId = assignPersonIds;

    const createdContract = await Contract.create(contractData);
    if (createdContract.QuoteId) {
      const status = await Contract.updateOne(
        { ContractId: createdContract.ContractId },
        { $set: { Status: "Converted" } }
      );
      Contract.Status = "Converted";
    }
    if (
      Array.isArray(contractData.products) &&
      contractData.products.length > 0
    ) {
      const productPromises = contractData.products.map(
        async (product, index) => {
          const uniqueItemId = `${Date.now() + index}`;
          if (product._id) {
            delete product._id;
          }
          product.ContractId = ContractId;
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

    await addNotification({
      CompanyId: contractData.CompanyId,
      CustomerId: contractData.CustomerId,
      ContractId: ContractId,
      LocationId: contractData.LocationId,
      CreatedBy: contractData.role,
      AddedAt: contractData.AddedAt,
    });

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
    }

    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: contractData.CompanyId,
      Action: "CREATE",
      Entity: "Contract",
      EntityId: contractData.ContractId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Created a new contract #${contractData.ContractNumber} ${contractData.Title}`,
      },
      Reason: "Contract creation",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      message: "Contract created successfully",
      data: createdContract,
    };
  } catch (error) {
    console.error("Error creating contract:", error);
    throw new Error("Error creating contract");
  }
};

router.post(
  "/",
  verifyLoginToken,
  validateBody(ContractValidationSchema),
  async (req, res) => {
    try {
      const response = await createContract(req.body, req);
      res.status(200).json(response);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//-------------------------------------------------------------------------------------

const checkContractNumber = async (CompanyId, ContractNumber) => {
  const findNumber = await Contract.findOne({
    CompanyId: CompanyId,
    ContractNumber: ContractNumber,
    IsDelete: false,
  });

  if (findNumber) {
    return {
      statusCode: 203,
      message: "Number already exists",
    };
  } else {
    return {
      statusCode: 200,
      message: "Ok",
    };
  }
};
router.post("/check_number/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const { ContractNumber } = req.body;

    const result = await checkContractNumber(CompanyId, ContractNumber);
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

//Contract assign person post
const createContractTeam = async (contractTeamData) => {
  const uniqueId = Date.now();

  const data = {
    ...contractTeamData,
    WorkerId: uniqueId,
    createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
  };

  await ContractTeam.create(data);

  return {
    statusCode: 201,
    message: "Contract team assigned successfully",
  };
};

router.post("/assign_team", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId, FullName, Email, PhoneNumber, Password } = req.body;

    // Prepare the contract team data
    const contractTeamData = {
      CompanyId,
      FullName,
      Email,
      PhoneNumber,
      Password: Password || "",
      createdAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().utcOffset(330).format("YYYY-MM-DD HH:mm:ss"),
    };

    const company = await Company.findOne({
      EmailAddress: Email,
      IsDelete: false,
    });

    const superAdmin = await SuperAdmin.findOne({
      EmailAddress: Email,
      IsDelete: false,
    });

    const customer = await Customer.findOne({
      EmailAddress: Email,
      IsDelete: false,
    });

    const worker = await Worker.findOne({
      EmailAddress: Email,
      IsDelete: false,
    });

    if (company || superAdmin || customer || worker) {
      return res.status(302).json({
        statusCode: 302,
        message: "E-mail Already Exists!",
      });
    }

    const result = await createContractTeam(contractTeamData);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//--------------------------------POST PDF-----------------------------------------

router.post("/contractpdf/:ContractId", async (req, res) => {
  try {
    const { ContractId } = req.params;
    if (!ContractId) {
      return res
        .status(400)
        .json({ statusCode: 400, message: "ContractId is required" });
    }

    const response = await getContractDetails(ContractId);
    if (!response || !response.data) {
      return res
        .status(404)
        .json({ statusCode: 404, message: "Contract not found" });
    }

    const html = await contractPdf(response.data);
    const fileName = await generateAndSavePdf(html);

    return res.status(200).json({ statusCode: 200, fileName });
  } catch (error) {
    console.error("Error generating contract PDF:", error);

    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try again later.",
    });
  }
});

//-------------------------------------------------------------------------------------

// For Customer show Assigned Contract (Customer)
// const getCustomerContract = async (CustomerId) => {
//   if (!CustomerId) {
//     return {
//       statusCode: 400,
//       message: "CustomerId is required!",
//     };
//   }
//   const contract = await Contract.aggregate([
//     { $match: { CustomerId, IsDelete: false } },
//     {
//       $lookup: {
//         from: "invoices",
//         localField: "ContractId",
//         foreignField: "ContractId",
//         as: "invoiceDetails",
//       },
//     },
//     {
//       $addFields: {
//         hasInvoice: { $gt: [{ $size: "$invoiceDetails" }, 0] },
//       },
//     },
//     {
//       $match: { hasInvoice: false },
//     },
//     {
//       $lookup: {
//         from: "locations",
//         localField: "LocationId",
//         foreignField: "LocationId",
//         as: "locationDetails",
//       },
//     },
//     { $unwind: "$locationDetails" },
//     {
//       $addFields: {
//         createdAt: "$createdAt",
//         updatedAt: "$updatedAt",
//         ContractNumber: "$ContractNumber",
//         Total: "$Total",
//         Address: "$locationDetails.Address",
//         City: "$locationDetails.City",
//         State: "$locationDetails.State",
//         Zip: "$locationDetails.Zip",
//         Country: "$locationDetails.Country",
//       },
//     },
//     {
//       $facet: {
//         scheduledResponse: [
//           { $match: { Status: "Scheduled" } },
//           {
//             $project: {
//               CompanyId: 1,
//               CustomerId: 1,
//               ContractId: 1,
//               LocationId: 1,
//               Title: 1,
//               Description: 1,
//               ContractNumber: 1,
//               EventLog: 1,
//               Status: 1,
//               IsOneoffJob: 1,
//               IsRecuringJob: 1,
//               OneoffJob: 1,
//               RecuringJob: 1,
//               RemindInvoice: 1,
//               Notes: 1,
//               Team: 1,
//               Discount: 1,
//               Tax: 1,
//               subTotal: 1,
//               Attachment: 1,
//               Total: 1,
//               createdAt: 1,
//               updatedAt: 1,
//               address: {
//                 Address: "$Address",
//                 City: "$City",
//                 State: "$State",
//                 Zip: "$Zip",
//                 Country: "$Country",
//               },
//             },
//           },
//         ],
//         todayRequest: [
//           { $match: { Status: "Today" } },
//           {
//             $project: {
//               CompanyId: 1,
//               CustomerId: 1,
//               ContractId: 1,
//               LocationId: 1,
//               Title: 1,
//               Description: 1,
//               ContractNumber: 1,
//               EventLog: 1,
//               Status: 1,
//               IsOneoffJob: 1,
//               IsRecuringJob: 1,
//               OneoffJob: 1,
//               RecuringJob: 1,
//               RemindInvoice: 1,
//               Notes: 1,
//               Team: 1,
//               Discount: 1,
//               Tax: 1,
//               subTotal: 1,
//               Attachment: 1,
//               Total: 1,
//               createdAt: 1,
//               updatedAt: 1,
//               address: {
//                 Address: "$Address",
//                 City: "$City",
//                 State: "$State",
//                 Zip: "$Zip",
//                 Country: "$Country",
//               },
//             },
//           },
//         ],
//         upcoming: [
//           { $match: { Status: "Upcoming" } },
//           {
//             $project: {
//               CompanyId: 1,
//               CustomerId: 1,
//               ContractId: 1,
//               LocationId: 1,
//               Title: 1,
//               Description: 1,
//               ContractNumber: 1,
//               EventLog: 1,
//               Status: 1,
//               IsOneoffJob: 1,
//               IsRecuringJob: 1,
//               OneoffJob: 1,
//               RecuringJob: 1,
//               RemindInvoice: 1,
//               Notes: 1,
//               Team: 1,
//               Discount: 1,
//               Tax: 1,
//               subTotal: 1,
//               Attachment: 1,
//               Total: 1,
//               createdAt: 1,
//               updatedAt: 1,
//               address: {
//                 Address: "$Address",
//                 City: "$City",
//                 State: "$State",
//                 Zip: "$Zip",
//                 Country: "$Country",
//               },
//             },
//           },
//         ],
//       },
//     },
//   ]);

//   return {
//     statusCode: contract.length > 0 ? 200 : 204,
//     data: {
//       Scheduled: contract[0]?.scheduledResponse || [],
//       Today: contract[0]?.todayRequest || [],
//       Upcoming: contract[0]?.upcoming || [],
//     },
//     message:
//       contract.length > 0
//         ? "Contract retrieved successfully"
//         : "No contract found",
//   };
// };
const getCustomerContract = async (CustomerId) => {
  if (!CustomerId) {
    return {
      statusCode: 400,
      message: "CustomerId is required!",
    };
  }
  const contract = await Contract.aggregate([
    { $match: { CustomerId, IsDelete: false } }, // Match non-deleted contracts
    // {
    //   $lookup: {
    //     from: "invoices",
    //     let: { contractId: "$ContractId" },
    //     pipeline: [
    //       {
    //         $match: {
    //           $expr: {
    //             $and: [
    //               { $eq: ["$ContractId", "$$contractId"] },
    //               { $eq: ["$IsDelete", false] },
    //             ],
    //           },
    //         },
    //       }, // Fetch non-deleted invoices only
    //     ],
    //     as: "invoiceDetails",
    //   },
    // },
    // {
    //   $addFields: {
    //     hasInvoice: { $gt: [{ $size: "$invoiceDetails" }, 0] }, // Check if non-deleted invoices exist
    //   },
    // },
    // {
    //   $match: { hasInvoice: false }, // Exclude contracts with active invoices
    // },
    {
      $lookup: {
        from: "locations",
        localField: "LocationId",
        foreignField: "LocationId",
        as: "locationDetails",
      },
    },
    { $unwind: "$locationDetails" },
    {
      $addFields: {
        createdAt: "$createdAt",
        updatedAt: "$updatedAt",
        ContractNumber: "$ContractNumber",
        Total: "$Total",
        Address: "$locationDetails.Address",
        City: "$locationDetails.City",
        State: "$locationDetails.State",
        Zip: "$locationDetails.Zip",
        Country: "$locationDetails.Country",
      },
    },
    {
      $facet: {
        scheduledResponse: [
          { $match: { Status: "Scheduled" } },
          {
            $project: {
              CompanyId: 1,
              CustomerId: 1,
              ContractId: 1,
              LocationId: 1,
              Title: 1,
              Description: 1,
              ContractNumber: 1,
              EventLog: 1,
              Status: 1,
              IsOneoffJob: 1,
              IsRecuringJob: 1,
              OneoffJob: 1,
              RecuringJob: 1,
              RemindInvoice: 1,
              Notes: 1,
              Team: 1,
              Discount: 1,
              Tax: 1,
              subTotal: 1,
              Attachment: 1,
              Total: 1,
              createdAt: 1,
              updatedAt: 1,
              address: {
                Address: "$Address",
                City: "$City",
                State: "$State",
                Zip: "$Zip",
                Country: "$Country",
              },
            },
          },
        ],
        todayRequest: [
          { $match: { Status: "Today" } },
          {
            $project: {
              CompanyId: 1,
              CustomerId: 1,
              ContractId: 1,
              LocationId: 1,
              Title: 1,
              Description: 1,
              ContractNumber: 1,
              EventLog: 1,
              Status: 1,
              IsOneoffJob: 1,
              IsRecuringJob: 1,
              OneoffJob: 1,
              RecuringJob: 1,
              RemindInvoice: 1,
              Notes: 1,
              Team: 1,
              Discount: 1,
              Tax: 1,
              subTotal: 1,
              Attachment: 1,
              Total: 1,
              createdAt: 1,
              updatedAt: 1,
              address: {
                Address: "$Address",
                City: "$City",
                State: "$State",
                Zip: "$Zip",
                Country: "$Country",
              },
            },
          },
        ],
        upcoming: [
          { $match: { Status: "Upcoming" } },
          {
            $project: {
              CompanyId: 1,
              CustomerId: 1,
              ContractId: 1,
              LocationId: 1,
              Title: 1,
              Description: 1,
              ContractNumber: 1,
              EventLog: 1,
              Status: 1,
              IsOneoffJob: 1,
              IsRecuringJob: 1,
              OneoffJob: 1,
              RecuringJob: 1,
              RemindInvoice: 1,
              Notes: 1,
              Team: 1,
              Discount: 1,
              Tax: 1,
              subTotal: 1,
              Attachment: 1,
              Total: 1,
              createdAt: 1,
              updatedAt: 1,
              address: {
                Address: "$Address",
                City: "$City",
                State: "$State",
                Zip: "$Zip",
                Country: "$Country",
              },
            },
          },
        ],
      },
    },
  ]);

  return {
    statusCode: contract.length > 0 ? 200 : 204,
    data: {
      Scheduled: contract[0]?.scheduledResponse || [],
      Today: contract[0]?.todayRequest || [],
      Upcoming: contract[0]?.upcoming || [],
    },
    message:
      contract.length > 0
        ? "Contract retrieved successfully"
        : "No contract found",
  };
};

router.get(
  "/contracts/:CustomerId",
  verifyLoginToken,
  async function (req, res) {
    try {
      const { CustomerId } = req.params;

      const result = await getCustomerContract(CustomerId);

      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//-----------------------------------SCHEDULE DATA----------------------------------------------

const getContractScheduleData = async (CompanyId) => {
  try {
    const contracts = await Contract.aggregate([
      {
        $match: {
          CompanyId: CompanyId,
          IsDelete: false,
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "CustomerId",
          foreignField: "CustomerId",
          as: "CustomerData",
        },
      },
      {
        $lookup: {
          from: "locations",
          localField: "LocationId",
          foreignField: "LocationId",
          as: "LocationData",
        },
      },
      {
        $unwind: {
          path: "$CustomerData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$LocationData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          Title: 1,
          ContractNumber: 1,
          ContractId: 1,
          StartDate: 1,
          CompletionDate: 1,
          Status: 1,
          createdAt: 1,
          FirstName: "$CustomerData.FirstName",
          LastName: "$CustomerData.LastName",
          Address: "$LocationData.Address",
          City: "$LocationData.City",
          State: "$LocationData.State",
          Zip: "$LocationData.Zip",
          Country: "$LocationData.Country",
          sheduleDate: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
          },
        },
      },
    ]);
    return {
      statusCode: 200,
      data: contracts,
      message: "Read All Contracts and Visits",
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: "Something went wrong, please try later!",
    };
  }
};

router.get("/contract-schedule/:CompanyId", async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const result = await getContractScheduleData(CompanyId);
    res.status(result.statusCode).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

//--------------------------GET CONTRACT--------------------------------------

// const getContracts = async (CompanyId, query) => {
//   const pageSize = parseInt(query.pageSize) || 10;
//   const pageNumber = parseInt(query.pageNumber) || 0;
//   const search = query.search;
//   const sortField = query.sortField || "updatedAt";
//   const sortOrder = query.sortOrder === "desc" ? -1 : 1;

//   let contractSearchQuery = { CompanyId, IsDelete: false };

//   const sortOptions = {
//     [sortField]: sortOrder,
//   };

//   const basePipeline = [
//     { $match: contractSearchQuery },
//     {
//       $lookup: {
//         from: "customers",
//         localField: "CustomerId",
//         foreignField: "CustomerId",
//         as: "customerData",
//       },
//     },
//     { $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true } },
//     {
//       $lookup: {
//         from: "locations",
//         localField: "LocationId",
//         foreignField: "LocationId",
//         as: "locationData",
//       },
//     },
//     { $unwind: { path: "$locationData", preserveNullAndEmptyArrays: true } },
//     {
//       $addFields: {
//         customer: {
//           FirstName: "$customerData.FirstName",
//           LastName: "$customerData.LastName",
//         },
//         location: {
//           Address: "$locationData.Address",
//           City: "$locationData.City",
//           State: "$locationData.State",
//           Country: "$locationData.Country",
//           Zip: "$locationData.Zip",
//         },
//       },
//     },
//   ];

//   // Search functionality
//   if (search) {
//     const searchParts = search.split(" ").filter(Boolean);
//     const searchConditions = searchParts.map((part) => {
//       const searchRegex = new RegExp(part, "i");
//       return {
//         $or: [
//           { "customer.FirstName": { $regex: searchRegex } },
//           { "customer.LastName": { $regex: searchRegex } },
//           { "location.Address": { $regex: searchRegex } },
//           { "location.City": { $regex: searchRegex } },
//           { "location.State": { $regex: searchRegex } },
//           { "location.Country": { $regex: searchRegex } },
//           { "location.Zip": { $regex: searchRegex } },
//           { Title: { $regex: searchRegex } },
//           { ContractNumber: { $regex: searchRegex } },
//         ],
//       };
//     });

//     basePipeline.push({
//       $match: {
//         $and: [contractSearchQuery, { $and: searchConditions }],
//       },
//     });
//   }

//   const countPipeline = [...basePipeline, { $count: "totalCount" }];

//   const mainPipeline = [
//     ...basePipeline,
//     { $sort: sortOptions },
//     { $skip: pageNumber * pageSize },
//     { $limit: pageSize },
//     {
//       $project: {
//         CompanyId: 1,
//         CustomerId: 1,
//         ContractId: 1,
//         LocationId: 1,
//         WorkerId: 1,
//         Title: 1,
//         Status: 1,
//         OneoffJob: 1,
//         RecuringJob: 1,
//         ContractNumber: 1,
//         IsOneoffJob: 1,
//         IsRecuringJob: 1,
//         QuoteId: 1,
//         customer: 1,
//         location: 1,
//         Total: 1,
//         createdAt: 1,
//         updatedAt: 1,
//       },
//     },
//   ];

//   const [countResult, contractData] = await Promise.all([
//     Contract.aggregate(countPipeline),
//     Contract.aggregate(mainPipeline),
//   ]);

//   const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

//   return {
//     statusCode: contractData.length > 0 ? 200 : 204,
//     data: contractData,
//     totalCount,
//     totalPages: Math.ceil(totalCount / pageSize),
//     currentPage: pageNumber,
//     message:
//       contractData.length > 0
//         ? "Contracts retrieved successfully"
//         : "No contracts found",
//   };
// };

const getContracts = async (CompanyId, query) => {
  const pageSize = parseInt(query.pageSize) || 10;
  const pageNumber = parseInt(query.pageNumber) || 0;
  const search = query.search;
  // const sortField = query.sortField || "updatedAt";
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

  const sortOptions = {
    [sortField]: sortOrder,
  };

  const basePipeline = [
    { $match: contractSearchQuery },
    {
      $lookup: {
        from: "customers",
        localField: "CustomerId",
        foreignField: "CustomerId",
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

  const countPipeline = [...basePipeline, { $count: "totalCount" }];
  const collation = { locale: "en", strength: 2 };

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
    Contract.aggregate(mainPipeline).collation(collation),
  ]);

  const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

  return {
    statusCode: contractData.length > 0 ? 200 : 204,
    data: contractData,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: pageNumber,
    message:
      contractData.length > 0
        ? "Contracts retrieved successfully"
        : "No contracts found",
  };
};

//5206 code end
router.get("/:CompanyId", verifyLoginToken, async (req, res) => {
  const { CompanyId } = req.params;
  const query = req.query;
  query.sortField = query.sortField || "updatedAt";
  query.sortOrder = query.sortOrder || "desc";
  try {
    const result = await getContracts(CompanyId, query);
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

// Get contract details for admin
// const getContractDetails = async (ContractId) => {
//   if (!ContractId) {
//     return {
//       statusCode: 400,
//       message: "ContractId is required!",
//     };
//   }

//   const contracts = await Contract.aggregate([
//     {
//       $match: { ContractId, IsDelete: false },
//     },
//     // Lookup for customer data
//     {
//       $lookup: {
//         from: "customers",
//         localField: "CustomerId",
//         foreignField: "CustomerId",
//         as: "customerData",
//       },
//     },
//     { $unwind: "$customerData" },
//     {
//       $set: {
//         customer: {
//           FirstName: "$customerData.FirstName",
//           LastName: "$customerData.LastName",
//           PhoneNumber: "$customerData.PhoneNumber",
//           EmailAddress: "$customerData.EmailAddress",
//         },
//       },
//     },
//     // Lookup for location data
//     {
//       $lookup: {
//         from: "locations",
//         localField: "LocationId",
//         foreignField: "LocationId",
//         as: "locationData",
//       },
//     },
//     { $unwind: "$locationData" },
//     {
//       $set: {
//         location: {
//           Address: "$locationData.Address",
//           City: "$locationData.City",
//           State: "$locationData.State",
//           Country: "$locationData.Country",
//           Zip: "$locationData.Zip",
//         },
//       },
//     },
//     // Lookup for contract items
//     {
//       $lookup: {
//         from: "contractitems",
//         let: { contractId: "$ContractId" },
//         pipeline: [
//           {
//             $match: {
//               $expr: {
//                 $and: [
//                   { $eq: ["$ContractId", "$$contractId"] },
//                   { $eq: ["$IsDelete", false] },
//                 ],
//               },
//             },
//           },
//           {
//             $project: {
//               ContractItemId: 1,
//               CompanyId: 1,
//               Type: 1,
//               Name: 1,
//               Description: 1,
//               Unit: 1,
//               CostPerUnit: 1,
//               Hour: 1,
//               CostPerHour: 1,
//               Square: 1,
//               CostPerSquare: 1,
//               Total: 1,
//               Attachment: 1,
//               createdAt: 1,
//               updatedAt: 1,
//             },
//           },
//         ],
//         as: "Items",
//       },
//     },
//     {
//       $project: {
//         CompanyId: 1,
//         CustomerId: 1,
//         ContractId: 1,
//         LocationId: 1,
//         WorkerId: 1,
//         Title: 1,
//         Description: 1,
//         StartDate: 1,
//         ContractNumber: 1,
//         CompletionDate: 1,
//         Status: 1,
//         EventLog: 1,
//         IsOneoffJob: 1,
//         IsRecuringJob: 1,
//         OneoffJob: 1,
//         RecuringJob: 1,
//         Team: 1,
//         RemindInvoice: 1,
//         IsDelete: 1,
//         Notes: 1,
//         Attachment: 1,
//         Discount: 1,
//         Tax: 1,
//         subTotal: 1,
//         Total: 1,
//         createdAt: 1,
//         updatedAt: 1,
//         Items: 1,
//         customer: 1,
//         location: 1,
//       },
//     },
//   ]);

//   return {
//     statusCode: contracts.length > 0 ? 200 : 204,
//     data: contracts[0] || {},
//     message:
//       contracts.length > 0
//         ? "Contract retrieved successfully"
//         : "Contract not found!",
//   };
// };

const getDropboxFileData = async (signatureRequestId) => {
  const dataUri = await getFileDataUri(signatureRequestId);
  const statusCode = await getSignatureRequestDetails(signatureRequestId);
  return { dataUri: dataUri?.fileDataUri?.dataUri, statusCode };
};
const getContractDetails = async (ContractId) => {
  if (!ContractId) {
    return {
      statusCode: 400,
      message: "ContractId is required!",
    };
  }

  const contracts = await Contract.aggregate([
    {
      $match: { ContractId, IsDelete: false },
    },
    // Lookup for customer data
    {
      $lookup: {
        from: "customers",
        localField: "CustomerId",
        foreignField: "CustomerId",
        as: "customerData",
      },
    },
    { $unwind: "$customerData" },
    {
      $set: {
        customer: {
          FirstName: "$customerData.FirstName",
          LastName: "$customerData.LastName",
          PhoneNumber: "$customerData.PhoneNumber",
          EmailAddress: "$customerData.EmailAddress",
          CustomerId: "$customerData.CustomerId",
        },
      },
    },
    // Lookup for location data
    {
      $lookup: {
        from: "locations",
        localField: "LocationId",
        foreignField: "LocationId",
        as: "locationData",
      },
    },
    { $unwind: "$locationData" },
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
        from: "companies",
        localField: "CompanyId",
        foreignField: "companyId",
        as: "companyData",
      },
    },
    { $unwind: "$companyData" },
    // Lookup for contract items
    {
      $lookup: {
        from: "contractitems",
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
      $lookup: {
        from: "dropboxes",
        localField: "ContractId",
        foreignField: "ContractId",
        as: "dropboxFiles",
      },
    },
    {
      $project: {
        CompanyId: 1,
        CustomerId: 1,
        ContractId: 1,
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
        IsDelete: 1,
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
        dropboxFiles: 1,
        companyData: 1,
      },
    },
  ]);

  if (contracts.length === 0) {
    return {
      statusCode: 204,
      message: "Contract not found!",
      data: {},
    };
  }

  const dropboxFiles = contracts[0]?.dropboxFiles
    ? await Promise.all(
        contracts[0].dropboxFiles
          .filter((dropboxFile) => !dropboxFile.IsDeleted)
          .map(async (dropboxFile) => {
            const { dataUri, statusCode } = await getDropboxFileData(
              dropboxFile.signatureRequestId
            );
            return { ...dropboxFile, dataUri, statusCode };
          })
      )
    : [];
  contracts[0].dropboxFiles = dropboxFiles;

  return {
    statusCode: contracts.length > 0 ? 200 : 204,
    data: contracts[0] || {},
    message:
      contracts.length > 0
        ? "Contract retrieved successfully"
        : "Contract not found!",
  };
};
router.get(
  "/contract_details/:ContractId",
  verifyLoginToken,
  async (req, res) => {
    const { ContractId } = req.params;
    try {
      const result = await getContractDetails(ContractId);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//-------------------------------------------------------------------------------------

// Find last Contract-Number in Company
const getMaxContractNumber = async (CompanyId) => {
  if (!CompanyId) {
    return {
      statusCode: 400,
      message: "CompanyId is required!",
    };
  }

  const result = await Contract.aggregate([
    {
      $match: {
        CompanyId: CompanyId,
        IsDelete: false,
      },
    },
    {
      $group: {
        _id: null,
        maxContractNumber: { $max: { $toInt: "$ContractNumber" } },
      },
    },
  ]);

  const maxContractNumber = result.length ? result[0].maxContractNumber : 0;

  return {
    statusCode: 200,
    contractNumber: maxContractNumber || 0,
  };
};

router.get("/get_number/:CompanyId", verifyLoginToken, async (req, res) => {
  const { CompanyId } = req.params;

  try {
    const result = await getMaxContractNumber(CompanyId);

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

//get contract for for customer detail page property vise
const getContractCustomerProperty = async (
  CompanyId,
  CustomerId,
  LocationId
) => {
  if (!CompanyId || !CustomerId || !LocationId) {
    return {
      statusCode: 400,
      message: "CompanyId, CustomerId, and LocationId are required!",
    };
  }

  const contractSearchQuery = {
    CompanyId,
    CustomerId,
    LocationId,
    IsDelete: false,
  };

  const contracts = await Contract.aggregate([
    {
      $lookup: {
        from: "customers",
        localField: "CustomerId",
        foreignField: "CustomerId",
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
    { $unwind: "$locationData" },
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
    { $match: contractSearchQuery },
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

  return {
    statusCode: contracts.length > 0 ? 200 : 204,
    data: contracts.length > 0 ? contracts : undefined,
    message:
      contracts.length > 0
        ? "Contracts retrieved successfully"
        : "No contract found",
  };
};
router.get(
  "/get_contract_customer_property/:CompanyId/:CustomerId/:LocationId",
  verifyLoginToken,
  async (req, res) => {
    const { CompanyId, CustomerId, LocationId } = req.params;

    try {
      const result = await getContractCustomerProperty(
        CompanyId,
        CustomerId,
        LocationId
      );

      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//-------------------------------------------------------------------------------------

// For Customer show Assigned Contract (Customer)
const getContractByCustomer = async (CompanyId, CustomerId) => {
  if (!CompanyId || !CustomerId) {
    return {
      statusCode: 400,
      message: "CompanyId and CustomerId are required!",
    };
  }

  const contractSearchQuery = {
    CompanyId,
    CustomerId,
    IsDelete: false,
  };

  const contracts = await Contract.aggregate([
    {
      $lookup: {
        from: "customers",
        localField: "CustomerId",
        foreignField: "CustomerId",
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
    { $unwind: "$locationData" },
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
    { $match: contractSearchQuery },
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

  return {
    statusCode: contracts.length > 0 ? 200 : 204,
    data: contracts.length > 0 ? contracts : undefined,
    message:
      contracts.length > 0
        ? "Contracts retrieved successfully"
        : "No contract found",
  };
};
router.get(
  "/get_contract_customer/:CompanyId/:CustomerId",
  verifyLoginToken,
  async (req, res) => {
    const { CompanyId, CustomerId } = req.params;

    try {
      const result = await getContractByCustomer(CompanyId, CustomerId);

      return res.status(result.statusCode).json(result);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//-----------------------------PUT CONTRACT DATA-------------------------------------

const updateContract = async (ContractId, contractData, products, req) => {
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
    const assignPersonIds = Array.isArray(contract.WorkerId)
      ? contract.WorkerId
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

  await Visits.updateMany(
    { ContractId, IsRecurring: true },
    { IsDelete: true }
  );

  if (contractData.RecuringJob && contractData.RecuringJob.StartDate !== "") {
    const assignPersonIds = Array.isArray(contract.WorkerId)
      ? contract.WorkerId
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

  await Activities.create({
    ActivityId: `${Date.now()}`,
    CompanyId: req.CompanyId,
    Action: "UPDATE",
    Entity: "Contract",
    EntityId: ContractId,
    ActivityBy: req.Role,
    ActivityByUsername: req.userName,
    Activity: {
      description: `Updated a contract #${contractData.ContractNumber} ${contractData.Title}`,
    },
    Reason: "Contract updating",
    createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
  });

  return {
    statusCode: 200,
    message: "Contract updated successfully.",
    data: contract,
    products,
  };
};

router.put("/:ContractId", verifyLoginToken, async (req, res) => {
  const { ContractId } = req.params;
  const { products, ...contractData } = req.body;

  try {
    const result = await updateContract(
      ContractId,
      contractData,
      products,
      req
    );
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

const deleteContract = async (ContractId, DeleteReason, req) => {
  // Check if any related labour, expenses, visits, or invoices exist
  const [findLabour, findExpenses, findVisits, findInvoices] =
    await Promise.all([
      Labour.findOne({ ContractId, IsDelete: false }),
      Expenses.findOne({ ContractId, IsDelete: false }),
      Visits.findOne({ ContractId, IsDelete: false }),
      Invoice.findOne({ ContractId, IsDelete: false }),
    ]);

  if (findLabour || findExpenses || findVisits || findInvoices) {
    return {
      statusCode: 202,
      message:
        "You can't delete the contract; it's already assigned to other records (labour, expenses, visits, or invoices).",
    };
  }
  //5206 code end : validation if contract assign in invoice

  const dropboxEntry = await Dropbox.findOne({ ContractId });
  if (dropboxEntry && dropboxEntry.signatureRequestId) {
    await removeSignatureRequest(dropboxEntry.signatureRequestId);
  }

  const [deletedContract, updatedItems] = await Promise.all([
    Contract.findOneAndUpdate(
      { ContractId },
      { $set: { IsDelete: true } },
      { new: true }
    ),
    ContractItem.updateMany(
      { ContractId },
      { $set: { IsDelete: true } },
      { new: true }
    ),
  ]);
  //5206 "code start: delete notification"
  const updatedNotifications = await Notification.updateMany(
    { ContractId },
    { $set: { IsDelete: true } }
  );

  if (
    deletedContract ||
    updatedItems.nModified > 0 ||
    updatedNotifications.nModified > 0
    //5206 "code end"
  ) {
    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: req.CompanyId,
      Action: "DELETE",
      Entity: "Contract",
      EntityId: deletedContract.ContractId,
      ActivityBy: req.Role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Deleted a Contract #${deletedContract.ContractNumber} ${deletedContract.Title}`,
      },
      Reason: DeleteReason,
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });

    return {
      statusCode: 200,
      message: "Contract deleted successfully!",
    };
  } else {
    return {
      statusCode: 404,
      message: "Contract not found or deletion failed.",
    };
  }
};
// const deleteContract = async (ContractId, DeleteReason, req) => {
//   const [findLabour, findExpenses, findVisits, findInvoices] =
//     await Promise.all([
//       Labour.findOne({ ContractId, IsDelete: false }),
//       Expenses.findOne({ ContractId, IsDelete: false }),
//       Visits.findOne({ ContractId, IsDelete: false }),
//       Invoice.findOne({ ContractId, IsDelete: false }),
//     ]);

//   if (findLabour || findExpenses || findVisits || findInvoices) {
//     return {
//       statusCode: 202,
//       message:
//         "You can't delete the contract; it's already assigned to other records (labour, expenses, visits, or invoices).",
//     };
//   }

//   const dropboxEntry = await Dropbox.findOne({ ContractId });
//   let IsDeleted = false;

//   if (dropboxEntry && dropboxEntry.signatureRequestId) {
//     const signatureRequestResponse = await removeSignatureRequest(
//       dropboxEntry.signatureRequestId
//     );
//     if (signatureRequestResponse.statusCode === 200) {
//       IsDeleted = true;
//     }
//   }

//   const [deletedContract, updatedItems] = await Promise.all([
//     Contract.findOneAndUpdate(
//       { ContractId },
//       { $set: { IsDelete: true } },
//       { new: true }
//     ),
//     ContractItem.updateMany(
//       { ContractId },
//       { $set: { IsDelete: true } },
//       { new: true }
//     ),
//   ]);

//   const updatedNotifications = await Notification.updateMany(
//     { ContractId },
//     { $set: { IsDelete: true } }
//   );

//   if (
//     deletedContract ||
//     updatedItems.nModified > 0 ||
//     updatedNotifications.nModified > 0
//   ) {
//     await Activities.create({
//       ActivityId: `${Date.now()}`,
//       CompanyId: req.CompanyId,
//       Action: "DELETE",
//       Entity: "Contract",
//       EntityId: deletedContract.ContractId,
//       ActivityBy: req.Role,
//       ActivityByUsername: req.userName,
//       Activity: {
//         description: `Deleted a Contract #${deletedContract.ContractNumber} ${deletedContract.Title}`,
//       },
//       Reason: DeleteReason,
//       createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//       updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//     });

//     if (IsDeleted) {
//       const signatureRequest = await Dropbox.findOne({
//         signatureRequestId: dropboxEntry.signatureRequestId,
//       });

//       const data = {
//         CompanyId: signatureRequest.CompanyId,
//         ContractId: signatureRequest.ContractId,
//       };

//       const signerName =
//         signatureRequest.signers.length > 0
//           ? signatureRequest.signers[0].name
//           : "Unknown Signer";

//       const activityData = {
//         ActivityId: `${Date.now()}`,
//         CompanyId: data.CompanyId,
//         Action: "DELETE",
//         Entity: "",
//         EntityId: "",
//         ActivityBy: req.Role,
//         ActivityByUsername: req.userName,
//         Activity: {
//           description: "",
//         },
//         Reason: "",
//         createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//         updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//       };

//       if (data.ContractId) {
//         activityData.Entity = "Dropbox Signature for Contract";
//         activityData.EntityId = data.ContractId;
//         activityData.Activity.description = `Contract Signature Request canceled for "${signerName}"`;
//         activityData.Reason = DeleteReason;
//       } else {
//         throw new Error("Delete activity cannot be logged.");
//       }

//       await Activities.create(activityData);
//     }

//     return {
//       statusCode: 200,
//       message: "Contract deleted successfully!",
//     };
//   } else {
//     return {
//       statusCode: 404,
//       message: "Contract not found or deletion failed.",
//     };
//   }
// };

router.delete("/:ContractId", verifyLoginToken, async (req, res) => {
  const { ContractId } = req.params;
  const { DeleteReason } = req.body;
  try {
    const result = await deleteContract(ContractId, DeleteReason, req);
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

const getInvoiceDataByCustomerId = async (CustomerId) => {
  if (!CustomerId) {
    return {
      statusCode: 400,
      message: "CustomerId is required",
    };
  }

  const result = await Customer.aggregate([
    {
      $match: {
        CustomerId: CustomerId,
        IsDelete: false,
      },
    },
    {
      $lookup: {
        from: "contracts",
        localField: "CustomerId",
        foreignField: "CustomerId",
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
        ],
      },
    },
    {
      $project: {
        _id: 0,
        customer: {
          id: "$CustomerId",
          name: "$FirstName",
        },
        data: {
          $map: {
            input: "$contracts",
            as: "contract",
            in: {
              contract: "$$contract",
              location: {
                id: "$$contract.locationDetails.LocationId",
                address: "$$contract.locationDetails.Address",
                city: "$$contract.locationDetails.City",
                state: "$$contract.locationDetails.State",
                zip: "$$contract.locationDetails.Zip",
                country: "$$contract.locationDetails.Country",
              },
            },
          },
        },
      },
    },
  ]);

  if (!result || !result.length) {
    return {
      statusCode: 404,
      message: "Customer not found",
    };
  }

  return {
    statusCode: 200,
    ...result[0],
    message: "Data fetched successfully",
  };
};

router.get(
  "/get_invoice_data/:CustomerId",
  verifyLoginToken,
  async (req, res) => {
    try {
      const { CustomerId } = req.params;

      const result = await getInvoiceDataByCustomerId(CustomerId);

      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        statusCode: 500,
        message: "Something went wrong, please try later!",
      });
    }
  }
);

//-------------------------------------------------------------------------------------

const sendEmail = async (data, companyId, IsSendpdf) => {
  try {
    const { CustomerId, ContractId } = data;

    const findCustomer = await Customer.findOne({ CustomerId });
    if (!findCustomer) {
      return { statusCode: 404, message: "Customer not found" };
    }

    const findCompany = await Company.findOne({ companyId });
    if (!findCompany) {
      return { statusCode: 404, message: "Company not found" };
    }
    let fileName = null;

    if (IsSendpdf) {
      try {
        const response = await getContractDetails(ContractId);
        if (!response || !response.data) {
          return { statusCode: 404, message: "Contract not found" };
        }

        const html = await contractPdf(response.data);
        fileName = await generateAndSavePdf(html);
      } catch (error) {
        console.error("Error generating PDF:", error);
        return { statusCode: 500, message: "Failed to generate PDF" };
      }
    }

    const defaultSubject = "Your Custom Contract from Cloud Job Manager";
    const defaultBody = `
         
         <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1); border: 1px solid #e88c44;">
        <!-- Header Section (Logo at the Top) -->
        <tr>
          <td style="padding: 30px 0; text-align: center; background-color: #063164; border-top-left-radius: 12px; border-top-right-radius: 12px;">
            <div style="display: inline-block; padding: 15px; background-color: white; border-radius: 8px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);">
              <img src="https://app.cloudjobmanager.com/cdn/upload/20250213103016_site-logo2.png" alt="CloudJobManager Logo" style="width: 180px; max-width: 100%; display: block; margin: auto;" />
            </div>
          </td>
        </tr>
        
        <!-- Content Section -->
        <tr>
          <td style="padding: 40px;font-family: 'Arial', sans-serif; color: #555;text-align:center;">
            <h2 style="font-size: 24px; color: #003366; text-align: center;  font-weight: 700;">Your Custom Contract is Ready!</h2>
            <p style="font-size: 18px; color: #555; line-height: 1.7; text-align: center; font-weight: 400;">Dear <strong style="color: #003366;">${
              findCustomer.FirstName
            } ${findCustomer.LastName}</strong>,</p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">Thank you for the opportunity to provide a Contract for <strong style="color: #003366;">${
              data.Title
            }</strong> with a total amount of <strong>$${
      data.Total
    }</strong>.</p>
            <p style="font-size: 16px; color: #555; line-height: 1.6;">We are excited to present this custom Contract tailored just for you.</p>
      
            <!-- Quote Details Section -->
            <div style=" padding: 15px; text-align: center;  ">
              <h3 style="font-size: 21px; color: #e88c44; font-weight: 700;">Total Amount: <strong style="font-size: 21px; color: #003366;">$${
                data.Total
              }</strong></h3>
              <p style="font-size: 16px; color: #718096; font-weight: 400;">Contract Date: <strong>${moment(
                data.createdAt
              ).format("DD-MM-YYYY")}</strong></p>
            </div>

      
            <p style="font-size: 16px; color: #555; line-height: 1.7; text-align: center;">If you have any questions or would like to proceed with this Contract, please reach out to us at <a href="mailto:${
              findCompany.EmailAddress
            }" style="color: #003366; text-decoration: none; font-weight: 600;">${
      findCompany.EmailAddress
    }</a>.</p>
            <p style="font-size: 16px; color: #555; line-height: 1.7; text-align: center;">We look forward to working with you!</p>
      
            <div style="text-align: end; margin-top: 40px;">
              <p style="font-size: 16px; color: #555;">Best regards,<br />
                <strong style="color: #003366; font-weight: 700;">${
                  findCompany.companyName
                }</strong><br />
                <span style="font-size: 14px; color: #718096;">${
                  findCompany.EmailAddress
                }</span>
              </p>
            </div>
          </td>
        </tr>
      
        <!-- Footer Section -->
        <tr>
          <td style="padding: 20px; text-align: center; font-size: 12px; color: #888888; background-color: #f4f4f7; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; font-family: 'Arial', sans-serif;">
            CloudJobManager, Inc. | All rights reserved.<br>
            <a href="#" style="color: #e88c44; text-decoration: none; font-weight: 600;">Unsubscribe</a> if you no longer wish to receive these emails.
          </td>
        </tr>
      </table>`;

    const ContractData = [
      {
        FirstName: findCustomer.FirstName || "",
        LastName: findCustomer.LastName || "",
        EmailAddress: findCustomer.EmailAddress || "",
        PhoneNumber: findCustomer.PhoneNumber || "",
        companyName: findCompany.companyName || "",
        EmailAddress: findCompany.EmailAddress || "",
        companyPhoneNumber: findCompany.phoneNumber || "",
        Title: data.Title || "",
        ContractNumber: data.ContractNumber || "",
        SubTotal: data.SubTotal || "",
        Discount: data.Discount || "",
        Tax: data.Tax || "",
        Total: data.Total || "",
      },
    ];

    const emailStatus = await handleTemplate(
      "Contract",
      findCompany.companyId,
      ContractData,
      [fileName],
      defaultSubject,
      defaultBody,
      findCustomer.CustomerId
    );

    if (emailStatus) {
      return {
        statusCode: 200,
        message: `Email was sent to ${findCustomer.EmailAddress}`,
      };
    } else {
      return {
        statusCode: 203,
        message: "Issue sending email",
      };
    }
  } catch (error) {
    console.error("Error sending email:", error.message);
    return {
      statusCode: 500,
      message: "Something went wrong, please try again later",
    };
  }
};

router.post("/send_mail/:companyId", verifyLoginToken, async (req, res) => {
  const { companyId } = req.params;
  const { IsSendpdf, ...data } = req.body;
  // const data = req.body;

  try {
    const result = await sendEmail(data, companyId, IsSendpdf);
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

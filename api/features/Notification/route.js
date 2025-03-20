var express = require("express");
var router = express.Router();
const Notification = require("../Notification/model");
const { verifyLoginToken } = require("../../authentication");

// const getNotifications = async (companyId) => {
//   if (!companyId) {
//     return {
//       statusCode: 404,
//       message: "Company id is required!",
//     };
//   }

//   const notifications = await Notification.aggregate([
//     { $match: { CompanyId: companyId, IsDelete: false } },
//     {
//       $lookup: {
//         from: "locations",
//         localField: "LocationId",
//         foreignField: "LocationId",
//         as: "Location",
//       },
//     },
//     {
//       $lookup: {
//         from: "quotes",
//        localField: "QuoteId",
//         foreignField: "QuoteId",
//         as: "Quote",
//       },
//     },
//     {
//       $lookup: {
//         from: "contracts",
//         localField: "ContractId",
//         foreignField: "ContractId",
//         as: "Contract",
//       },
//     },
//     {
//       $lookup: {
//         from: "invoices",
//         localField: "InvoiceId",
//         foreignField: "InvoiceId",
//         as: "Invoice",
//       },
//     },
//     {
//       $lookup: {
//         from: "requestchanges",
//         localField: "RequestChangeId",
//         foreignField: "RequestChangeId",
//         as: "Request",
//       },
//     },
//     {
//       $lookup: {
//         from: "customers",
//         localField: "CustomerId",
//         foreignField: "CustomerId",
//         as: "Customer",
//       },
//     },
//     {
//       $lookup: {
//         from: "companies",
//         localField: "CompanyId",
//         foreignField: "companyId",
//         as: "Company",
//       },
//     },
//     {
//       $lookup: {
//         from: "workers",
//         localField: "WorkerId",
//         foreignField: "WorkerId",
//         as: "Worker",
//       },
//     },
//     {
//       $lookup: {
//         from: "materials-and-labors",
//         let: { productId: "$ProductId" },
//         pipeline: [
//           { $match: { $expr: { $and: [{ $eq: ["$ProductId", "$$productId"] }, { $eq: ["$IsSuperadminAdd", false] }] } } }
//         ],
//         as: "ProductAndService",
//       },
//     },
//     {
//       $lookup: {
//         from: "visits",
//         let: { visitId: "$VisitId" },
//         pipeline: [
//           {
//             $match: {
//               $expr: { $eq: ["$VisitId", "$$visitId"] },
//               IsConfirmByWorker: true,
//             },
//           },
//           {
//             $lookup: {
//               from: "workers",
//               localField: "WorkerId",
//               foreignField: "WorkerId",
//               as: "Worker",
//             },
//           },
//           {
//             $lookup: {
//               from: "contracts",
//               localField: "ContractId",
//               foreignField: "ContractId",
//               as: "ContractData",
//             },
//           },
//           {
//             $project: {
//               StartDate: 1,
//               WorkerFullName: { $arrayElemAt: ["$Worker.FullName", 0] },
//               ContractNumber: {
//                 $arrayElemAt: ["$ContractData.ContractNumber", 0],
//               },
//             },
//           },
//         ],
//         as: "Visit",
//       },
//     },
//     { $unwind: { path: "$Location", preserveNullAndEmptyArrays: true } },
//     { $unwind: { path: "$Quote", preserveNullAndEmptyArrays: true } },
//     { $unwind: { path: "$Contract", preserveNullAndEmptyArrays: true } },
//     { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: true } },
//     { $unwind: { path: "$Company", preserveNullAndEmptyArrays: true } },
//     { $unwind: { path: "$Invoice", preserveNullAndEmptyArrays: true } },
//     { $unwind: { path: "$Request", preserveNullAndEmptyArrays: true } },
//     { $unwind: { path: "$Visit", preserveNullAndEmptyArrays: true } },
//     { $unwind: { path: "$Worker", preserveNullAndEmptyArrays: true } },
//     {
//       $unwind: { path: "$ProductAndService", preserveNullAndEmptyArrays: true },
//     },
//     {
//       $group: {
//         _id: "$NotificationId",
//         notification: { $first: "$$ROOT" },
//       },
//     },
//     { $replaceRoot: { newRoot: "$notification" } },
//     { $sort: { createdAt: -1 } },
//     {
//       $project: {
//         _id: 1,
//         NotificationId: 1,
//         CompanyId: 1,
//         CustomerId: 1,
//         InvoiceId: 1,
//         QuoteId: 1,
//         WorkerId: 1,
//         ProductId: 1,
//         ContractId: 1,
//         LocationId: 1,
//         RequestChangeId: 1,
//         createdAt: 1,
//         updatedAt: 1,
//         CreatedBy: 1,
//         AddedAt: 1,
//         IsView: 1,
//         IsDelete: 1,
//         "Quote.Title": 1,
//         "Quote.QuoteNumber": 1,
//         "Quote.status": 1,
//         "Quote.Total": 1,
//         "Contract.Title": 1,
//         "Contract.ContractNumber": 1,
//         "Contract.Total": 1,
//         "Customer.FirstName": 1,
//         "Customer.LastName": 1,
//         "Invoice.Subject": 1,
//         "Invoice.InvoiceNumber": 1,
//         "Invoice.Total": 1,
//         "Company.ownerName": 1,
//         "Request.RequestMessage": 1,
//         "Visit.StartDate": 1,
//         "Visit.WorkerFullName": 1,
//         "Visit.ContractNumber": 1,
//         "Worker.FullName": 1,
//         "ProductAndService.Type": 1,
//         "ProductAndService.Name": 1,
//       },
//     },
//   ]);
//   const unreadCount = notifications.filter(
//     (notification) => !notification.IsView
//   ).length;

//   if (notifications.length === 0) {
//     return {
//       statusCode: 204,
//       message: "No notifications found",
//     };
//   }
//   return {
//     statusCode: 200,
//     count: unreadCount,
//     notifications,
//   };
// };

// router.get("/:companyId",  async (req, res) => {
//   try {
//     const { companyId } = req.params;
//     const response = await getNotifications(companyId);
//     res.status(response.statusCode).json(response);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({
//       statusCode: 500,
//       message: "Something went wrong, please try later!",
//     });
//   }
// });

//-------------------------------------------------------------------------------------

const getNotifications = async (companyId) => {
  if (!companyId) {
    return {
      statusCode: 404,
      message: "Company id is required!",
    };
  }

  const notifications = await Notification.aggregate([
    { $match: { CompanyId: companyId, IsDelete: false } },
    {
      $lookup: {
        from: "locations",
        localField: "LocationId",
        foreignField: "LocationId",
        as: "Location",
      },
    },
    {
      $lookup: {
        from: "quotes",
        localField: "QuoteId",
        foreignField: "QuoteId",
        as: "Quote",
      },
    },
    {
      $lookup: {
        from: "contracts",
        localField: "ContractId",
        foreignField: "ContractId",
        as: "Contract",
      },
    },
    {
      $lookup: {
        from: "invoices",
        let: { invoiceId: "$InvoiceId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$InvoiceId", "$$invoiceId"] },
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
            $unwind: {
              path: "$CustomerData",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              Subject: 1,
              InvoiceNumber: 1,
              Total: 1,
              CustomerId: 1,
              "CustomerData.FirstName": 1,
              "CustomerData.LastName": 1,
            },
          },
        ],
        as: "Invoice",
      },
    },
    {
      $lookup: {
        from: "requestchanges",
        localField: "RequestChangeId",
        foreignField: "RequestChangeId",
        as: "Request",
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "CustomerId",
        foreignField: "CustomerId",
        as: "Customer",
      },
    },
    {
      $lookup: {
        from: "companies",
        localField: "CompanyId",
        foreignField: "companyId",
        as: "Company",
      },
    },
    {
      $lookup: {
        from: "workers",
        localField: "WorkerId",
        foreignField: "WorkerId",
        as: "Worker",
      },
    },
    {
      $lookup: {
        from: "accounts",
        localField: "account_id",
        foreignField: "account_id",
        as: "Account",
      },
    },
    {
      $lookup: {
        from: "templates",
        localField: "TemplateId",
        foreignField: "TemplateId",
        as: "Template",
      },
    },
    {
      $lookup: {
        from: "recurring-charges",
        localField: "recurring_charge_id",
        foreignField: "recurring_charge_id",
        as: "Recurringcharge",
      },
    },
    {
      $lookup: {
        from: "recurring-payments",
        localField: "recurringId",
        foreignField: "recurringId",
        as: "Recurringpayment",
      },
    },
    {
      $lookup: {
        from: "customers",
        localField: "CustomerId",
        foreignField: "CustomerId",
        as: "Customer",
      },
    },
    {
      $lookup: {
        from: "dropboxes",
        localField: "signatureRequestId",
        foreignField: "signatureRequestId",
        as: "DropboxSignature",
      },
    },
    {
      $lookup: {
        from: "visits",
        let: { visitId: "$VisitId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$VisitId", "$$visitId"] },
            },
          },
          {
            $lookup: {
              from: "workers",
              localField: "WorkerId",
              foreignField: "WorkerId",
              as: "Worker",
            },
          },
          {
            $lookup: {
              from: "contracts",
              localField: "ContractId",
              foreignField: "ContractId",
              as: "ContractData",
            },
          },
          // {
          //   $project: {
          //     StartDate: 1,
          //     WorkerFullName: { $arrayElemAt: ["$Worker.FullName", 0] },
          //     ContractNumber: {
          //       $arrayElemAt: ["$ContractData.ContractNumber", 0],
          //     },
          //   },
          // },
          {
            $project: {
              StartDate: 1,
              WorkerFirstName: { $arrayElemAt: ["$Worker.FirstName", 0] },
              WorkerLastName: { $arrayElemAt: ["$Worker.LastName", 0] },
              ContractNumber: {
                $arrayElemAt: ["$ContractData.ContractNumber", 0],
              },
            },
          },
        ],
        as: "VisitCreate",
      },
    },

    {
      $lookup: {
        from: "materials-and-labors",
        let: { productId: "$ProductId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$ProductId", "$$productId"] },
                  { $eq: ["$IsSuperadminAdd", false] },
                ],
              },
            },
          },
        ],
        as: "ProductAndService",
      },
    },
    {
      $lookup: {
        from: "visits",
        let: { visitId: "$VisitId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$VisitId", "$$visitId"] },
              IsConfirmByWorker: true,
            },
          },
          {
            $lookup: {
              from: "workers",
              localField: "WorkerId",
              foreignField: "WorkerId",
              as: "Worker",
            },
          },
          {
            $lookup: {
              from: "contracts",
              localField: "ContractId",
              foreignField: "ContractId",
              as: "ContractData",
            },
          },
          {
            $project: {
              StartDate: 1,
              WorkerFullName: { $arrayElemAt: ["$Worker.FirstName", 0] },
              ContractNumber: {
                $arrayElemAt: ["$ContractData.ContractNumber", 0],
              },
            },
          },
        ],
        as: "Visit",
      },
    },
    { $unwind: { path: "$Location", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$Quote", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$Contract", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$Company", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$Invoice", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$Request", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$Visit", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$Worker", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$Account", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$Template", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$Recurringcharge", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$VisitCreate", preserveNullAndEmptyArrays: true } },
    {
      $unwind: { path: "$DropboxSignature", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: "$Recurringpayment", preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: {
        path: "$ProductAndService",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: "$NotificationId",
        notification: { $first: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$notification" } },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 1,
        NotificationId: 1,
        CompanyId: 1,
        CustomerId: 1,
        InvoiceId: 1,
        QuoteId: 1,
        WorkerId: 1,
        ProductId: 1,
        ContractId: 1,
        LocationId: 1,
        RequestChangeId: 1,
        createdAt: 1,
        updatedAt: 1,
        CreatedBy: 1,
        AddedAt: 1,
        IsView: 1,
        IsDelete: 1,
        account_id: 1,
        TemplateId: 1,
        recurring_charge_id: 1,
        recurringId: 1,
        CustomerId: 1,
        VisitId: 1,
        signatureRequestId: 1,
        "Quote.Title": 1,
        "Quote.QuoteNumber": 1,
        "Quote.status": 1,
        "Quote.Total": 1,
        "Contract.Title": 1,
        "Contract.ContractNumber": 1,
        "Contract.Total": 1,
        "Customer.FirstName": 1,
        "Customer.LastName": 1,
        "Invoice.Subject": 1,
        "Invoice.InvoiceNumber": 1,
        "Invoice.Total": 1,
        "Invoice.CustomerData.FirstName": 1,
        "Invoice.CustomerData.LastName": 1,
        "Company.ownerName": 1,
        "Request.RequestMessage": 1,
        "Visit.StartDate": 1,
        "Visit.WorkerFullName": 1,
        "Visit.ContractNumber": 1,
        "Worker.FirstName": 1,
        "Worker.LastName": 1,
        "ProductAndService.Type": 1,
        "ProductAndService.Name": 1,
        "Account.account_name": 1,
        "Account.account_type": 1,
        "Template.Name": 1,
        "Template.Type": 1,
        "Recurringcharge.amount": 1,
        "Recurringpayment.amount": 1,
        "Recurringpayment.card_type": 1,
        "Customer.FirstName": 1,
        "Customer.LastName": 1,
        "VisitCreate.WorkerFirstName": 1,
        "VisitCreate.WorkerLastName": 1,
        "VisitCreate.ContractNumber": 1,
        "DropboxSignature.requesterEmailAddress": 1,
      },
    },
  ]);

  const unreadCount = notifications.filter(
    (notification) => !notification.IsView
  ).length;

  if (notifications.length === 0) {
    return {
      statusCode: 204,
      message: "No notifications found",
    };
  }
  return {
    statusCode: 200,
    count: unreadCount,
    notifications,
  };
};

router.get("/:companyId", async (req, res) => {
  try {
    const { companyId } = req.params;
    const response = await getNotifications(companyId);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong, please try later!",
    });
  }
});

const markNotificationAsRead = async (notificationId) => {
  const updatedNotification = await Notification.findOneAndUpdate(
    { NotificationId: notificationId },
    { $set: { IsView: true } },
    { new: true }
  );

  if (!updatedNotification) {
    return {
      statusCode: 404,
      message: "Notification not found",
    };
  }

  return {
    statusCode: 200,
    message: "Notification marked as read",
    updatedNotification,
  };
};
router.put("/:notificationId", verifyLoginToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const response = await markNotificationAsRead(notificationId);
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

const markAllNotificationsAsRead = async (companyId) => {
  const updatedNotifications = await Notification.updateMany(
    { CompanyId: companyId, IsView: false },
    { $set: { IsView: true } }
  );

  if (updatedNotifications.nModified === 0) {
    return {
      statusCode: 404,
      message: "No unread notifications found for this company",
    };
  }

  return {
    statusCode: 200,
    message: `All notifications for company ${companyId} marked as read`,
  };
};

router.put("/view-all/:CompanyId", verifyLoginToken, async (req, res) => {
  try {
    const { CompanyId } = req.params;
    const response = await markAllNotificationsAsRead(CompanyId);
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

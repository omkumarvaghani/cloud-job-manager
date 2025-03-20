var express = require("express");
var router = express.Router();
const moment = require("moment");
var Recurring = require("./model");
const Activities = require("../ActivitiesModel");
const { verifyLoginToken } = require("../../../authentication");

const addRecurring = async (data, req) => {
  try {
    let query = {
      CustomerId: data.CustomerId,  
    };

    const recurringData = await Recurring.findOne(query);

    if (recurringData) {
      await Recurring.findOneAndUpdate(
        { recurringId: recurringData.recurringId },
        { $set: { ...data, IsDelete: false, recurrings: data.recurrings } },
        { $new: true }
      );
      
      await Activities.create({
        ActivityId: `${Date.now()}`,
        CompanyId: req.tokenData.companyId,
        Action: "UPDATE",
        Entity: "RecurringPayment",
        EntityId: recurringData.recurringId,
        ActivityBy: req.tokenData.role,
        ActivityByUsername: req.userName,
        Activity: {
          description: `Updated a Recurring Payment data for property `,
        },
        Reason: "Recurring creation",
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
    } else {
      await Recurring.create({ ...data, recurringId: Date.now() });

      await Activities.create({
        ActivityId: `${Date.now()}`,
        CompanyId: req.tokenData.companyId,
        Action: "ADD",
        Entity: "RecurringPayment",
        EntityId: recurringData.recurringId,
        ActivityBy: req.tokenData.role,
        ActivityByUsername: req.userName,
        Activity: {
          description: `Enabled a Recurring Payment data for property`,
        },
        Reason: "Recurring creation",
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
    }
    return {
      statusCode: 201,
      message: "Reccuring cards added.",
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      message: "Something went wrong, please try after sometime.",
    };
  }
};

router.post("/add-cards", verifyLoginToken, async (req, res) => {
  try {
    if (req.body && req.body?.length > 0) {
      for (const element of req.body) {
        var response = await addRecurring(element, req);
        if (response.statusCode !== 201) {
          return res.status(200).json(response);
        }
      }
      return res.status(200).json(response);
    }
  } catch (error) {
    return res.status(500).json({
      error,
      message: "Something went wrong, please try again after sometime.",
    });
  }
});

const getRecurring = async (CustomerId) => {
  try {
    let query = {
      IsDelete: false,
      CustomerId,
    };

    const data = await Recurring.findOne(query);

    if (data) {
      return {
        statusCode: 200,
        data,
      };
    } else {
      return {
        statusCode: 204,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      message: "Something went wrong, please try after sometime.",
    };
  }
};

router.post("/get-cards", verifyLoginToken, async (req, res) => {
  try {
    const { CustomerId } = req.body;
    const response = await getRecurring(CustomerId);

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong, please try after sometime.",
    });
  }
});

const disableReccuringPayment = async (CustomerId, req) => {
  try {
    const updateRecurring = await Recurring.findOneAndUpdate(
      { CustomerId: CustomerId },
      { $set: { IsDelete: true } },
      { new: true }
    );

    if (!updateRecurring) {
      return {
        statusCode: 404,
        message: "Recurring payment not found.",
      };
    }

    // Create activity log
    await Activities.create({
      ActivityId: `${Date.now()}`,
      CompanyId: req.tokenData.companyId, 
      Action: "Delete",
      Entity: "RecurringPayment",
      EntityId: updateRecurring._id,
      ActivityBy: req.tokenData.role,
      ActivityByUsername: req.userName,
      Activity: {
        description: `Disabled a Recurring`, 
      },
      Reason: "Recurring Delete",
      createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });
    return {
      statusCode: 200,
      message: "Recurring payment updated successfully.",
    };
  } catch (error) {
    console.error("Error in disableReccuringPayment:", error);
    return {
      statusCode: 500,
      message: "Something went wrong, please try again later.",
    };
  }
};

router.put("/disable-cards/:CustomerId", verifyLoginToken, async (req, res) => {
  try {
    const { CustomerId } = req.params;
    const response = await disableReccuringPayment(CustomerId, req);

    return res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Error in disable-cards route:", error);
    return res.status(500).json({
      message: "Something went wrong, please try again later.",
    });
  }
});

// router.get("/recurring-payment-configuration/:CompanyId", async (req, res) => {
//   try {
//     const CompanyId = req.params.CompanyId;
//     const currentDate = moment().format('YYYY-MM-DD');

//     const rentals = await Rentals.find({ CompanyId: CompanyId, is_delete: false });

//     let grandTotal = 0;
//     const result = [];

//     for (const rental of rentals) {
//       // const leases = await Leasing.find({
//       //   rental_id: rental.rental_id,
//       //   is_delete: false,
//       //   start_date: { $lt: currentDate },
//       //   end_date: { $gt: currentDate }
//       // });

//       const leaseGroup = [];
//       let rentalSubtotal = 0;

//       for (const lease of leases) {
//         // const unit = await Unit.findOne({ unit_id: lease?.unit_id });

//         const recurringCards = await Recurring.find({
//           // lease_id: lease.lease_id,
//           is_delete: false
//         });

//         if (recurringCards.length > 0) {
//           const tenants = [];

//           for (const card of recurringCards) {
//             const CustomerData = await Customer.findOne({ CustomerId: card.CustomerId });
//             if (CustomerData) {
//               const recurringData = card.recurrings.sort((a, b) =>
//                 new Date(a.date) - new Date(b.date)
//               );

//               const cardTotal = recurringData.reduce((sum, rec) => sum + rec.amount, 0);
//               rentalSubtotal += cardTotal;
//               grandTotal += cardTotal;

//               tenants.push({
//                 CustomerId: CustomerData.CustomerId,
//                 // tenant_name: `${CustomerData.tenant_firstName} ${CustomerData.tenant_lastName}`,
//                 customerVaultId: card.customerVaultId,
//                 recurrings: recurringData,
//               });
//             }
//           }

//           leaseGroup.push({
//             // lease_id: lease.lease_id,
//             // end_date: lease.end_date,
//             // rental_adress: rental.rental_adress,
//             // rental_unit: unit?.rental_unit || "",
//             // rental_unit_adress: unit?.rental_unit_adress || "",
//             tenants: tenants
//           });
//         }
//       }

//       if (leaseGroup.length > 0) {
//         result.push({
//           // rental_id: rental.rental_id,
//           // rental_adress: rental.rental_adress,
//           rentalSubtotal: rentalSubtotal,
//           leases: leaseGroup,
//         });
//       }
//     }

//     return res.status(200).json({
//       statusCode: 200,
//       message: "Recurring payment configuration retrieved successfully.",
//       data: result,
//       grandTotal: grandTotal
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     return res.status(500).json({
//       statusCode: 500,
//       message: "Something went wrong, please try after sometime."
//     });
//   }
// });

module.exports = router;

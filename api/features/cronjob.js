const cron = require("node-cron");
const Contract = require("./Admin/Contract/model");
const Company = require("./Admin/Company/model");
const Customer = require("./Admin/Customer/model");
const Plan = require("./Superadmin/Plan/model");
const PlanPurchase = require("./Admin/PlanPurchase/model");
const moment = require("moment");
const { cardPayment } = require("./NMI/NmiAPi");
// const { getNextDueDate } = require("./Admin/Recurring/Recurring Charge/route");
var RecurringCharge = require("../features/Admin/Recurring/Recurring Charge/model");
var RecurringPayment = require("../features/Admin/Recurring/Recurring Payment/model");
var Charge = require("../features/Admin/Charge/model");
var Payment = require("../features/Admin/Payment/model");
const Activities = require("../features/Admin/ActivitiesModel");
const { createLogger, format, transports } = require("winston");
const { getBusinessDate } = require("./Admin/BusinessDate/route");
const { chargePayment } = require("./Admin/Payment/route");
const { handleTemplate } = require("./Admin/Template/route");
const { generateAndSavePdf } = require("./generatePdf");
const { PaymentReceipt } = require("./htmlFormates/PaymentReceipt");
const emailService = require("../features/emailService");
const MailConfig = require("../features/Superadmin/MailConfiguration/model");
const CompanyMail = require("../features/Superadmin/CompanyMail/model");
const { createCharge } = require("./Admin/Charge/route");

let currentLogFile = `cronjob-logs/${moment().format("YYYY-MM-DD")}.log`;

const logFormat = format.printf(({ timestamp, level, message }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = createLogger({
  level: "info",
  transports: [
    new transports.Console(),
    new transports.File({
      filename: currentLogFile,
      level: "info",
      options: { flags: "a" },
    }),
  ],
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
});

function updateLogFile() {
  const newLogFile = `cronjob-logs/${moment().format("YYYY-MM-DD")}.log`;
  if (newLogFile !== currentLogFile) {
    logger.clear();
    currentLogFile = newLogFile;
    logger.add(
      new transports.File({
        filename: currentLogFile,
        level: "info",
        options: { flags: "a" },
      })
    );
    logger.info(`Switched to new log file: ${currentLogFile}`);
  }
}

setInterval(updateLogFile, 60 * 1000);

const getStatusBasedOnStartDate = (startDate) => {
  if (!startDate) {
    return "Unscheduled";
  }

  const today = moment().startOf("day");
  const startMoment = moment(startDate).startOf("day");

  if (startMoment.isSame(today, "day")) {
    return "Today";
  } else if (startMoment.isAfter(today)) {
    return "Upcoming";
  } else {
    return "Scheduled";
  }
};

const contractStatusUpdate = async () => {
  try {
    console.log("Cron job started: Updating contract statuses...");

    const contracts = await Contract.find({});

    if (contracts.length === 0) {
      return;
    }

    for (const contract of contracts) {
      let status = "Unscheduled";

      if (
        contract.IsOneoffJob &&
        contract.OneoffJob &&
        contract.OneoffJob.StartDate
      ) {
        status = getStatusBasedOnStartDate(contract.OneoffJob.StartDate);
      } else if (
        contract.IsRecuringJob &&
        contract.RecuringJob &&
        contract.RecuringJob.StartDate
      ) {
        status = getStatusBasedOnStartDate(contract.RecuringJob.StartDate);
      } else if (contract.StartDate) {
        status = getStatusBasedOnStartDate(contract.StartDate);
      }

      if (contract.Status !== status) {
        contract.Status = status;
        try {
          await contract.save();
        } catch (err) {
          console.log(`Error saving contract ${contract.ContractId}: `, err);
        }
      }
    }

    console.log("Cron job finished: Contract statuses updated.");
  } catch (error) {
    console.log("Error occurred during cron job:", error);
  }
};

function getDateAfterDays(date, daysToAdd) {
  const resultDate = new Date(date);
  resultDate.setDate(resultDate.getDate() + daysToAdd);
  return resultDate;
}

function getPlanEndDate(startDate, duration) {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + duration);
  return endDate;
}

const planUpdation = async () => {
  try {
    console.log("Cron job started: Updating plan.");
    const companies = await Company.find({
      IsDelete: false,
      IsActive: true,
      IsPlanActive: true,
    });

    for (const company of companies) {
      const plan = await PlanPurchase.findOne({
        CompanyId: company.companyId,
        IsDelete: false,
        IsActive: true,
      });

      if (!plan) {
        if (getDateAfterDays(company.createdAt, 14) < new Date()) {
          await Company.findOneAndUpdate(
            { companyId: company.companyId },
            { $set: { IsPlanActive: false } }
          );
        }
      } else {
        if (
          moment(plan.BillingDate).format("YYYY-MM-DD") ===
          moment(new Date()).format("YYYY-MM-DD")
        ) {
          const res = await cardPayment(
            {
              type: "sale",
              payment: "creditcard",
              customer_vault_id: "451309522",
              billing_id: "2222692284",
              amount: 1,
              surcharge: 1,
              // email: paymentDetails.email,
              security_key: "A7K7JTbdKJRGJMk242v8rbn7PmRs87nh",
              // processor_id: paymentDetails.processor_id,
            },
            "A7K7JTbdKJRGJMk242v8rbn7PmRs87nh"
          );
          console.log(res);
        }
        // const planDetails = await Plan.findOne({ PlanId: plan.PlanId });

        // const durationInMonths = Number(
        //   planDetails.MonthFrequency.split(" ")[0]
        // );

        // const planEndDate = getPlanEndDate(plan.BillingDate, durationInMonths);

        // if (new Date() >= planEndDate) {
        //   console.log("Plan Expired for companyId: ", plan.CompanyId);
        //   await Company.findOneAndUpdate(
        //     { companyId: company.companyId },
        //     { $set: { status: "Inactive" } }
        //   );
        //   await PlanPurchase.findOneAndUpdate(
        //     { PlanPurchaseId: plan.PlanPurchaseId },
        //     { $set: { IsActive: false } }
        //   );
        // }
      }
    }
    console.log("Cron Ended");
  } catch (error) {
    console.log("Error occurred during plan updation:", error);
  }
};

const getNextDueDate = (
  today,
  rentcycle,
  n = 0,
  day_of_month = null,
  weekday = null,
  month = null,
  day_of_year = null,
  days_after_quarter = null
) => {
  const startDate = moment(today, "YYYY-MM-DD");
  let nextDueDate = startDate.clone();

  try {
    switch (rentcycle) {
      case "Weekly":
        nextDueDate.add(7, "days");
        break;
      case "Monthly":
        nextDueDate.add(1, "months");
        break;
      case "Quarterly":
        const quarterStartMonth = Math.floor(startDate.month() / 3) * 3;
        nextDueDate.month(quarterStartMonth + 3);
        if (days_after_quarter !== null) {
          nextDueDate.date(1);
          nextDueDate.add(days_after_quarter - 1, "days");
        }
        break;
      case "Yearly":
        nextDueDate.add(1, "years");
        break;
      case "Every n Weeks":
        if (n <= 0) throw new Error("Invalid value for 'n' in 'Every N weeks'");
        nextDueDate.add(n * 7, "days");
        break;
      case "Every n Months":
        if (n <= 0)
          throw new Error("Invalid value for 'n' in 'Every N months'");
        nextDueDate.add(n, "months");
        break;
      default:
        throw new Error(`Invalid rent cycle: ${rentcycle}`);
    }

    if (rentcycle === "Monthly" || rentcycle === "Every n Months") {
      if (day_of_month !== null) {
        nextDueDate.date(day_of_month);
      }
    }

    const weekdayMapping = {
      Sunday: 7,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    if (rentcycle === "Weekly" || rentcycle === "Every n Weeks") {
      if (weekday !== null) {
        const targetWeekday = weekdayMapping[weekday];
        while (nextDueDate.isoWeekday() !== targetWeekday) {
          nextDueDate.add(1, "days");
        }
      }
    }

    if (rentcycle === "Yearly") {
      if (month !== null && day_of_year !== null) {
        nextDueDate.month(month - 1);
        nextDueDate.date(day_of_year);
      }
    }

    if (rentcycle === "Quarterly") {
      if (days_after_quarter !== null) {
        nextDueDate.date(days_after_quarter);
      }
    }

    return nextDueDate.format("YYYY-MM-DD");
  } catch (error) {
    console.error("Error in getNextDueDate:", error.message);
    throw error;
  }
};

const processRecurringCharges = async () => {
  logger.info("Running daily cron job for recurring charges...");

  try {
    logger.info("Fetching business date...");
    const businessDate = await getBusinessDate();
    const today = moment(businessDate).format("YYYY-MM-DD");
    logger.info("Business date fetched: " + today);

    logger.info("Cronjob start [businessDate=" + today + "]");

    logger.info(
      "Fetching recurring charges with nextDueDate <= " +
        today +
        " and IsDelete = false..."
    );
    const recurringCharges = await RecurringCharge.find({
      nextDueDate: { $lte: today },
      IsDelete: false,
    });
    logger.info("Recurring charges fetched: " + recurringCharges.length);

    for (const charge of recurringCharges) {
      const {
        recurring_charge_id,
        CompanyId,
        CustomerId,
        account_id,
        amount,
        frequency,
        frequency_interval,
        nextDueDate,
        day_of_month,
        weekday,
        month,
        day_of_year,
        days_after_quarter,
      } = charge;

      logger.info(`Processing charge ID: ${recurring_charge_id}`);
      logger.info(
        `Details - CompanyId: ${CompanyId}, CustomerId: ${CustomerId}, AccountId: ${account_id}, Amount: ${amount}, Frequency: ${frequency}, Frequency Interval: ${frequency_interval}, Next Due Date: ${nextDueDate}`
      );

      logger.info("Creating charge record...");
      // await Charge.create({
      //   recurring_charge_id,
      //   CompanyId,
      //   CustomerId,
      //   account_id,
      //   amount,
      // });
      await createCharge(
        {
          recurring_charge_id,
          CompanyId,
          CustomerId,
          account_id,
          amount,
        },
        {
          CompanyId,
        }
      );

      logger.info(
        "Charge record created for charge ID: " + recurring_charge_id
      );

      await Activities.create({
        ActivityId: `${Date.now()}`,
        CompanyId,
        Action: "CREATE",
        Entity: "Charge",
        EntityId: recurring_charge_id,
        ActivityBy: "SYSTEM",
        ActivityByUsername: "SYSTEM",
        Activity: { description: `Posted recurring charge` },
        Reason: "Recurring charge due date reached",
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
      });

      logger.info("Calculating next due date...");
      const n = parseInt(frequency_interval, 10) || 0;

      const updatedNextDueDate = getNextDueDate(
        today,
        frequency,
        n,
        day_of_month,
        weekday,
        month,
        day_of_year,
        days_after_quarter
      );
      logger.info(`Next due date calculated: ${updatedNextDueDate}`);

      logger.info(
        `Updating recurring charge ID: ${recurring_charge_id} with new nextDueDate: ${updatedNextDueDate}`
      );
      await RecurringCharge.updateOne(
        { recurring_charge_id: charge?.recurring_charge_id },
        {
          nextDueDate: updatedNextDueDate,
          updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        }
      );
      logger.info(
        `Recurring charge ID: ${recurring_charge_id} updated successfully`
      );

      logger.info(`Processed recurring charge for ID: ${recurring_charge_id}`);
    }

    logger.info("Cron job completed successfully.");
  } catch (error) {
    logger.error("Error in cron job:", error.message);
    logger.error("Stack trace:", error.stack);
  }
};

const sendEmailToCompany = async (
  CompanyId,
  companyEmail,
  subject,
  html,
  attachments = [],
  EmailId = ""
) => {
  try {
    const emailConfig = await CompanyMail.findOne({
      CompanyId: CompanyId,
      IsDelete: false,
    });
    let info;
    if (emailConfig) {
      const mailConfig = await MailConfig.findOne({
        MailConfigurationId: emailConfig.MailConfigurationId,
      });

      if (mailConfig) {
        info = await emailService.sendWelcomeEmail(
          companyEmail,
          subject,
          html,
          attachments,
          EmailId || "",
          mailConfig.Host,
          mailConfig.Port,
          mailConfig.Secure,
          mailConfig.User,
          mailConfig.Password,
          mailConfig.Mail
        );
      } else {
        throw new Error("Mail configuration not found for company email.");
      }
    } else {
      info = await emailService.sendWelcomeEmail(
        companyEmail,
        subject,
        html,
        attachments || [],
        EmailId || ""
      );
    }

    logger.info(`Email successfully sent to ${companyEmail}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${companyEmail}`, error);
    throw new Error("Error sending email to company.");
  }
};

// const recurringPayment = async () => {
//   logger.info("Running daily cron job for recurring payments...");

//   try {
//     const businessDate = await getBusinessDate();
//     const businessDayOfMonth = moment(businessDate).format("YYYY-MM-DD");

//     if (!businessDayOfMonth) {
//       logger.warn("Recurring Payments: No businessDate found.");
//       return;
//     }

//     logger.info(`Recurring Payments: Business date is ${businessDayOfMonth}`);

//     const query = {
//       IsDelete: false,
//     };

//     logger.info("Fetching recurring payment documents...");
//     const recurringPaymentDocs = await RecurringPayment.find(query);

//     console.log(recurringPaymentDocs,"recurringPaymentDocs")

//     if (!recurringPaymentDocs || recurringPaymentDocs.length === 0) {
//       logger.warn(
//         "Recurring Payments: No customers with recurring payments found."
//       );
//       return;
//     }

//     logger.info(
//       `Recurring Payments: Found ${recurringPaymentDocs.length} recurring payment documents.`
//     );

//     for (const doc of recurringPaymentDocs) {
//       const { CompanyId, CustomerId, recurrings } = doc;

//       if (!CustomerId) {
//         logger.warn(
//           `Recurring Payments: Customer not found for CustomerId: ${CustomerId}`
//         );
//         continue;
//       }

//       if (!CompanyId) {
//         logger.warn(
//           `Recurring Payments: Company not found for CompanyId: ${CompanyId}`
//         );
//         continue;
//       }

//       if (!recurrings || recurrings.length === 0) {
//         logger.warn(
//           `Recurring Payments: No recurring cards found for Company ID: ${CompanyId}, Customer ID: ${CustomerId}. Skipping customer.`
//         );
//         continue;
//       }

//       logger.info(
//         `Recurring Payments: Found recurring cards for Company ID: ${CompanyId}, Customer ID: ${CustomerId}.`
//       );

//       for (const recurring of recurrings) {
//         const nextDueDate = moment(recurring?.nextDueDate).format("YYYY-MM-DD");
//         logger.info(
//           `Recurring Payments: Comparing nextDueDate ${nextDueDate} with business day ${businessDayOfMonth}`
//         );

//         if (nextDueDate === businessDayOfMonth) {
//           try {
//             let amountToPay = recurring.amount;
//             let totalAmountToPay = 0;

//             const PaymentId = Date.now();
//             logger.info(
//               `Recurring Payments: Processing payment for PaymentId: ${PaymentId}`
//             );

//             let paymentEntries = [
//               {
//                 amount: amountToPay,
//                 billing_id: recurring?.billing_id,
//                 nextDueDate: moment(businessDate).format("YYYY-MM-DD"),
//                 account_id: recurring?.account_id,
//                 frequency: recurring?.frequency,
//                 day_of_month: recurring?.day_of_month,
//                 weekday: recurring?.weekday,
//                 month: recurring?.month,
//                 day_of_year: recurring?.day_of_year,
//                 days_after_quarter: recurring?.days_after_quarter,
//               },
//             ];

//             const n = parseInt(recurring.frequency_interval, 10) || 0;
//             const updatedNextDueDate = getNextDueDate(
//               recurring.nextDueDate,
//               recurring.frequency,
//               n,
//               recurring?.day_of_month,
//               recurring?.weekday,
//               recurring?.month,
//               recurring?.day_of_year,
//               recurring?.days_after_quarter
//             );
//             console.log(recurring, "recurring");
//             logger.info(
//               `Recurring Payments: Calculated updatedNextDueDate: ${updatedNextDueDate}`
//             );

//             await RecurringPayment.updateMany(
//               { "recurrings.billing_id": recurring.billing_id },
//               {
//                 $set: {
//                   "recurrings.$.nextDueDate": updatedNextDueDate,
//                   updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
//                 },
//               }
//             );

//             logger.info(
//               `Recurring Payments: Updated nextDueDate for billing_id: ${recurring.billing_id}`
//             );

//             const entryData = paymentEntries.map((item, index) => {
//               totalAmountToPay += item.amount;
//               return {
//                 ...item,
//                 entry_id: `${PaymentId}-${index}`,
//                 method: "card",
//                 PaymentId: PaymentId,
//               };
//             });

//             logger.info(
//               `Recurring Payments: Initiating charge payment for CustomerId: ${CustomerId}, CompanyId: ${CompanyId}`
//             );
//             const chargePaymentResponse = await chargePayment({
//               entryData,
//               CustomerId,
//               customer_vault_id: doc.customer_vault_id,
//               CompanyId,
//             });

//             logger.info(
//               `Recurring Payments: Payment response received for CustomerId: ${CustomerId}, CompanyId: ${CompanyId}`
//             );

//             for (const result of chargePaymentResponse.results) {
//               const { paymentDetails, data } = result;

//               logger.info(
//                 `Processing result for CustomerId: ${paymentDetails.CustomerId}, CompanyId: ${paymentDetails.CompanyId}`
//               );

//               const findCustomer = await Customer.findOne({
//                 CustomerId: paymentDetails.CustomerId,
//               });

//               const findCompany = await Company.findOne({
//                 companyId: paymentDetails.CompanyId,
//               });

//               if (!findCustomer) {
//                 logger.warn(
//                   `Recurring Payments: Customer not found for CustomerId: ${paymentDetails.CustomerId}`
//                 );
//                 continue;
//               }

//               if (!findCompany) {
//                 logger.warn(
//                   `Recurring Payments: Company not found for CompanyId: ${paymentDetails.CompanyId}`
//                 );
//                 continue;
//               }

//               const emailPayload = [
//                 {
//                   FirstName: findCustomer?.FirstName || "",
//                   LastName: findCustomer?.LastName || "",
//                   EmailAddress: findCustomer?.EmailAddress || "",
//                   PhoneNumber: findCustomer?.PhoneNumber || "",
//                   Method: paymentDetails?.method || "",
//                   Amount: paymentDetails?.amount || "",
//                   EmailAddress: findCompany?.EmailAddress || "",
//                   companyName: findCompany?.companyName || "",
//                   companyPhoneNumber: findCompany?.phoneNumber || "",
//                 },
//               ];

//               const successBody = `
//                 <div>
//                   <h2>Hello ${findCustomer?.FirstName || ""} ${
//                 findCustomer?.LastName || ""
//               },</h2>
//                   <p>Thank you for your payment!</p>
//                   <p>Payment Method: <strong>${
//                     paymentDetails.method || "N/A"
//                   }</strong></p>
//                   <p>Amount Paid: <strong>${
//                     paymentDetails.amount || "0.00"
//                   }</strong></p>
//                 </div>
//               `;

//               const failureBody = `
//                 <div>
//                   <h2>${findCustomer?.FirstName || ""} ${
//                 findCustomer?.LastName || ""
//               },</h2>
//                   <p>Unfortunately, payment could not be processed.</p>
//                   <p>Payment Method: <strong>${
//                     paymentDetails.method || "N/A"
//                   }</strong></p>
//                   <p>Amount Attempted: <strong>${
//                     paymentDetails.amount || "0.00"
//                   }</strong></p>
//                   <p>Response Message: <strong>${
//                     data?.responsetext || "No additional details available"
//                   }</strong></p>
//                 </div>
//               `;

//               try {
//                 logger.info(
//                   `Generating PDF for CustomerId: ${CustomerId}, CompanyId: ${CompanyId}`
//                 );
//                 const html = await PaymentReceipt(
//                   paymentDetails,
//                   data,
//                   findCompany,
//                   findCustomer
//                 );
//                 const fileName =
//                   data.response_code === "100"
//                     ? await generateAndSavePdf(html)
//                     : null;

//                 if (fileName) {
//                   logger.info(`Generated PDF: ${fileName}`);
//                 }

//                 const emailSubject =
//                   data.response_code === "100"
//                     ? "Payment Receipt - Thank You"
//                     : "Payment Failure Notification";

//                 const emailBody =
//                   data.response_code === "100" ? successBody : failureBody;

//                 const attachments = fileName ? [fileName] : [];

//                 await handleTemplate(
//                   "Recurring Payment",
//                   findCompany.companyId,
//                   emailPayload,
//                   attachments,
//                   emailSubject,
//                   emailBody,
//                   findCustomer.CustomerId
//                 );

//                 logger.info(
//                   `Email sent for CustomerId: ${CustomerId}, CompanyId: ${CompanyId}`
//                 );
//               } catch (error) {
//                 logger.error(
//                   `Error during email sending for CustomerId: ${CustomerId}, CompanyId: ${CompanyId}`,
//                   error
//                 );
//               }

//               if (data.response_code === "100") {
//                 logger.info(
//                   `Recurring Payments: Payment successfully processed for Company ID: ${CompanyId}, Customer ID: ${CustomerId}  Response: ${JSON.stringify(
//                     result
//                   )}`
//                 );
//               } else {
//                 logger.warn(
//                   `Recurring Payments: Payment failed for Company ID: ${CompanyId}, Customer ID: ${CustomerId}. Response: ${JSON.stringify(
//                     result
//                   )}`
//                 );
//                 sendEmailToCompany(
//                   findCompany.companyId,
//                   findCompany?.EmailAddress,
//                   "Payment Failure Notification",
//                   failureBody
//                 );
//               }
//             }
//           } catch (error) {
//             logger.error(
//               `Error during charge payment for CustomerId: ${CustomerId}, CompanyId: ${CompanyId}`,
//               error
//             );
//           }
//         }
//       }
//     }

//     logger.info("Recurring Payments cron job completed successfully.");
//   } catch (error) {
//     logger.error("Error fetching recurring payment details:", error);
//   }
// };
const recurringPayment = async () => {
  logger.info("Running daily cron job for recurring payments...");

  try {
    const businessDate = await getBusinessDate();
    const businessDayOfMonth = moment(businessDate).format("YYYY-MM-DD");

    if (!businessDayOfMonth) {
      logger.warn("Recurring Payments: No businessDate found.");
      return;
    }

    logger.info(`Recurring Payments: Business date is ${businessDayOfMonth}`);

    const query = {
      IsDelete: false,
    };

    logger.info("Fetching recurring payment documents...");
    const recurringPaymentDocs = await RecurringPayment.find(query);

    console.log(recurringPaymentDocs, "recurringPaymentDocs");

    if (!recurringPaymentDocs || recurringPaymentDocs.length === 0) {
      logger.warn(
        "Recurring Payments: No customers with recurring payments found."
      );
      return;
    }

    logger.info(
      `Recurring Payments: Found ${recurringPaymentDocs.length} recurring payment documents.`
    );

    for (const recurring of recurringPaymentDocs) {
      const { CompanyId, CustomerId, nextDueDate, recurringId } = recurring;

      if (!CustomerId) {
        logger.warn(
          `Recurring Payments: Customer not found for CustomerId: ${CustomerId}`
        );
        continue;
      }

      if (!CompanyId) {
        logger.warn(
          `Recurring Payments: Company not found for CompanyId: ${CompanyId}`
        );
        continue;
      }

      const formattedNextDueDate = moment(nextDueDate).format("YYYY-MM-DD");
      logger.info(
        `Recurring Payments: Comparing nextDueDate ${formattedNextDueDate} with business day ${businessDayOfMonth}`
      );

      if (formattedNextDueDate === businessDayOfMonth) {
        try {
          let amountToPay = recurring.amount;
          let totalAmountToPay = 0;

          const PaymentId = Date.now();
          logger.info(
            `Recurring Payments: Processing payment for PaymentId: ${PaymentId}`
          );

          let paymentEntries = [
            {
              amount: amountToPay,
              billing_id: recurring.billing_id,
              nextDueDate: formattedNextDueDate,
              account_id: recurring.account_id,
              frequency: recurring.frequency,
              day_of_month: recurring.day_of_month,
              weekday: recurring.weekday,
              month: recurring.month,
              day_of_year: recurring.day_of_year,
              days_after_quarter: recurring.days_after_quarter,
            },
          ];

          const n = parseInt(recurring.frequency_interval, 10) || 0;
          const updatedNextDueDate = getNextDueDate(
            recurring.nextDueDate,
            recurring.frequency,
            n,
            recurring.day_of_month,
            recurring.weekday,
            recurring.month,
            recurring.day_of_year,
            recurring.days_after_quarter
          );

          logger.info(
            `Recurring Payments: Calculated updatedNextDueDate: ${updatedNextDueDate}`
          );

          await RecurringPayment.updateOne(
            { recurringId: recurring.recurringId },
            {
              $set: {
                nextDueDate: updatedNextDueDate,
                updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
              },
            }
          );

          logger.info(
            `Recurring Payments: Updated nextDueDate for billing_id: ${recurring.billing_id}`
          );

          const entryData = paymentEntries.map((item, index) => {
            totalAmountToPay += item.amount;
            return {
              ...item,
              entry_id: `${PaymentId}-${index}`,
              method: "card",
              PaymentId: PaymentId,
            };
          });

          logger.info(
            `Recurring Payments: Initiating charge payment for CustomerId: ${CustomerId}, CompanyId: ${CompanyId}`
          );
          const chargePaymentResponse = await chargePayment({
            entryData,
            CustomerId,
            customer_vault_id: recurring.customer_vault_id,
            CompanyId,
            recurringId,
          });

          logger.info(
            `Recurring Payments: Payment response received for CustomerId: ${CustomerId}, CompanyId: ${CompanyId}`
          );

          for (const result of chargePaymentResponse.results) {
            const { paymentDetails, data } = result;

            logger.info(
              `Processing result for CustomerId: ${paymentDetails.CustomerId}, CompanyId: ${paymentDetails.CompanyId}`
            );

            const findCustomer = await Customer.findOne({
              CustomerId: paymentDetails.CustomerId,
            });
            const findCompany = await Company.findOne({
              companyId: paymentDetails.CompanyId,
            });

            if (!findCustomer) {
              logger.warn(
                `Recurring Payments: Customer not found for CustomerId: ${paymentDetails.CustomerId}`
              );
              continue;
            }

            if (!findCompany) {
              logger.warn(
                `Recurring Payments: Company not found for CompanyId: ${paymentDetails.CompanyId}`
              );
              continue;
            }

            const emailPayload = [
              {
                FirstName: findCustomer?.FirstName || "",
                LastName: findCustomer?.LastName || "",
                EmailAddress: findCustomer?.EmailAddress || "",
                PhoneNumber: findCustomer?.PhoneNumber || "",
                Method: paymentDetails?.method || "",
                Amount: paymentDetails?.amount || "",
                EmailAddress: findCompany?.EmailAddress || "",
                companyName: findCompany?.companyName || "",
                companyPhoneNumber: findCompany?.phoneNumber || "",
              },
            ];

            const successBody = `
                              <div>
                                <h2>Hello ${findCustomer?.FirstName || ""} ${
              findCustomer?.LastName || ""
            },</h2>
                                <p>Thank you for your payment!</p>
                                <p>Payment Method: <strong>${
                                  paymentDetails.method || "N/A"
                                }</strong></p>
                                <p>Amount Paid: <strong>${
                                  paymentDetails.amount || "0.00"
                                }</strong></p>
                              </div>
                            `;

            const failureBody = `
                              <div>
                                <h2>${findCustomer?.FirstName || ""} ${
              findCustomer?.LastName || ""
            },</h2>
                                <p>Unfortunately, payment could not be processed.</p>
                                <p>Payment Method: <strong>${
                                  paymentDetails.method || "N/A"
                                }</strong></p>
                                <p>Amount Attempted: <strong>${
                                  paymentDetails.amount || "0.00"
                                }</strong></p>
                                <p>Response Message: <strong>${
                                  data?.responsetext ||
                                  "No additional details available"
                                }</strong></p>
                              </div>
                            `;

            try {
              logger.info(
                `Generating PDF for CustomerId: ${CustomerId}, CompanyId: ${CompanyId}`
              );
              const html = await PaymentReceipt(
                paymentDetails,
                data,
                findCompany,
                findCustomer
              );
              const fileName =
                data.response_code === "100"
                  ? await generateAndSavePdf(html)
                  : null;

              if (fileName) {
                logger.info(`Generated PDF: ${fileName}`);
              }

              const emailSubject =
                data.response_code === "100"
                  ? "Payment Receipt - Thank You"
                  : "Payment Failure Notification";

              const emailBody =
                data.response_code === "100" ? successBody : failureBody;

              const attachments = fileName ? [fileName] : [];

              await handleTemplate(
                "Recurring Payment",
                findCompany.companyId,
                emailPayload,
                attachments,
                emailSubject,
                emailBody,
                findCustomer.CustomerId
              );

              logger.info(
                `Email sent for CustomerId: ${CustomerId}, CompanyId: ${CompanyId}`
              );
            } catch (error) {
              logger.error(
                `Error during email sending for CustomerId: ${CustomerId}, CompanyId: ${CompanyId}`,
                error
              );
            }

            if (data.response_code === "100") {
              logger.info(
                `Recurring Payments: Payment successfully processed for Company ID: ${CompanyId}, Customer ID: ${CustomerId} Response: ${JSON.stringify(
                  result
                )}`
              );
            } else {
              logger.warn(
                `Recurring Payments: Payment failed for Company ID: ${CompanyId}, Customer ID: ${CustomerId}. Response: ${JSON.stringify(
                  result
                )}`
              );
              sendEmailToCompany(
                findCompany.companyId,
                findCompany?.EmailAddress,
                "Payment Failure Notification",
                failureBody
              );
            }
          }
        } catch (error) {
          logger.error(
            `Error during charge payment for CustomerId: ${CustomerId}, CompanyId: ${CompanyId}`,
            error
          );
        }
      }
    }

    logger.info("Recurring Payments cron job completed successfully.");
  } catch (error) {
    logger.error("Error fetching recurring payment details:", error);
  }
};

// Properly schedule the cron jobs
// cron.schedule("10 00 * * *", planUpdation);
cron.schedule("15 00 * * *", processRecurringCharges);
cron.schedule("20 00 * * *", recurringPayment);
cron.schedule("25 00 * * *", contractStatusUpdate);

module.exports = cron;

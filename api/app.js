require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
const fs = require("fs");
const path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var nocache = require("nocache");

var initMongo = require("./config.js/mongo");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

var cron = require("../api/features/cronjob");

// New
// Signup Step
var IndustryRouter = require("./features/Superadmin/SignupStep/Industry/route");
var TeamsizeRouter = require("./features/Superadmin/SignupStep/TeamSIze/route");
var RevenueRouter = require("./features/Superadmin/SignupStep/Revenue/route");
var CompanyRouter = require("./features/Admin/Company/route");
var CustomerRouter = require("./features/Admin/Customer/route");
var SuperAdminRouter = require("./features/Superadmin/SignupLogin/route");
var LocationRouter = require("./features/Admin/Location/route");
var MaterialsAndLaborRouter = require("./features/Superadmin/MaterialsAndLabor/route");
var QuoteRouter = require("./features/Admin/Quote/route");
var PlanRouter = require("./features/Superadmin/Plan/route");
var PermissionStepsRouter = require("./features/Superadmin/PermissionSteps/route");
var WorkerRouter = require("./features/Admin/Worker/route");
var NotificationRouter = require("./features/Notification/route");
var ContractRouter = require("./features/Admin/Contract/route");
var LabourRouter = require("./features/Admin/Contract/Labour/route");
var ExpensesRouter = require("./features/Admin/Contract/Expenses/route");
var NMIRouter = require("./features/NMI/NmiAPi");
var NMIKeyRouter = require("./features/Superadmin/NMIKeys/route");
var PlanPurchaseRouter = require("./features/Admin/PlanPurchase/route");
var InvoiceRouter = require("./features/Admin/Invoice/route");
var WebhookRouter = require("./features/NMI/Webhooks/route");
var VisitsRouter = require("./features/Admin/Contract/Visits/route");
var PaymentRouter = require("./features/Admin/Invoice/InvoicePayment/route");
var RequestChangeRouter = require("./features/Admin/RequestChange/route");
var DropboxSignRouter = require("./features/Admin/Dropbox/route");
var MailConfigurationRouter = require("./features/Superadmin/MailConfiguration/route");
var CompanyMailRouter = require("./features/Superadmin/CompanyMail/route");
var ResetPasswordRouter = require("./features/Admin/ResetPassword/route");
var ActivitiesLog = require("./features/Admin/ActivityRoute");
var AdminGraph = require("./features/Admin/Graph");
var TemplatesRouter = require("./features/Admin/Template/route");
var EmailRouter = require("./features/Admin/EmailLogs/route");
var ThemeRouter = require("./features/Admin/Theme/route");
var SurchargeRouter = require("./features/Admin/Surcharge/route");
var AccountRouter = require("./features/Admin/Account/route");
var RecurringChargeRouter = require("./features/Admin/Recurring/Recurring Charge/route");
var RecurringPaymentRouter = require("./features/Admin/Recurring/Recurring Payment/route");
var ReportRouter = require("./features/Admin/Report/route");
var ChargeRouter = require("./features/Admin/Charge/route");
var MailPreferenceRouter = require("./features/Admin/EmailPreference/route");
var Payment = require("./features/Admin/Payment/route");
var GeneralLedgerRouter = require("./features/Admin/GeneralLedger/route");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(nocache());

const getLogFilePath = (url) => {
  const pathSegment = url.split("/")[2] || "general";
  const sanitizedPathSegment = pathSegment.replace(/[^a-zA-Z0-9]/g, "_");

  const currentDate = new Date().toISOString().split("T")[0];

  return path.join(
    __dirname,
    `logs/${sanitizedPathSegment}_${currentDate}.log`
  );
};

app.use((req, res, next) => {
  const logDir = path.join(__dirname, "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const logFilePath = getLogFilePath(req.originalUrl);
  const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

  const originalSend = res.send;

  res.send = function (body) {
    const dividerStart = "(---------------------------------------------";
    const dividerEnd = "---------------------------------------------)";

    const commonLogEntry = `
${dividerStart}
Time        : ${new Date().toISOString()}
API Path    : ${req.originalUrl}
Method      : ${req.method}
Request Body: ${JSON.stringify(req.body, null, 2)}`;

    if (!req.originalUrl.includes("/login")) {
      const logEntry = `${commonLogEntry}
Response    : ${body}
${dividerEnd}\n\n`;
      logStream.write(logEntry);
    } else {
      const logEntry = `${commonLogEntry}
Response    : <hidden>
${dividerEnd}\n\n`;
      logStream.write(logEntry);
    }

    return originalSend.call(this, body);
  };

  next();
});

app.use("/api", indexRouter);
app.use("/users", usersRouter);

// Signup Step
app.use("/api/industry", IndustryRouter);
app.use("/api/revenue", RevenueRouter);
app.use("/api/teamsize", TeamsizeRouter);

// new
app.use("/api/company", CompanyRouter);
app.use("/api/customer", CustomerRouter);
app.use("/api/superadmin", SuperAdminRouter);
app.use("/api/location", LocationRouter);
app.use("/api/materialslabor", MaterialsAndLaborRouter);
app.use("/api/quote", QuoteRouter);
app.use("/api/plan", PlanRouter);
app.use("/api/permissionsteps", PermissionStepsRouter);
app.use("/api/worker", WorkerRouter);
app.use("/api/notifications", NotificationRouter);
app.use("/api/contract", ContractRouter);
app.use("/api/labour", LabourRouter);
app.use("/api/expenses", ExpensesRouter);
app.use("/api/nmi", NMIRouter.router);
app.use("/api/nmikey", NMIKeyRouter);
app.use("/api/planpurchase", PlanPurchaseRouter);
app.use("/api/invoice", InvoiceRouter.router);
app.use("/api/webhook", WebhookRouter);
app.use("/api/visits", VisitsRouter);
app.use("/api/invoice-payment", PaymentRouter.router);
app.use("/api/requestchange", RequestChangeRouter);
app.use("/api/dropbox", DropboxSignRouter.router);
app.use("/api/mailconfiguration", MailConfigurationRouter);
app.use("/api/CompanyMail", CompanyMailRouter);
app.use("/api/resetpassword", ResetPasswordRouter);
app.use("/api/activitylog", ActivitiesLog);
app.use("/api/admingraph", AdminGraph);
app.use("/api/template", TemplatesRouter.router);
app.use("/api/email-log", EmailRouter);
app.use("/api/themes", ThemeRouter);
app.use("/api/surcharge", SurchargeRouter);
app.use("/api/account", AccountRouter);
app.use("/api/recurring-charge", RecurringChargeRouter.router);
app.use("/api/recurring-payment", RecurringPaymentRouter);
app.use("/api/report", ReportRouter);
app.use("/api/mailPreference", MailPreferenceRouter);
app.use("/api/payment", Payment.router);
app.use("/api/charge", ChargeRouter.router);
app.use("/api/general_ledger", GeneralLedgerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Init MongoDB
initMongo();

module.exports = app;

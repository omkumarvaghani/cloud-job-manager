const express = require("express");
const router = express.Router();

// v1
router.use("/v1/auth", require("./v1/authRoutes"));
router.use("/v1/user", require("../routes/v1/userRoutes"));
router.use("/v1/industry", require("../routes/v1/industryRoutes"));
router.use("/v1/revenue", require("../routes/v1/revenueRoutes"));
router.use("/v1/teamsize", require("../routes/v1/teamsizeRoutes"));
router.use("/v1/plan", require("../routes/v1/planRoutes"));
router.use("/v1/permission", require("../routes/v1/permissionRoutes"));
router.use("/v1/quote", require("../routes/v1/quoteRoutes"));
router.use("/v1/material", require("../routes/v1/materialRoutes"));
router.use("/v1/customer", require("../routes/v1/customerRoutes"));
router.use("/v1/location", require("../routes/v1/locationRoutes"));
router.use("/v1/contract", require("../routes/v1/contractRoutes"));
router.use("/v1/visit", require("../routes/v1/visitRoutes"));
router.use("/v1/labour", require("../routes/v1/labourRoutes"));
router.use("/v1/worker", require("../routes/v1/workerRoutes"));
router.use("/v1/expense", require("../routes/v1/expenseRoutes"));

module.exports = router;

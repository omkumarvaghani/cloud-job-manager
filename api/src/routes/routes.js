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

module.exports = router;

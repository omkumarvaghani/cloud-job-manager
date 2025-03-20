const express = require("express");
const logger = require("morgan");
const cors = require("cors");

const routes = require("./routes/routes");
require("./config/env");
require("./config/db");

const app = express();
const appUrl = process.env.APP_URL;

app.use(logger("dev"));
app.use(cors({ origin: appUrl }));

// Place express.json() before your routes
app.use(express.json());

app.use("/api", routes);

module.exports = app;

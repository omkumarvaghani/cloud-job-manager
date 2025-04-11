const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const routes = require("./routes/routes");
require("./config/env");
require("./config/db");

const app = express();

const logDir = path.join(__dirname, "alllogs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const getLogFilePath = (url) => {
  const sanitizedUrl = url.replace(/\//g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  return path.join(logDir, `${sanitizedUrl || "root"}.log`);
};

app.use((req, res, next) => {
  const logFilePath = getLogFilePath(req.originalUrl);
  const logStream = fs.createWriteStream(logFilePath, { flags: "a" });

  const originalSend = res.send;

  res.send = function (body) {
    const safeBody = { ...req.body };
    if (safeBody.Password) {
      safeBody.Password = "<hidden>";
    }

    const logEntry = `
Time: ${new Date().toISOString()}
API Path: ${req.originalUrl}
Method: ${req.method}
Request Body: ${JSON.stringify(safeBody)}
Response: ${req.originalUrl.includes("/login") ? "<hidden>" : body}
----------------------------------------------
`;

    logStream.write(logEntry);
    return originalSend.call(this, body);
  };

  next();
});

app.use(logger("dev"));
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

module.exports = app;

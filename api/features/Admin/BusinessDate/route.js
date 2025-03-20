const BusinessDate = require("./model");
const { createLogger, format, transports } = require("winston");
var moment = require("moment");
const cron = require("node-cron");

let currentLogFile = `cronjob-logs/${moment().format(
  "YYYY-MM-DD"
)}-BusinessDate.log`;
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
  const newLogFile = `cronjob-logs/${moment().format(
    "YYYY-MM-DD"
  )}-BusinessDate.log`;
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

setInterval(updateLogFile, 1800 * 1000);

const incrementBusinessDate = async (req, res, next) => {
  try {
    logger.info("Business Date: Start updating of BusinessDate");
    const query = { BusinessDateKey: "BusinessDate" };

    const settingsData = await BusinessDate.findOne(query);

    if (settingsData) {
      logger.info(
        `Business Date: Old BusinessDate is ${
          settingsData.BusinessDateValue
        } and old BusinessDate data is ${JSON.stringify(settingsData)}`
      );
    }

    const currentDate = moment(settingsData.BusinessDateValue)
      .add(1, "days")
      .format("YYYY-MM-DD");
    logger.info(`Business Date: New BusinessDate is ${currentDate}`);

    const updateData = {
      BusinessDateValue: currentDate,
      LastModified: Date.now(),
      BusinessDateKey: "BusinessDate",
    };

    logger.info(
      `Business Date: New BusinessDate updation data ${JSON.stringify(
        updateData
      )}`
    );

    const newBusinessData = await BusinessDate.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true, upsert: true }
    );

    logger.info(
      `Business Date: New BusinessDate data is ${JSON.stringify(
        newBusinessData
      )}`
    );

    logger.info("Business Date: End updating of BusinessDate");

    res
      .status(200)
      .send("BusinessDate increased successfully to " + currentDate);
  } catch (error) {
    logger.error("Business Date: Error in updating of BusinessDate: ", error);
    res.status(500).send("Error incrementing business date", error);
  }
};

const getBusinessDate = async () => {
  try {
    const query = { BusinessDateKey: "BusinessDate" };

    let settingsData = await BusinessDate.findOne(query);

    if (!settingsData) {
      const currentDate = moment().format("YYYY-MM-DD");
      const updateData = {
        BusinessDateValue: currentDate,
        LastModified: moment().toISOString(),
        BusinessDateKey: "BusinessDate",
      };

      settingsData = await BusinessDate.create(updateData);
    }

    return new Date(settingsData.BusinessDateValue + " 00:00:00");
  } catch (error) {
    console.error("Error in getBusinessDate:", error.message, error.stack);
    throw error;
  }
};
// incrementBusinessDate();
cron.schedule("10 00 * * *", incrementBusinessDate);

module.exports = { incrementBusinessDate, getBusinessDate };

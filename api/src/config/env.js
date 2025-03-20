const dotenv = require("dotenv");

const envFile =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env";

dotenv.config({ path: envFile });

console.log(`Running in ${process.env.NODE_ENV} mode`);

module.exports = dotenv;

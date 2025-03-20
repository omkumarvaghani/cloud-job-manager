const mongoose = require("mongoose");

const databseString = process.env.DATABSE_STRING;

mongoose
  .connect(databseString)
  .then(() => console.log("Databse connected successfully!"))
  .catch((error) => console.log("Error to connect database: ", error));

module.exports = mongoose;

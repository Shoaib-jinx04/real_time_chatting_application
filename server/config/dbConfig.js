const mongoose = require("mongoose");

//Connection Logic
mongoose.connect(process.env.CON_STRING);

//Connection State
const db = mongoose.connection;

//Check DB connection
db.on("connected", () => {
  console.log("DB connection successful");
});

db.on("err", () => {
  console.log("DB connection failed");
});

module.exports = db;

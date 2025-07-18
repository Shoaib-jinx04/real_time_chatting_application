const env = require("dotenv");
env.config();

const newLocal = "./config/dbConfig";
const dbconfig = require(newLocal);

const server = require("./app");

const port = process.env.PORT_NUMBER || 3000;

server.listen(port, () => {
  console.log("Listening to requests on PORT: " + port);
});

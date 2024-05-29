const app = require("./app");
const dotenv = require("dotenv");
const ConnectDb = require("./config/connection");

dotenv.config({ path: "./config/config.env" });

ConnectDb();

app.listen(process.env.PORT, () => {
  console.log(`Server is working on ${process.env.PORT}`);
});

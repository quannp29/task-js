const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const database = require("./config/database");
database.connect();

const app = express();
const port = process.env.PORT;

const routesApiV1 = require("./v1/routes/index.route");

routesApiV1(app);

app.listen(port, () => {
  console.log(`App listenning on port ${port}`);
})
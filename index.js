const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require('cors');
const bodyParser = require('body-parser');

const database = require("./config/database");
database.connect();

const app = express();
const port = process.env.PORT;

// parse application/json
app.use(bodyParser.json());

app.use(cors());

const routesApiV1 = require("./v1/routes/index.route");

routesApiV1(app);

app.listen(port, () => {
  console.log(`App listenning on port ${port}`);
})
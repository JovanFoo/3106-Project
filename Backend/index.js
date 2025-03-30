require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");

// app.set("views", "./app/views");
// app.set("views", "./views");
app.set("views", path.join(__dirname, "views"));
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
app.use(bodyParser.json());
app.use(cookieParser());

const ApiRouter = require("./app/routes/index.js");
const ViewRouter = require("./app/routes/View.js");
app.use(express.static("public"));

app.use("/api", ApiRouter);
app.use("/", ViewRouter);
app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});

module.exports = app;

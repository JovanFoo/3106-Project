const express = require("express");
const app = express();

const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname + "/../views"));
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
const a = 0;
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const ApiRouter = require("./app/routes/index.js");
const ViewRouter = require("./app/routes/View.js");
app.use(express.static("public"));

app.get("/", (req, res) => res.send("Express on Vercel"));
app.post("/", (req, res) => res.send("Express on Vercel"));

app.use("/api", ApiRouter);
app.use("/", ViewRouter);
app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});

module.exports = app;

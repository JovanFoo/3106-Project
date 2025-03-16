const express = require("express");

const ApiRouter = express.Router();

const CustomerRouter = require("./CustomerRoute.js");
const AuthRouter = require("./AuthRoute.js");
const AppointmentRouter = require("./AppointmentRoute.js");
const ExpertiseRouter = require("./ExpertiseRoute.js");
const StylistRouter = require("./StylistRoute.js");

ApiRouter.use("/customers", CustomerRouter);
ApiRouter.use("/auth", AuthRouter);
ApiRouter.use("/Appointments", AppointmentRouter);
// ApiRouter.use("/payments", CustomerRouter);
// ApiRouter.use("/reviews", CustomerRouter);
// ApiRouter.use("/branches", CustomerRouter);
// ApiRouter.use("/promotions", CustomerRouter);
// ApiRouter.use("/discounts", CustomerRouter);
// ApiRouter.use("/services", CustomerRouter);
// ApiRouter.use("/expertise", CustomerRouter);
ApiRouter.use("/stylists", StylistRouter);
ApiRouter.use("/expertises", ExpertiseRouter);

ApiRouter.get("/", (req, res) => {
  res.send("API is working");
});
ApiRouter.post("/", (req, res) => {
  res.send("API is working");
});
module.exports = ApiRouter;

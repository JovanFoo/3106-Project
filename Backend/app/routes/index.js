const express = require("express");

const ApiRouter = express.Router();

const AppointmentRouter = require("./AppointmentRoute.js");
const AuthRouter = require("./AuthRoute.js");
const BranchRoute = require("./BranchRoute.js");
const CustomerRouter = require("./CustomerRoute.js");
const PromotionRouter = require("./PromotionRoute.js");
// const PaymentRouter = require("./PaymentRouter.js");
// const ReviewRouter = require("./AppointmentRoute.js");

ApiRouter.use("/customers", CustomerRouter);
ApiRouter.use("/auth", AuthRouter);
ApiRouter.use("/Appointments", AppointmentRouter);
// ApiRouter.use("/payments", PaymentRouter);
ApiRouter.use("/branches", BranchRoute);
ApiRouter.use("/promotions", PromotionRouter);
// ApiRouter.use("/reviews", CustomerRouter);
// ApiRouter.use("/discounts", CustomerRouter);
// ApiRouter.use("/services", CustomerRouter);
// ApiRouter.use("/expertise", CustomerRouter);
// ApiRouter.use("/stylists", CustomerRouter);

ApiRouter.get("/", (req, res) => {
  res.send("API is working");
});
ApiRouter.post("/", (req, res) => {
  res.send("API is working");
});
module.exports = ApiRouter;

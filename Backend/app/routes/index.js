const express = require("express");

const ApiRouter = express.Router();

const AppointmentRouter = require("./AppointmentRoute.js");
const AuthRouter = require("./AuthRoute.js");
const BranchRoute = require("./BranchRoute.js");
const CustomerRouter = require("./CustomerRoute.js");
// const PaymentRouter = require("./PaymentRouter.js");
const ReviewRouter = require("./ReviewRoute.js");
const ExpertiseRouter = require("./ExpertiseRoute.js");
const StylistRouter = require("./StylistRoute.js");
const ServiceRouter = require("./ServiceRoute.js");
const ServiceRateRouter = require("./ServiceRateRoute.js");
const PromotionRouter = require("./PromotionRoute.js");
const DiscountRouter = require("./DiscountRoute.js");  
const LeaveRequestRouter = require("./LeaveRequestRoute.js");  

ApiRouter.use("/customers", CustomerRouter);
ApiRouter.use("/auth", AuthRouter);
ApiRouter.use("/appointments", AppointmentRouter);
// ApiRouter.use("/payments", PaymentRouter);
ApiRouter.use("/reviews", ReviewRouter);
ApiRouter.use("/branches", BranchRoute);

ApiRouter.use("/promotions", PromotionRouter);
// ApiRouter.use("/discounts", DiscountRouter);
ApiRouter.use("/services", ServiceRouter);
ApiRouter.use("/stylists", StylistRouter);
ApiRouter.use("/expertises", ExpertiseRouter);
ApiRouter.use("/services", ServiceRouter);
ApiRouter.use("/servicerates", ServiceRateRouter);
ApiRouter.use("/promotions", PromotionRouter);
ApiRouter.use("/discounts", DiscountRouter);
ApiRouter.use("/leave-requests", LeaveRequestRouter);

ApiRouter.get("/", (req, res) => {
  res.send("API is working");
});
ApiRouter.post("/", (req, res) => {
  res.send("API is working");
});
module.exports = ApiRouter;

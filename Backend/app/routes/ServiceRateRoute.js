const express = require("express");

const ServiceRateRouter = express.Router();

const ServiceRateController = require("../controllers/ServiceRateController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");
const ServiceRate = require("../models/ServiceRate.js");

// get ServiceRate by id
ServiceRateRouter.get(
  "/:id",
  AuthMiddleware.authCustomerToken,
  ServiceRateController.retrieve
);
// update ServiceRate by id --> TODO: (only stylist manager can create?)
ServiceRateRouter.put(
  "/:id",
  AuthMiddleware.authStylistManagerToken,
  ServiceRateController.update
);
// create ServiceRate by id --> TODO: (only stylist manager can create?)
ServiceRateRouter.put(
  "/",
  AuthMiddleware.authStylistManagerToken,
  ServiceRateController.create
);
// delete ServiceRate by id --> TODO: (only stylist manager can create?)
ServiceRateRouter.delete(
  "/:id",
  AuthMiddleware.authStylistManagerToken,
  ServiceRateController.delete
);

module.exports = ServiceRateRouter;

const express = require("express");

const ServiceRouter = express.Router();

const ServiceController = require("../controllers/ServiceController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");
const Service = require("../models/Service.js");

ServiceRouter.get(
  "/all",
  AuthMiddleware.authStylistToken,
  ServiceController.retrieveAllWithAllServiceRates
);
ServiceRouter.get(
  "/paginated/:paginated",
  AuthMiddleware.authStylistToken,
  ServiceController.retrieveAllWithAllServiceRates
);
// create new service
ServiceRouter.post(
  "/",
  AuthMiddleware.authStylistToken, // TODO: change accordingly to desired person
  ServiceController.create
);
// get all services
ServiceRouter.get(
  "/",
  AuthMiddleware.authCustomerOrStylistToken,
  ServiceController.retrieveAll
);
// get svc by id
ServiceRouter.get(
  "/:id",
  AuthMiddleware.authCustomerToken,
  ServiceController.retrieve
);
// update svc by id
ServiceRouter.put(
  "/:id",
  AuthMiddleware.authAdminOrStylistManagerToken,
  ServiceController.update
);
// delete promo by id (only a login customer can delete their account)
ServiceRouter.delete(
  "/",
  AuthMiddleware.authCustomerToken,
  ServiceController.delete
);

module.exports = ServiceRouter;

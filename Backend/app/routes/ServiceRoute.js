const express = require("express");

const ServiceRouter = express.Router();

const ServiceController = require("../controllers/ServiceController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");
const Service = require("../models/Service.js");

ServiceRouter.get(
  "/all",
  AuthMiddleware.authAdminStylistOrManagerToken,
  ServiceController.retrieveAllWithAllServiceRates
);
ServiceRouter.get(
  "/paginated/:paginated",
  AuthMiddleware.authAdminOrStylistManagerToken,
  ServiceController.retrieveAllWithAllServiceRates
);
// create new service
ServiceRouter.post(
  "/",
  AuthMiddleware.authAdminToken, // TODO: change accordingly to desired person
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
  "/:id",
  AuthMiddleware.authAdminToken,
  ServiceController.delete
);

module.exports = ServiceRouter;

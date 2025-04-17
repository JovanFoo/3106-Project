const express = require("express");

const StylistRouter = express.Router();

const StylistController = require("../controllers/StylistController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");
const Stylist = require("../models/Stylist.js");
const LeaveRequestController = require("../controllers/LeaveRequestController.js");
const AuthController = require("../controllers/AuthController.js");
StylistRouter.post(
  "/",
  AuthMiddleware.authAdminToken,
  StylistController.createStylistWithBranch
);
// get stylist by name
StylistRouter.get(
  "/search/:name",
  AuthMiddleware.authCustomerOrStylistToken,
  StylistController.retrieveStylistsByName
);
StylistRouter.put(
  "/teams",
  AuthMiddleware.authAdminCustomerStylistOrManagerToken,
  StylistController.retrieveAllStylists
);
StylistRouter.put(
  "/toggleActive/:id",
  AuthMiddleware.authAdminToken,
  StylistController.toggleActive
);

// update stylist profile picture
StylistRouter.put(
  "/profilePicture",
  AuthMiddleware.authStylistToken,
  StylistController.updateProfilePicture
);

// update stylist expertises
StylistRouter.put(
  "/expertises",
  AuthMiddleware.authStylistToken,
  StylistController.updateExpertises
);

// get my appointments
StylistRouter.get(
  "/my-appointments",
  AuthMiddleware.authStylistToken,
  StylistController.retrieveMyAppointments
);

// get appointments of a stylist by id
StylistRouter.get(
  "/appointments/:id",
  AuthMiddleware.authCustomerOrStylistToken,
  StylistController.retrieveAppointments
);

StylistRouter.get(
  "/adminAccess",
  AuthMiddleware.authAdminOrStylistManagerToken,
  StylistController.retrieveAll
);
StylistRouter.get(
  "/pagination",
  AuthMiddleware.authAdminOrStylistManagerToken,
  StylistController.retrieveAllWithPagination
);
// get list of all stylists
StylistRouter.get(
  "/",
  AuthMiddleware.authAdminCustomerStylistOrManagerToken,
  StylistController.retrieveAllStylists
);
// get stylist by id
StylistRouter.get(
  "/:id",
  AuthMiddleware.authAdminStylistOrManagerToken,
  StylistController.retrieveById
);
// update stylist by id (only logged in stylist can update)
StylistRouter.put(
  "/:id",
  AuthMiddleware.authStylistToken,
  StylistController.update
);

// delete expertise by id (only admin can delete)
StylistRouter.delete(
  "/:id",
  AuthMiddleware.authStylistToken,
  StylistController.delete
);

// admin access to all stylists
StylistRouter.get(
  "/adminAccess",
  AuthMiddleware.authAdminOrStylistManagerToken,
  StylistController.retrieveAll
);
// get list of all stylists
StylistRouter.get(
  "/",
  AuthMiddleware.authCustomerOrStylistToken,
  StylistController.retrieveAllStylists
);
// get stylist's available times based on date and service, for Customer
StylistRouter.get(
  "/:id/availability",
  AuthMiddleware.authCustomerToken,
  StylistController.getStylistAvailabilityByDateAndService
);
module.exports = StylistRouter;

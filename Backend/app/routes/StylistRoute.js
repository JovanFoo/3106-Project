const express = require("express");

const StylistRouter = express.Router();

const StylistController = require("../controllers/StylistController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");
const Stylist = require("../models/Stylist.js");

// get stylist by id
StylistRouter.get(
  "/:id",
  AuthMiddleware.authStylistToken,
  StylistController.retrieve
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
// get appointments of a stylist by id
StylistRouter.get(
  "/:id/appointments",
  AuthMiddleware.authCustomerOrStylistToken,
  StylistController.retrieveAppointments
);
// update stylist profile picture
StylistRouter.put(
  "/profilePicture",
  AuthMiddleware.authStylistToken,
  StylistController.updateProfilePicture
);

module.exports = StylistRouter;

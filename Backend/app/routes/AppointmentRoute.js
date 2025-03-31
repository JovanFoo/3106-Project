const express = require("express");

const AppointmentRouter = express.Router();

const AppointmentController = require("../controllers/AppointmentController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");
const CustomerController = require("../controllers/CustomerController.js");
const StylistController = require("../controllers/StylistController.js");
// create a new appointment (only a login customer can create an appointment)
AppointmentRouter.post(
  "/",
  AuthMiddleware.authCustomerToken,
  AppointmentController.create
);
// get all appointments of a customer by customer id
AppointmentRouter.get(
  "/",
  AuthMiddleware.authCustomerToken,
  CustomerController.retrieveAppointments
);
// get a appointment by appointment id
AppointmentRouter.get(
  "/:id",
  AuthMiddleware.authAdminCustomerStylistOrManagerToken,
  AppointmentController.retrieve
);

// update appointment status by id (only a login admin/stylist can update their appointment)
AppointmentRouter.put(
  "/:id/status",
  AuthMiddleware.authAdminStylistOrManagerToken,
  AppointmentController.updateStatus
)

// update appointment detail by id (only a login customer / stylist can update their appointment)
AppointmentRouter.put(
  "/:id",
  AuthMiddleware.authAdminCustomerStylistOrManagerToken,
  AppointmentController.update
);
// update appointment completion by appointment id (only a login stylist can update appointment completion)
AppointmentRouter.put(
  "/:id/completed",
  AuthMiddleware.authStylistToken,
  AppointmentController.updateCompleted
);
// delete customer by id (only a login customer can delete their account)
AppointmentRouter.delete(
  "/:id",
  AuthMiddleware.authCustomerToken,
  AppointmentController.delete
);

// get all appointments of a stylist (only login stylist can access this)
AppointmentRouter.get(
  "/stylists/:id",
  AuthMiddleware.authStylistToken,
  StylistController.retrieveAppointments
);

module.exports = AppointmentRouter;

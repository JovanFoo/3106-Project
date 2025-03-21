const express = require("express");

const AppointmentRouter = express.Router();

const AppointmentController = require("../controllers/AppointmentController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");
const CustomerController = require("../controllers/CustomerController.js");
// create a new appointment (only a login customer can create an appointment)
AppointmentRouter.post(
  "/",
  AuthMiddleware.authCustomerToken,
  AppointmentController.create
);
// get a appointment by appointment id
AppointmentRouter.get(
  "/:id",
  AuthMiddleware.authCustomerOrStylistToken,
  AppointmentController.retrieve
);
// get all appointments of a customer by customer id
AppointmentRouter.get(
  "/",
  AuthMiddleware.authCustomerToken,
  CustomerController.retrieveAppointments
);
// update appointment detail by id (only a login customer / stylist can update their appointment)
AppointmentRouter.put(
  "/:id",
  AuthMiddleware.authCustomerOrStylistToken,
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

module.exports = AppointmentRouter;

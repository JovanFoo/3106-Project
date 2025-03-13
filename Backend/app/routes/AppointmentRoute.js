const express = require("express");

const AppointmentRouter = express.Router();

const AppointmentController = require("../controllers/AppointmentController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");
const CustomerController = require("../controllers/CustomerController.js");
// create a new appointment
AppointmentRouter.post(
  "/",
  AuthMiddleware.authCustomerToken,
  AppointmentController.create
);
// get customer by id
AppointmentRouter.get(
  "/:id",
  AuthMiddleware.authCustomerOrStylistToken,
  AppointmentController.retrieve
);
// get customer by id
AppointmentRouter.get(
  "/",
  AuthMiddleware.authCustomerToken,
  CustomerController.retrieveAppointments
);
// update customer by id
AppointmentRouter.put(
  "/:id",
  AuthMiddleware.authCustomerOrStylistToken,
  AppointmentController.update
);
AppointmentRouter.put(
  "/:id/completed",
  AuthMiddleware.authStylistToken,
  AppointmentController.updateCompleted
);
// delete customer by id (only a login customer can delete their account)
// AppointmentRouter.delete(
//   "/",
//   AuthMiddleware.authCustomerToken,
//   CustomerController.delete
// );
// get appointments of a customer by id
// AppointmentRouter.get(
//   "/:id/appointments",
//   AuthMiddleware.authCustomerOrStylistToken,
//   CustomerController.retrieveAppointments
// );

module.exports = AppointmentRouter;

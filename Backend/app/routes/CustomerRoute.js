const express = require("express");

const CustomerRouter = express.Router();

const CustomerController = require("../controllers/CustomerController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");
// const Customer = require("../models/Customer.js");

// get customer by id
CustomerRouter.get(
  "/:id",
  AuthMiddleware.authCustomerToken,
  CustomerController.retrieve
);

// get customer by username
CustomerRouter.get(
  "/username/:username",
  AuthMiddleware.authCustomerToken,
  CustomerController.retrieveByUsername
);

// get customer by username
CustomerRouter.get(
  "/email/:email",
  AuthMiddleware.authCustomerToken,
  CustomerController.retrieveByEmail
);

// update customer by id
CustomerRouter.put(
  "/:id",
  AuthMiddleware.authCustomerToken,
  CustomerController.update
);

// delete customer by id (only a login customer can delete their account)
CustomerRouter.delete(
  "/",
  AuthMiddleware.authCustomerToken,
  CustomerController.delete
);

// get appointments of a customer by id
CustomerRouter.get(
  "/:id/appointments",
  AuthMiddleware.authCustomerOrStylistToken,
  CustomerController.retrieveAppointments
);

CustomerRouter.get(
  "/:id/appointmentsalldetails",
  AuthMiddleware.authCustomerOrStylistToken,
  CustomerController.retrieveAppointmentsalldetails
);

CustomerRouter.put(
  "/profilePicture",
  AuthMiddleware.authCustomerToken,
  CustomerController.updateProfilePicture
);

CustomerRouter.put(
  "/:id/updatepassword",
  AuthMiddleware.authCustomerToken,
  CustomerController.updatePassword
);

module.exports = CustomerRouter;

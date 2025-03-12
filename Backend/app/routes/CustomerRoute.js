const express = require("express");

const CustomerRouter = express.Router();

const CustomerController = require("../controllers/CustomerController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");

CustomerRouter.get(
  "/:id",
  AuthMiddleware.authCustomerToken,
  CustomerController.retrieve
);

CustomerRouter.put(
  "/:id",
  AuthMiddleware.authCustomerToken,
  CustomerController.update
);

module.exports = CustomerRouter;

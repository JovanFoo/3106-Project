const express = require("express");

const AuthRouter = express.Router();

const AuthController = require("../controllers/AuthController.js");
const { authCustomerResetToken } = require("../middlewares/AuthMiddleware.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");
const CustomerController = require("../controllers/CustomerController.js");

AuthRouter.post("/customers/register", AuthController.registerCustomer);

AuthRouter.post("/customers/login", AuthController.loginCustomer);

// customer reset password request
AuthRouter.post(
  "/customers/reset-password",
  AuthController.resetCustomerPassword
);

// customer reset password token verification
AuthRouter.post(
  "/customers/reseting-password",
  AuthMiddleware.authCustomerResetingToken,
  CustomerController.updatePassword
);

module.exports = AuthRouter;

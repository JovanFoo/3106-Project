const express = require("express");

const AuthRouter = express.Router();

const AuthMiddleware = require( "../middlewares/AuthMiddleware.js" );

const AuthController = require("../controllers/AuthController.js");
const CustomerController = require("../controllers/CustomerController.js");
const StylistController = require( "../controllers/StylistController.js" );
const AdminController = require( "../controllers/AdminController.js" );

// customer 
AuthRouter.post(
  "/customers/register", 
  AuthController.registerCustomer
);
AuthRouter.post(
  "/customers/login", 
  AuthController.loginCustomer
);
AuthRouter.post(
  "/customers/forget-password",
  AuthController.resetCustomerPassword
);
AuthRouter.post(
  "/customers/reset-password/:token",
  AuthMiddleware.authCustomerResetToken,
  CustomerController.updatePassword
);

// Stylist 
AuthRouter.post(
  "/stylists/register", 
  AuthController.registerStylist
);
AuthRouter.post(
  "/stylists/login", 
  AuthController.loginStylist
);
AuthRouter.post(
  "/stylists/forget-password",
  AuthController.resetStylistPassword
);
AuthRouter.post(
  "/stylists/reset-password/:token",
  AuthMiddleware.authStylistResetToken,
  StylistController.updatePassword
);
// Admin 
AuthRouter.post(
  "/admins/register", 
  AuthMiddleware.authAdminToken,
  AuthController.registerCustomer
);
AuthRouter.post(
  "/admins/login", 
  AuthController.loginCustomer
);
AuthRouter.post(
  "/admins/forget-password",
  AuthController.resetCustomerPassword
);
AuthRouter.post(
  "/admins/reset-password/:token",
  AuthMiddleware.authAdminResetToken,
  AdminController.updatePassword
);
module.exports = AuthRouter;

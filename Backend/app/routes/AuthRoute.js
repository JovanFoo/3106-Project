const express = require("express");

const AuthRouter = express.Router();

const AuthController = require("../controllers/AuthController.js");

AuthRouter.post("/customers/register", AuthController.registerCustomer);

AuthRouter.post("/customers/login", AuthController.loginCustomer);

module.exports = AuthRouter;

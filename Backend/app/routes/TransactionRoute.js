const express = require("express");

const TransactionRouter = express.Router();

const TransactionController = require("../controllers/TransactionController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");

// Create a new transaction (only a logged-in storeManager/admin can create a transaction)
TransactionRouter.post(
  "/",
  AuthMiddleware.authAdminOrStylistManagerToken,
  TransactionController.create
);

// Retrieve a transaction by transaction ID
TransactionRouter.get(
  "/:id",
  AuthMiddleware.authAdminOrStylistManagerToken,
  TransactionController.retrieve
);

// Delete a transaction by ID (only a logged-in storeManager/admin can delete their transaction)
TransactionRouter.delete(
  "/:id",
  AuthMiddleware.authAdminOrStylistManagerToken,
  TransactionController.delete
);

// Retrieve all transactions (only a logged-in storeManager/admin can retrieve all transactions)
TransactionRouter.get(
  "/",
  AuthMiddleware.authAdminOrStylistManagerToken,
  TransactionController.list
);

// Update a transaction by ID (only a logged-in storeManager/admin can update their transaction)
TransactionRouter.put(
  "/:id",
  AuthMiddleware.authAdminOrStylistManagerToken,
  TransactionController.update
);

// Create a transaction record when an appointment is marked as Completed.
TransactionRouter.post(
  "/from-appointment/:id",
  AuthMiddleware.authStylistToken,
  TransactionController.createTransactionFromAppointment
);

module.exports = TransactionRouter;

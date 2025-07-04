const express = require("express");
const BranchRouter = express.Router();

const BranchController = require("../controllers/BranchController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");

// CRUD operations for branches
// All operations are protected by authentication middleware
// Assign stylist to branch will be handled by the stylist manager in team route

// Create a new branch (Auth: admin)
BranchRouter.post("/", AuthMiddleware.authAdminToken, BranchController.create);

// Retrieve all stylists in a branch of the specify manager (Auth: stylist manager)
BranchRouter.get(
  "/stylists",
  AuthMiddleware.authStylistManagerToken,
  BranchController.retrieveStylists
);

// Retrieve all branches of a specify stylist (Auth: stylist manager)
BranchRouter.get(
  "/shops",
  AuthMiddleware.authStylistManagerToken,
  BranchController.retrieveBranchesByStylist
);

BranchRouter.put(
  "/assign/:id",
  AuthMiddleware.authAdminToken,
  BranchController.addStylist
);

BranchRouter.put(
  "/remove/:id",
  AuthMiddleware.authAdminToken,
  BranchController.removeStylist
);

BranchRouter.put(
  "/assign/manager/:id",
  AuthMiddleware.authAdminToken,
  BranchController.changeManager
);

BranchRouter.put(
  "/add/stylist/:id",
  AuthMiddleware.authAdminToken,
  BranchController.assignStylistToBranch
);

// Get all branches (Auth: admin and customer)
BranchRouter.get(
  "/",
  AuthMiddleware.authAdminCustomerStylistOrManagerToken,
  BranchController.retrieveAll
);

// Retrieve branch by location
BranchRouter.get(
  "/location/:location",
  AuthMiddleware.authCustomerOrStylistToken, // main thing is for customer (reviews function)
  BranchController.retrieveByBranchLocation
);

// Get a branch by ID (Auth: admin)
BranchRouter.get(
  "/:id",
  AuthMiddleware.authAdminToken,
  BranchController.retrieve
);

// Update branch details (Auth: admin)
BranchRouter.put(
  "/:id",
  AuthMiddleware.authAdminOrStylistManagerToken,
  BranchController.update
);

// Delete a branch (Auth: admin)
BranchRouter.delete(
  "/:id",
  AuthMiddleware.authAdminToken,
  BranchController.delete
);

// Retrieve all stylists in a branch (Auth: customer)
BranchRouter.get(
  "/:id/stylists",
  AuthMiddleware.authCustomerToken,
  BranchController.retrieveStylistsForBranch
);

module.exports = BranchRouter;

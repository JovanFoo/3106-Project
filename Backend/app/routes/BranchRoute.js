const express = require("express");
const BranchRouter = express.Router();

const BranchController = require("../controllers/BranchController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");

// Create a new branch (Auth: admin)
BranchRouter.post(
  "/",
  AuthMiddleware.authAdminToken,
  BranchController.create
);

// Get all branches (Auth: admin)
BranchRouter.get("/", AuthMiddleware.authAdminToken,BranchController.retrieveAll);

// Get a branch by ID (Auth: admin)
BranchRouter.get("/:id",AuthMiddleware.authAdminToken , BranchController.retrieve);

// Update branch details (Auth: admin)
BranchRouter.put(
  "/:id",
  AuthMiddleware.authStylistManagerToken,
  BranchController.update
);

// Delete a branch (Auth: admin)
BranchRouter.delete(
  "/:id",
  AuthMiddleware.authStylistManagerToken,
  BranchController.delete
);

// Get all stylists in a branch (Auth: stylist manager)
BranchRouter.get(
  "/stylists",
  AuthMiddleware.authStylistManagerToken,
  BranchController.retrieveStylists
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

module.exports = BranchRouter;

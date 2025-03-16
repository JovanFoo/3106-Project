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

// Get all branches (Auth: anyone)
BranchRouter.get("/", BranchController.retrieveAll);

// Get a branch by ID (Auth: Anyone)
BranchRouter.get("/:id", BranchController.retrieve);

// Update branch details (Auth: admin)
BranchRouter.put(
  "/:id",
  AuthMiddleware.authAdminToken,
  BranchController.update
);

// Delete a branch (Auth: admin)
BranchRouter.delete(
  "/:id",
  AuthMiddleware.authAdminToken,
  BranchController.delete
);

module.exports = BranchRouter;

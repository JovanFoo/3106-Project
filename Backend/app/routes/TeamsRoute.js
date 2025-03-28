const express = require("express");

const TeamRouter = express.Router();

const TeamController = require("../controllers/TeamsController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");

// Get all team members
TeamRouter.get(
    "/",
    AuthMiddleware.authCustomerStylistOrManagerToken,
    TeamController.list
);

// Add stylist to team (only admin or branch manager)
TeamRouter.post(
    "/",
    AuthMiddleware.authCustomerStylistOrManagerToken,
    TeamController.create
);

// Remove stylist from team by stylist ID (only admin or branch manager)
TeamRouter.delete(
    "/:id",
    AuthMiddleware.authCustomerStylistOrManagerToken,
    TeamController.delete
);

module.exports = TeamRouter;

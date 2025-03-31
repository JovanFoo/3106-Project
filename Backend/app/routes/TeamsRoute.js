const express = require("express");

const TeamRouter = express.Router();

const TeamController = require("../controllers/TeamsController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");

// Get all team members
TeamRouter.get(
    "/",
    AuthMiddleware.authAdminStylistOrManagerToken,
    TeamController.list
);

// Add stylist to team (only admin or branch manager)
TeamRouter.post(
    "/",
    AuthMiddleware.authAdminStylistOrManagerToken,
    TeamController.create
);

// Remove stylist from team by stylist ID (only admin or branch manager)
TeamRouter.delete(
    "/:id",
    AuthMiddleware.authAdminStylistOrManagerToken,
    TeamController.delete
);

module.exports = TeamRouter;

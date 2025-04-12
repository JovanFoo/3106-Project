const express = require("express");

const TeamRouter = express.Router();

const TeamController = require("../controllers/TeamsController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");

// Get all team members
TeamRouter.get(
  "/",
  AuthMiddleware.authAdminOrStylistManagerToken,
  TeamController.getAllTeamMembers
);

// Add a new team member (stylist) (only branch manager)
/*
 * Request body:
 * {
 *   "stylistId": "stylistId"
 * }
 */
TeamRouter.post(
  "/",
  AuthMiddleware.authStylistManagerToken,
  TeamController.addANewTeamMember
);

// Remove stylist from team by stylist ID (only branch manager)
/*
 * Request body:
 * {
 *   "stylistId": "stylistId"
 * }
 */
TeamRouter.delete(
  "/",
  AuthMiddleware.authStylistManagerToken,
  TeamController.removeATeamMember
);

module.exports = TeamRouter;

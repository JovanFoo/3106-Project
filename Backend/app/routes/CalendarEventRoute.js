const express = require("express");
const CalendarEventRouter = express.Router();
const CalendarEventController = require("../controllers/CalendarEventController");
const authMiddleware = require("../middlewares/AuthMiddleware");

CalendarEventRouter.get(
  "/my-events",
  authMiddleware.authStylistToken,
  CalendarEventController.getStylistsCalendarEvent
);

module.exports = CalendarEventRouter;

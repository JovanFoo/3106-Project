const express = require("express");
const router = express.Router();
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const leaveController = require("../controllers/leaveController");

// Get leave balance for current year
router.get(
    "/balance",
    AuthMiddleware.authStylistToken,
    leaveController.getLeaveBalance
);

// Get leave history
router.get(
    "/history",
    AuthMiddleware.authStylistToken,
    leaveController.getLeaveHistory
);

// Get stylist's leave requests
router.get(
    "/requests",
    AuthMiddleware.authStylistToken,
    leaveController.getStylistLeaveRequests
);

// Apply for leave
router.post(
    "/apply",
    AuthMiddleware.authStylistToken,
    leaveController.applyForLeave
);

// Withdraw leave request
router.put(
    "/withdraw/:requestId",
    AuthMiddleware.authStylistToken,
    leaveController.withdrawLeaveRequest
);

module.exports = router; 
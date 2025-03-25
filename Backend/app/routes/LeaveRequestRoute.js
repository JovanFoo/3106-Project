const express = require( 'express' );

const LeaveRequestRouter = express.Router();

const LeaveRequestController = require( '../controllers/LeaveRequestController.js' );
const AuthMiddleware = require( '../middlewares/AuthMiddleware.js' );

// Create a new leave request (Auth: stylist)
LeaveRequestRouter.post(
  "/",
  AuthMiddleware.authStylistToken,
  LeaveRequestController.createLeaveRequest
);
LeaveRequestRouter.get(
  "/my-leave-requests",
  AuthMiddleware.authStylistToken,
  LeaveRequestController.getMyLeaveRequests
);
LeaveRequestRouter.put(
    "/:id",
    AuthMiddleware.authStylistToken,
    LeaveRequestController.update
)

LeaveRequestRouter.get(
  "/",
  AuthMiddleware.authStylistManagerToken,
  LeaveRequestController.getAllLeaveRequests
);
LeaveRequestRouter.get(
  "/pending",
  AuthMiddleware.authStylistManagerToken,
  LeaveRequestController.getAllPendingLeaveRequests
);
// Approve or reject leave request (Auth: stylist manager)
LeaveRequestRouter.post(
  "/approve/:leaveRequestId",
  AuthMiddleware.authStylistManagerToken,
  LeaveRequestController.approveLeaveRequest
);
LeaveRequestRouter.post(
  "/reject/:leaveRequestId",
  AuthMiddleware.authStylistManagerToken,
  LeaveRequestController.rejectLeaveRequest
);

module.exports = LeaveRequestRouter;
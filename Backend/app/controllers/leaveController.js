const Leave = require("../models/Leave");
const LeaveRequest = require("../models/LeaveRequest");
const { differenceInDays } = require('date-fns');

exports.getLeaveBalance = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        let leave = await Leave.findOne({ 
            stylist: req.userId,
            year: currentYear
        });

        // If no leave record exists for current year, create one
        if (!leave) {
            leave = await Leave.create({
                stylist: req.userId,
                year: currentYear
            });
        }

        res.status(200).json({
            success: true,
            data: {
                totalLeave: leave.totalLeave,
                usedLeave: leave.usedLeave,
                availableLeave: leave.availableLeave
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Error fetching leave balance"
        });
    }
};

exports.getLeaveHistory = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const leave = await Leave.findOne({ 
            stylist: req.userId,
            year: currentYear
        }).populate({
            path: 'leaveHistory.leaveRequestId',
            select: 'startDate endDate status reason response'
        });

        if (!leave) {
            return res.status(404).json({
                success: false,
                error: "Leave record not found"
            });
        }

        res.status(200).json({
            success: true,
            data: leave.leaveHistory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Error fetching leave history"
        });
    }
};

exports.applyForLeave = async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.body;
        const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
        const currentYear = new Date().getFullYear();

        // Get leave balance
        let leave = await Leave.findOne({ 
            stylist: req.userId,
            year: currentYear
        });

        // Check if enough leave days are available
        if (days > leave.availableLeave) {
            return res.status(400).json({
                success: false,
                error: "Not enough leave days available"
            });
        }

        // Create leave request
        const leaveRequest = await LeaveRequest.create({
            stylist: req.userId,
            startDate,
            endDate,
            reason
        });

        res.status(201).json({
            success: true,
            data: leaveRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Error applying for leave"
        });
    }
};

exports.withdrawLeaveRequest = async (req, res) => {
    try {
        const leaveRequest = await LeaveRequest.findOne({
            _id: req.params.requestId,
            stylist: req.userId,
            status: "Pending"
        });

        if (!leaveRequest) {
            return res.status(404).json({
                success: false,
                error: "Leave request not found or cannot be withdrawn"
            });
        }

        leaveRequest.status = "Withdrawn";
        await leaveRequest.save();

        res.status(200).json({
            success: true,
            data: leaveRequest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Error withdrawing leave request"
        });
    }
};

exports.getStylistLeaveRequests = async (req, res) => {
    try {
        const leaveRequests = await LeaveRequest.find({
            stylist: req.userId
        }).sort({ createdAt: -1 }); // Most recent first

        res.status(200).json({
            success: true,
            data: leaveRequests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Error fetching leave requests"
        });
    }
}; 
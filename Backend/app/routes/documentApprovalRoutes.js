const express = require('express');
const router = express.Router();
const documentApprovalController = require('../controllers/documentApprovalController');
const { protect, authorize } = require('../middlewares/auth');

// Get all document approvals for an employee
router.get('/employee/:employeeId', protect, documentApprovalController.getDocumentApprovals);

// Get pending document approvals for managers
router.get('/pending', protect, authorize('manager', 'admin'), documentApprovalController.getPendingApprovals);

// Create a new document approval request
router.post('/', protect, documentApprovalController.createDocumentApproval);

// Approve a document
router.put('/:approvalId/approve', protect, authorize('manager', 'admin'), documentApprovalController.approveDocument);

// Reject a document
router.put('/:approvalId/reject', protect, authorize('manager', 'admin'), documentApprovalController.rejectDocument);

module.exports = router; 
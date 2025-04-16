const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const documentApprovalController = require('../controllers/documentApprovalController');

// Get all document approvals for an employee
router.get('/employee/:employeeId', AuthMiddleware.authStylistToken, documentApprovalController.getDocumentApprovals);

// Get pending document approvals for managers
router.get('/pending', AuthMiddleware.authStylistManagerToken, documentApprovalController.getPendingApprovals);

// Create a new document approval request
router.post('/', AuthMiddleware.authStylistToken, documentApprovalController.createDocumentApproval);

// Approve a document
router.put('/:approvalId/approve', AuthMiddleware.authStylistManagerToken, documentApprovalController.approveDocument);

// Reject a document
router.put('/:approvalId/reject', AuthMiddleware.authStylistManagerToken, documentApprovalController.rejectDocument);

module.exports = router; 
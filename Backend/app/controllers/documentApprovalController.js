const DocumentApproval = require('../models/DocumentApproval');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// Get all document approvals for an employee
exports.getDocumentApprovals = async (req, res) => {
    try {
        const documentApprovals = await DocumentApproval.find({ employeeId: req.params.employeeId })
            .populate('employeeId', 'name email')
            .populate('approvedBy', 'name email')
            .populate('leaveId', 'leaveType startDate endDate');
        
        res.status(200).json({
            success: true,
            data: documentApprovals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching document approvals'
        });
    }
};

// Get pending document approvals for managers
exports.getPendingApprovals = async (req, res) => {
    try {
        const pendingApprovals = await DocumentApproval.find({ status: 'PENDING' })
            .populate('employeeId', 'name email')
            .populate('leaveId', 'leaveType startDate endDate');
        
        res.status(200).json({
            success: true,
            data: pendingApprovals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching pending approvals'
        });
    }
};

// Create a new document approval request
exports.createDocumentApproval = async (req, res) => {
    try {
        const { employeeId, leaveId, documentType, documentUrl } = req.body;

        // Verify leave exists and belongs to employee
        const leave = await Leave.findOne({ _id: leaveId, employeeId });
        if (!leave) {
            return res.status(404).json({
                success: false,
                error: 'Leave not found'
            });
        }

        const documentApproval = await DocumentApproval.create({
            employeeId,
            leaveId,
            documentType,
            documentUrl
        });

        res.status(201).json({
            success: true,
            data: documentApproval
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error creating document approval'
        });
    }
};

// Approve a document
exports.approveDocument = async (req, res) => {
    try {
        const { approvalId } = req.params;
        const { approvedBy } = req.body;

        const documentApproval = await DocumentApproval.findById(approvalId);
        if (!documentApproval) {
            return res.status(404).json({
                success: false,
                error: 'Document approval not found'
            });
        }

        if (documentApproval.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: 'Document has already been processed'
            });
        }

        documentApproval.status = 'APPROVED';
        documentApproval.approvedBy = approvedBy;
        documentApproval.approvalDate = Date.now();
        await documentApproval.save();

        res.status(200).json({
            success: true,
            data: documentApproval
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error approving document'
        });
    }
};

// Reject a document
exports.rejectDocument = async (req, res) => {
    try {
        const { approvalId } = req.params;
        const { approvedBy, rejectionReason } = req.body;

        const documentApproval = await DocumentApproval.findById(approvalId);
        if (!documentApproval) {
            return res.status(404).json({
                success: false,
                error: 'Document approval not found'
            });
        }

        if (documentApproval.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                error: 'Document has already been processed'
            });
        }

        documentApproval.status = 'REJECTED';
        documentApproval.approvedBy = approvedBy;
        documentApproval.approvalDate = Date.now();
        documentApproval.rejectionReason = rejectionReason;
        await documentApproval.save();

        res.status(200).json({
            success: true,
            data: documentApproval
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error rejecting document'
        });
    }
}; 
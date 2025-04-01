const mongoose = require('mongoose');

const documentApprovalSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stylist',
        required: true
    },
    leaveId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LeaveRequest',
        required: true
    },
    documentType: {
        type: String,
        required: true,
        enum: ['MEDICAL_CERTIFICATE', 'OTHER_DOCUMENT']
    },
    documentUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stylist'
    },
    approvalDate: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
documentApprovalSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const DocumentApproval = mongoose.model('DocumentApproval', documentApprovalSchema);

module.exports = DocumentApproval; 
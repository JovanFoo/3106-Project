const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leaveSchema = new Schema({
    stylist: {
        type: Schema.Types.ObjectId,
        ref: "Stylist",
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    totalPaidLeave: {
        type: Number,
        default: 30, // Default annual paid leave days
    },
    totalUnpaidLeave: {
        type: Number,
        default: 20, // Default annual unpaid leave days
    },
    usedPaidLeave: {
        type: Number,
        default: 0,
    },
    usedUnpaidLeave: {
        type: Number,
        default: 0,
    },
    leaveHistory: [{
        leaveRequestId: {
            type: Schema.Types.ObjectId,
            ref: "LeaveRequest"
        },
        type: {
            type: String,
            enum: ["paid", "unpaid"],
            required: true
        },
        days: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
});

// Virtual fields for available leave
leaveSchema.virtual('availablePaidLeave').get(function() {
    return this.totalPaidLeave - this.usedPaidLeave;
});

leaveSchema.virtual('availableUnpaidLeave').get(function() {
    return this.totalUnpaidLeave - this.usedUnpaidLeave;
});

// Method to update leave balance when a leave request is approved
leaveSchema.methods.updateLeaveBalance = async function(leaveRequestId, type, days) {
    if (type === "paid") {
        this.usedPaidLeave += days;
    } else {
        this.usedUnpaidLeave += days;
    }

    this.leaveHistory.push({
        leaveRequestId,
        type,
        days
    });

    await this.save();
};

const Leave = mongoose.model("Leave", leaveSchema);
module.exports = Leave; 
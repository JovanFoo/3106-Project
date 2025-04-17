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
    totalLeave: {
        type: Number,
        default: 30, // Default annual leave days
    },
    usedLeave: {
        type: Number,
        default: 0,
    },
    leaveHistory: [{
        leaveRequestId: {
            type: Schema.Types.ObjectId,
            ref: "LeaveRequest"
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

// Virtual field for available leave
leaveSchema.virtual('availableLeave').get(function() {
    return this.totalLeave - this.usedLeave;
});

// Method to update leave balance when a leave request is approved
leaveSchema.methods.updateLeaveBalance = async function(leaveRequestId, days) {
    this.usedLeave += days;

    this.leaveHistory.push({
        leaveRequestId,
        days
    });

    await this.save();
};

const Leave = mongoose.model("Leave", leaveSchema);
module.exports = Leave; 
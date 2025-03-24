const mongose = require("mongoose");
const Schema = mongose.Schema;

const leaveRequestSchema = new Schema({
    stylist: {
        type: Schema.Types.ObjectId,
        ref: "Stylist",
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        default: "Pending",
    },
    reason: {
        type: String,
        required: true,
    },
    response: {
        type: String,
    },
    responseDate: {
        type: Date,
    },
    approveBy: {
        type: Schema.Types.ObjectId,
        ref: "Stylist",
    },
});

const LeaveRequest = mongose.model("LeaveRequest", leaveRequestSchema);
module.exports = LeaveRequest;

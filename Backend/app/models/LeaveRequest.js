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
    type: {
        type: String,
        enum: ["Paid", "Unpaid"],
        required: true,
        //default: "Paid"
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
    approvedBy: {
        type: Schema.Types.ObjectId,
        ref: "Stylist",
    },
    image: {
        type: String,  // This will store the base64 encoded image
        required: false
    }
});

const LeaveRequest = mongose.model("LeaveRequest", leaveRequestSchema);
module.exports = LeaveRequest;

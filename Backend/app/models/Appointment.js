const mongose = require("mongoose");
const Schema = mongose.Schema;

const appointmentSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  request: {
    type: String,
    default: "No request",
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  pointsUsed: {
    type: Number,
  },

  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
    default: "Pending",
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: "Service",
  },
  review: {
    type: Schema.Types.ObjectId,
    ref: "Review",
  },
  stylist: {
    type: Schema.Types.ObjectId,
    ref: "Stylist",
  },
  branch: {
    type: Schema.Types.ObjectId,
    ref: "Branch",
  },
});

const Appointment = mongose.model("Appointment", appointmentSchema);
module.exports = Appointment;

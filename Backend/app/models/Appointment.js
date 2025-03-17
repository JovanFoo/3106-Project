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
  isCompleted: {
    type: Boolean,
    default: false,
  },
  services: [
    {
      type: Schema.Types.ObjectId,
      ref: "Service",
    },
  ],
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

const Appointment = mongose.model("Appointment", appointmentSchema);
module.exports = Appointment;

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
  service: [
    {
      type: Schema.Types.ObjectId,
      ref: "Service",
    },
  ],
});

const Appointment = mongose.model("Appointment", appointmentSchema);
module.exports = Appointment;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const branchSchema = new Schema({
  location: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  weekdayOpeningTime: {
    type: String,
    required: true,
  },
  weekdayClosingTime: {
    type: String,
    required: true,
  },
  weekendOpeningTime: {
    type: String,
    required: true,
  },
  weekendClosingTime: {
    type: String,
    required: true,
  },
  holidayOpeningTime: {
    type: String,
    required: true,
  },
  holidayClosingTime: {
    type: String,
    required: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  appointments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],
  manager: {
    type: Schema.Types.ObjectId,
    ref: "Stylist",
    required: true,
  },
  stylists: [
    {
      type: Schema.Types.ObjectId,
      ref: "Stylist",
    },
  ],
});

const Branch = mongoose.model("Branch", branchSchema);
module.exports = Branch;

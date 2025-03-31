const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceRateSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  rate: {
    type: Number,
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
  isDisabled: {
    type: Boolean,
    default: false,
  },
});

const ServiceRate = mongoose.model("ServiceRate", serviceRateSchema);
module.exports = ServiceRate;

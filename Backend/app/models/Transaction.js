const mongose = require("mongoose");
const Schema = mongose.Schema;

const transactionSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  stylist: {
    type: Schema.Types.ObjectId,
    ref: "Stylist",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
    default: "Pending",
  },
  point: {
    type: Number,
    required: true,
  },
  appointment: {
    type: Schema.Types.ObjectId,
    ref: "Appointment",
    default: null,
  },
});

const Transaction = mongose.model("Transaction", transactionSchema);
module.exports = Transaction;

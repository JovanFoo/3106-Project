const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const branchSchema = new Schema({
  location: {
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
  staffs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Stylist",
    },
  ],
});

const Branch = mongoose.model("Branch", branchSchema);
module.exports = Branch;

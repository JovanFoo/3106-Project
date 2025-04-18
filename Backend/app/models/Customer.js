const mongose = require("mongoose");
const Schema = mongose.Schema;

const customerSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
  },
  appointments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],
});

const Customer = mongose.model("Customer", customerSchema);
module.exports = Customer;

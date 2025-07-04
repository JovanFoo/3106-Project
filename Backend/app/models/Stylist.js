const mongose = require("mongoose");
const Schema = mongose.Schema;

const stylistSchema = new Schema({
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
  },
  phoneNumber: {
    type: Number,
  },
  bio: {
    type: String,
  },
  expertises: [
    {
      type: Schema.Types.ObjectId,
      ref: "Expertise",
    },
  ],
  appointments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],
  stylists: [
    {
      type: Schema.Types.ObjectId,
      ref: "Stylist",
    },
  ],
  leaveRequests: [
    {
      type: Schema.Types.ObjectId,
      ref: "LeaveRequest",
    },
  ],
  galleries: [
    {
      type: Schema.Types.ObjectId,
      ref: "Gallery",
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Stylist = mongose.model("Stylist", stylistSchema);
module.exports = Stylist;

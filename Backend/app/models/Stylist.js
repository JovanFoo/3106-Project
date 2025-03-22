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
  expertise: [
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
  ]
});

const Stylist = mongose.model("Stylist", stylistSchema);
module.exports = Stylist;

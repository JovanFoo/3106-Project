const mongose = require("mongoose");
const Schema = mongose.Schema;

const adminSchema = new Schema({
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
});

const Admin = mongose.model("Admin", adminSchema);
module.exports = Admin;

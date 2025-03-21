const mongose = require("mongoose");
const Schema = mongose.Schema;

const expertiseSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const Expertise = mongose.model("Expertise", expertiseSchema);
module.exports = Expertise;

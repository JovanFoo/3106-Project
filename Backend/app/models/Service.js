const mongose = require("mongoose");
const Promotion = require("./Promotion");
const Schema = mongose.Schema;

const serviceSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  duration: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  Promotion: [
    {
      type: Schema.Types.ObjectId,
      ref: "Promotion",
    },
  ],
});

const Service = mongose.model("Service", serviceSchema);
module.exports = Service;

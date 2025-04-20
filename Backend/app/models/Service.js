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
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  serviceRates: [
    {
      type: Schema.Types.ObjectId,
      ref: "ServiceRate",
    },
  ],
});

const Service = mongose.model("Service", serviceSchema);
module.exports = Service;

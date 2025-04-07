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
  promotion: [
    {
      type: Schema.Types.ObjectId,
      ref: "Promotion",
    },
  ],
  serviceRates: [
    {
      type: Schema.Types.ObjectId,
      ref: "ServiceRate",
    },
  ],
  expertiseRequired: [
    {
      type: Schema.Types.ObjectId,
      ref: "Expertise",
    },
  ],
});

const Service = mongose.model("Service", serviceSchema);
module.exports = Service;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const discountSchema = new Schema({
  points: {
    type: Number,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
});

const Discount = mongoose.model("Discount", discountSchema);
module.exports = Discount;

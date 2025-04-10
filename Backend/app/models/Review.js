const mongose = require("mongoose");
const Schema = mongose.Schema;

const reviewSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  stars: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  modifiedAt: {
    type: Date,
    required: true,
  },
  stylist: {
    type: Schema.Types.ObjectId,
    ref: "Stylist",
  },
  appointment: {
    type: Schema.Types.ObjectId,
    ref: "Appointment",
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
  },
});

const Review = mongose.model("Review", reviewSchema);
module.exports = Review;

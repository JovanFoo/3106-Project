const mongose = require("mongoose");
const Schema = mongose.Schema;

const reviewSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  stars: {
    type: Number,
    required: true,
  },
  stylist: [
    {
      type: Schema.Types.ObjectId,
      ref: "Stylist",
    },
  ],
});

const Review = mongose.model("Review", reviewSchema);
module.exports = Review;

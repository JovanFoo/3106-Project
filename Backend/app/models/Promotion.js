const mongose = require("mongoose");
const Schema = mongose.Schema;

const promotionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  promotionAmount: {
    type: Number,
    required: true,
  },
  isClaimed: {
    type: BigDecimal,
    required: true,
  },
});

const Promotion = mongose.model("Promotion", promotionSchema);
module.exports = Promotion;

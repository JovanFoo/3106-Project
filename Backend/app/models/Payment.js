const mongose = require("mongoose");
const Schema = mongose.Schema;

const paymentSchema = new Schema({
    amount: {
        type: Number,
        required: true,
    },
    appointment: [
        {
            type: Schema.Types.ObjectId,
            ref: "appointment",
        },
    ],
});

const Payment = mongose.model("Payment", paymentSchema);
module.exports = Payment;

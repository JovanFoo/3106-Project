const mongose = require("mongoose");
const Schema = mongose.Schema;

const transactionSchema = new Schema({
    amount: {
        type: Number,
        required: true,
    },
    service: {
        type: String,
        required: true,
    },
    stylist:
    {
        type: Schema.Types.ObjectId,
        ref: "Stylist",
        required: true,
    },
    Date: {
        type: Date,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    point: {
        type: Number,
        required: true,
    },
    appointment: [
        {
            type: Schema.Types.ObjectId,
            ref: "Appointment",
            required: false, // set to false for walk in customers
            default: null,
        },
    ],
});

const Transaction = mongose.model("Transaction", transactionSchema);
module.exports = Transaction;

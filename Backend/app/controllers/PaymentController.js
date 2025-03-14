const Appointment = require("../models/Appointment.js");
const Payment = require("../models/Payment.js");

const PaymentController = {
    // Create a new payment
    async create(req, res) {
        console.log("PaymentController > create");
        const { id } = req.params;
        const { amount } = req.body;
        const appointment = await Appointment.findOne({ _id: id });
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }
        const payment = new Payment({
            amount,
            appointment,
        });
        await payment.save();
        return res.status(201).json(payment);
    },

    // Retrieve a payment by id
    async retrieve(req, res) {
        console.log("PaymentController > retrieve");
        const { id } = req.params;
        const payment = await Payment.findOne({ _id: id });
        console.log(payment);
        if (payment) {
            return res.status(200).json(payment);
        } else {
            return res.status(400).json({ message: "Error retrieving payment" });
        }
    },

    // Delete a payment by id
    async delete(req, res) {
        console.log("PaymentController > delete");
        const { id } = req.params;
        const payment = await Payment.findByIdAndDelete(id);
        if (payment) {
            return res.status(200).json({ message: "Payment deleted successfully" });
        } else {
            return res.status(400).json({ message: "Error deleting payment" });
        }
    },
};
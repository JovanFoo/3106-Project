const Appointment = require("../models/Appointment.js");
const Transaction = require("../models/Transaction.js");

const TransactionController = {
    // Create a new transaction
    async create(req, res) {
        console.log("TransactionController > create");
        const { id } = req.params; // appointment ID
        const { amount, service, status, stylist } = req.body;

        try {
            let appointment = null;

            if (id) {
                const foundAppointment = await Appointment.findById(id);
                if (!foundAppointment) {
                    return res.status(404).json({ message: "Appointment not found" });
                }
            }

            const transaction = new Transaction({
                amount,
                service,
                stylist,
                Date: new Date(),
                paymentMethod: "Cash", // or from req.body
                status,
                point: amount / 10,
                appointment: appointment ? [appointment] : [], // empty array if walk-in
            });

            await transaction.save();
            return res.status(201).json(transaction);
        } catch (error) {
            console.error("Error creating transaction:", error);
            return res.status(500).json({ message: "Failed to create transaction" });
        }
    },

    // Retrieve a transaction by ID
    async retrieve(req, res) {
        console.log("TransactionController > retrieve");
        const { id } = req.params;

        try {
            const transaction = await Transaction.findById(id)
                .populate("stylist", "name")
                .populate("appointment");

            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }

            return res.status(200).json(transaction);
        } catch (error) {
            console.error("Error retrieving transaction:", error);
            return res.status(500).json({ message: "Failed to retrieve transaction" });
        }
    },

    // Delete a transaction by ID
    async delete(req, res) {
        console.log("TransactionController > delete");
        const { id } = req.params;

        try {
            const transaction = await Transaction.findByIdAndDelete(id);

            if (!transaction) {
                return res.status(404).json({ message: "Transaction not found" });
            }

            return res.status(200).json({ message: "Transaction deleted successfully" });
        } catch (error) {
            console.error("Error deleting transaction:", error);
            return res.status(500).json({ message: "Failed to delete transaction" });
        }
    },

    // retrieve all transactions
    async list(req, res) {
        console.log("TransactionController > list");
        try {
            const transactions = await Transaction.find()
                .populate("stylist", "name") // only get stylist name
                .populate("appointment");     // full appointment if exists

            return res.status(200).json(transactions);
        } catch (error) {
            console.error("Error listing transactions:", error);
            return res.status(500).json({ message: "Failed to fetch transactions" });
        }
    },

    // update a transaction by ID
    async update(req, res) {
        console.log("TransactionController > update");
        const { id } = req.params;
        const { amount, service, status, stylist, paymentMethod } = req.body;

        try {
            const updated = await Transaction.findByIdAndUpdate(
                id,
                {
                    amount,
                    service,
                    status,
                    stylist,
                    paymentMethod,
                    point: amount / 10,
                },
                { new: true }
            );

            if (!updated) {
                return res.status(404).json({ message: "Transaction not found" });
            }

            return res.status(200).json(updated);
        } catch (error) {
            console.error("Error updating transaction:", error);
            return res.status(500).json({ message: "Failed to update transaction" });
        }
    },

};
module.exports = TransactionController;

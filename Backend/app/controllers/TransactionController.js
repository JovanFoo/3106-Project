const Appointment = require("../models/Appointment.js");
const Customer = require("../models/Customer.js");
const Transaction = require("../models/Transaction.js");

const TransactionController = {
  // Create a new transaction
  async create(req, res) {
    console.log("TransactionController > create");
    const { id: appointmentId } = req.params; // appointment ID
    const { amount, service, status, stylist, paymentMethod, date } = req.body;

    try {
      let appointment = null; // default to null if walk-in
      if (appointmentId) {
        const foundAppointment = await Appointment.findById(appointmentId);
        if (!foundAppointment) {
          return res.status(404).json({ message: "Appointment not found" });
        }
        appointment = foundAppointment._id; // set appointment ID if exists
      }

      const transaction = new Transaction({
        amount,
        service,
        stylist,
        date: date ? new Date(date) : new Date(), // use provided date or current date
        paymentMethod: paymentMethod, // or from req.body
        status,
        point: amount / 10,
        appointment: appointment,
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
      return res
        .status(500)
        .json({ message: "Failed to retrieve transaction" });
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

      return res
        .status(200)
        .json({ message: "Transaction deleted successfully" });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      return res.status(500).json({ message: "Failed to delete transaction" });
    }
  },

  // retrieve all transactions
  async list(req, res) {
    console.log("TransactionController > list");
    const { page = 1, limit = 10 } = req.query; // default to page 1 and limit 10
    try {
      const transactions = await Transaction.find()
        .populate("stylist", "name") // only get stylist name
        .populate("appointment") // full appointment if exists
        .populate("service", "name"); // only get service name

      const totalTransactions = transactions.length; // total number of transactions
      const totalPages = Math.ceil(totalTransactions / parseInt(limit));
      const startIndex = (page - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      console.log("startIndex", startIndex);
      console.log("endIndex", endIndex);

      const paginatedTransactions = transactions.slice(startIndex, endIndex);
      console.log("paginatedTransactions", paginatedTransactions);
      const pagination = {
        total: totalTransactions,
        page: page,
        limit: limit,
        totalPages: totalPages,
        hasNextPage: endIndex < totalTransactions,
        transactions: paginatedTransactions,
      };
      return res.status(200).json(pagination);
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

  async createTransactionFromAppointment(req, res) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findById(id)
        .populate("service")
        .populate("stylist");

      if (!appointment)
        return res.status(404).json({ message: "Appointment not found" });
      if (appointment.status !== "Completed") {
        return res.status(400).json({ message: "Appointment not completed" });
      }
      const customer = await Customer.findOne({}).where({
        appointments: { $in: appointment },
      });
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      customer.loyaltyPoints += parseFloat(
        (appointment.totalAmount / 10).toFixed(2)
      ); // add loyalty points
      // 1pt for every 10$ spent
      //
      await customer.save(); // save customer with updated points
      const transaction = new Transaction({
        bookingId: appointment._id,
        service: appointment.service._id,
        stylist: appointment.stylist._id,
        paymentMethod: "Cash", // or from frontend later
        amount: appointment.totalAmount,
        point: parseFloat((appointment.totalAmount / 10).toFixed(2)),
        date: new Date(),
        status: "Completed",
      });

      await transaction.save();
      res.json(transaction);
    } catch (err) {
      console.error("Error creating transaction:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
module.exports = TransactionController;

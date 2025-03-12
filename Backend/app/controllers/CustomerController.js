const mongodb = require("./config/database.js");
const Customer = require("../models/Customer.js");
const PasswordHash = require("../utils/passwordHash.js");

const CustomerController = {
  // Retrieve a customer by username
  async retrieve(req, res) {
    console.log("CustomerController > retrieve");
    const { id } = req.params;
    const customer = await Customer.findOne({ _id: id });
    if (customer) {
      customer.password = undefined;
      return res.status(200).json(customer);
    } else {
      return res.status(400).json({ message: "Error retrieving customer" });
    }
  },
  // Update a customer's name email by username
  async update(req, res) {
    console.log("CustomerController > update");
    const { id } = req.params;
    const { name, email, username } = req.body;
    const customer = await Customer.findOne({ _id: id });
    let existingCustomer = await Customer.findOne({ username: username });
    if (existingCustomer) {
      return res.status(400).json({ message: "Username already exists" });
    }
    existingCustomer = await Customer.findOne({ email: email });
    if (existingCustomer) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (!customer) {
      return res.status(400).json({ message: "Error updating user" });
    }
    customer.name = name ? name : customer.name;
    customer.username = username ? username : customer.username;
    customer.email = email ? email : customer.email;
    await customer.save();
    customer.password = undefined;
    return res.status(200).json(customer);
  },
};

module.exports = CustomerController;

const mongodb = require("./config/database.js");
const Customer = require("../models/Customer.js");
const PasswordHash = require("../utils/PasswordHash.js");
const jwt = require("../utils/jwt.js");
const AuthController = {
  async loginCustomer(req, res) {
    console.log("AuthController > login customer");
    const { username, password } = req.body;
    const customer = await Customer.findOne({ username: username });
    if (customer) {
      const isMatch = await PasswordHash.comparePassword(
        password,
        customer.password
      );
      if (isMatch) {
        customer.password = undefined;
        const token = jwt.generateToken(customer._id, "Customer");
        return res.status(200).json({ customer, token });
      }
    }
    return res.status(400).json({ message: "Invalid username or password" });
  },

  async registerCustomer(req, res) {
    console.log("AuthController > register customer");
    const { name, username, email, password } = req.body;
    const hashedPassword = await PasswordHash.hashPassword(password);
    const newCustomer = new Customer({
      name,
      username,
      email,
      password: hashedPassword,
    });

    try {
      let customer = await Customer.findOne({ username: username });
      if (customer) {
        return res.status(400).json({ message: "Username already exists" });
      }
      customer = await Customer.findOne({ email: email });
      if (customer) {
        return res.status(400).json({ message: "Email already exists" });
      }
      await newCustomer.save();
      newCustomer.password = undefined;
      return res.status(201).json(newCustomer);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Error creating user" });
    }
  },
};

module.exports = AuthController;

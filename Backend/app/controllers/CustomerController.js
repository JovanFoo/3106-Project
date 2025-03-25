const mongodb = require("./config/database.js");
const Customer = require("../models/Customer.js");
const PasswordHash = require("../utils/passwordHash.js");
const jwt = require("../utils/jwt.js");
const Stylist = require("../models/Stylist.js");
const Service = require("../models/Service.js");

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
    if (
      existingCustomer &&
      customer._id.toHexString() !== existingCustomer._id.toHexString()
    ) {
      console.log(
        "existingCustomer._id != customer._id",
        existingCustomer._id,
        customer._id
      );
      return res.status(400).json({ message: "Username already exists" });
    }
    existingCustomer = await Customer.findOne({ email: email });
    if (
      existingCustomer &&
      customer._id.toHexString() !== existingCustomer._id.toHexString()
    ) {
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
  // Delete a customer by username
  async delete(req, res) {
    console.log("CustomerController > delete");
    const { id } = req.userId;
    const customer = await Customer.findByIdAndDelete(id);
    if (customer) {
      return res.status(200).json({ message: "Customer deleted successfully" });
    } else {
      return res.status(400).json({ message: "Error deleting customer" });
    }
  },

  async retrieveAppointments(req, res) {
    console.log("CustomerController > retrieveAppointments");
    const id = req.userId;
    const customer = await Customer.findOne({ _id: id }).populate(
      "appointments"
    );
    const appointments = await Promise.all(
      customer.appointments.map(async (appt) => {
        const service = await Service.findOne({ _id: appt.service });
        const stylist = await Stylist.findOne({ _id: appt.stylist });

        return {
          ...appt.toObject(), // convert to plain JSON, to append serviceName and stylistName
          serviceName: service ? service.name : "Unknown",
          stylistName: stylist ? stylist.name : "Unknown",
        };
      })
    );
    const temp = await Customer.findOne({ _id: id });
    console.log(temp, id);
    if (customer) {
      return res.status(200).json(appointments);
    } else {
      return res.status(400).json({ message: "Error retrieving appointments" });
    }
  },

  async updateProfilePicture(req, res) {
    console.log("CustomerController > updateProfilePicture");
    const { id } = req.userId;
    const { profilePicture } = req.body;
    const customer = await Customer.findOne({ _id: id });
    if (!customer) {
      return res.status(400).json({ message: "Error updating user" });
    }

    customer.profilePicture = profilePicture
      ? profilePicture
      : customer.profilePicture;
    // TO DO: use cloudinary to upload image
    await customer.save();
    return res.status(200).json(customer);
  },

  async updatePassword(req, res) {
    console.log("CustomerController > updatePassword");
    const id = req.userId;

    const { password, confirmPassword, token } = req.body;
    const customer = await Customer.findOne({ _id: id });
    if (!customer) {
      return res.redirect("/unsuccessful-update", {
        backUrl: `${process.env.CLIENT_URL}/reset-password/${token}`,
      });
    }
    if (password !== confirmPassword) {
      return res.redirect("/unsuccessful-update", {
        backUrl: `${process.env.CLIENT_URL}/reset-password/${token}`,
      });
    }
    customer.password = await PasswordHash.hashPassword(password);
    await customer.save();
    jwt.addToBlackList(req.params.token);
    res.redirect("/success-update");
  },
};

module.exports = CustomerController;

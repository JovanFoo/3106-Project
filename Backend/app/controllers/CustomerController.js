const mongodb = require("./config/database.js");
const Customer = require("../models/Customer.js");
const PasswordHash = require("../utils/passwordHash.js");
const jwt = require("../utils/jwt.js");

const CustomerController = {
  // Retrieve a customer by ID
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

  // Retrieve customer by username
  async retrieveByUsername(req, res) {
    console.log("CustomerController > retrieveByUsername");

    const { username } = req.params; // Get the username from the URL params

    try {
      const customer = await Customer.findOne({ username: username });

      if (customer) {
        customer.password = undefined; // Ensure password is not sent back in response
        return res.status(200).json(customer);
      } else {
        return res
          .status(404)
          .json({ message: "Customer with this username not found" });
      }
    } catch (error) {
      console.error("Error retrieving customer by username:", error);
      return res
        .status(500)
        .json({ message: "Error retrieving customer", error: error.message });
    }
  },

  // Retrieve customer by email
  async retrieveByEmail(req, res) {
    console.log("CustomerController > retrieveByEmail");

    const { email } = req.params; // Get the email from the URL params

    try {
      const customer = await Customer.findOne({ email: email });

      if (customer) {
        customer.password = undefined; // Ensure password is not sent back in response
        return res.status(200).json(customer);
      } else {
        return res
          .status(404)
          .json({ message: "Customer with this email not found" });
      }
    } catch (error) {
      console.error("Error retrieving customer by email:", error);
      return res
        .status(500)
        .json({ message: "Error retrieving customer", error: error.message });
    }
  },

  // Update a customer's name email
  async update(req, res) {
    console.log("CustomerController > update");
    const { id } = req.params;
    const { name, email, username, profilePicture, loyaltyPoints } = req.body;
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
    console.log(loyaltyPoints);
    customer.loyaltyPoints = loyaltyPoints
      ? loyaltyPoints
      : customer.loyaltyPoints;
    customer.profilePicture = profilePicture
      ? profilePicture
      : customer.profilePicture;
    await customer.save();
    customer.password = undefined;
    return res.status(200).json(customer);
  },
  // Delete a customer by ID
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
    const temp = await Customer.findOne({ _id: id });
    console.log(temp, id);
    if (customer) {
      return res.status(200).json(customer.appointments);
    } else {
      return res.status(400).json({ message: "Error retrieving appointments" });
    }
  },

  async retrieveAppointmentsalldetails(req, res) {
    console.log("CustomerController > retrieveAppointments");
    const id = req.userId;
    const customer = await Customer.findOne({ _id: id }).populate({
      path: "appointments",
      populate: [
        { path: "service" },
        { path: "review" },
        { path: "stylist" },
        { path: "branch" },
      ],
    });

    const temp = await Customer.findOne({ _id: id });
    console.log(temp, id);
    if (customer) {
      return res.status(200).json(customer.appointments);
    } else {
      return res.status(400).json({ message: "Error retrieving appointments" });
    }
  },

  async updatePassword(req, res) {
    console.log("custcontdoller > updatePassword");
    const id = req.userId;

    const { password, confirmPassword, token } = req.body;
    const customer = await Customer.findOne({ _id: id });
    if (!customer) {
      console.log("cust nt fd");
      return res.render("unsuccessful-update", {
        backUrl: `${process.env.CLIENT_URL}/reset-password/${token}`,
      });
    }
    if (password !== confirmPassword) {
      console.log("password no match");
      return res.render("unsuccessful-update", {
        backUrl: `${process.env.CLIENT_URL}/reset-password/${token}`,
      });
    }
    customer.password = await PasswordHash.hashPassword(password);

    await customer.save();
    console.log("successs");
    return res.status(200).json({ message: "password changes suucessfully" });
  },

  async updateProfilePicture(req, res) {
    console.log("custcolleter > updateProfilePicture");
    const id = req.userId;
    const { profilePicture } = req.body;
    try {
      // console.log( "id", id );
      // console.log( "profilePicture", profilePicture );
      const cust = await Customer.updateOne(
        { _id: id },
        { profilePicture: profilePicture }
      );
      if (!cust) {
        return res
          .status(400)
          .json({ message: "Error updating stylist profile picture" });
      }
      const newcust = await Customer.findOne({ _id: id });
      // stylist.profilePicture = profilePicture
      //   ? profilePicture
      //   : stylist.profilePicture || "";
      // TO DO: use cloudinary to upload image
      // await stylist.save();
      return res.status(200).json(newcust);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },
};

module.exports = CustomerController;

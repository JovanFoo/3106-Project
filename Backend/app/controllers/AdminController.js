const mongodb = require("./config/database.js");
const Admin = require("../models/Admin.js");
const PasswordHash = require("../utils/passwordHash.js");
const jwt = require("../utils/jwt.js");

const AdminController = {
  async initaliseAdmin() {
    console.log("AdminController > initaliseAdmin");
    const admin = new Admin({
      name: "Admin",
      username: "admin",
      email: "salonflow123@gmail.com",
    });
    admin.password = await PasswordHash.hashPassword("admin");
    if (await Admin.findOne({ username: "admin" })) {
      return;
    }
    await admin.save();
  },

  // Retrieve a admin by username
  async retrieve(req, res) {
    console.log("AdminController > retrieve");
    const { id } = req.params;
    const admin = await Admin.findOne({ _id: id });
    if (admin) {
      admin.password = undefined;
      return res.status(200).json(admin);
    } else {
      return res.status(400).json({ message: "Error retrieving admin" });
    }
  },
  // Update a admin's name email by username
  async update(req, res) {
    console.log("AdminController > update");
    const id = req.userId;
    const { name, email, username } = req.body;
    const admin = await Admin.findOne({ _id: id });
    let existingAdmin = await Admin.findOne({ username: username });
    if (
      existingAdmin &&
      admin._id.toHexString() !== existingAdmin._id.toHexString()
    ) {
      console.log(
        "existingAdmin._id != admin._id",
        existingAdmin._id,
        admin._id
      );
      return res.status(400).json({ message: "Username already exists" });
    }
    existingAdmin = await Admin.findOne({ email: email });
    if (
      existingAdmin &&
      admin._id.toHexString() !== existingAdmin._id.toHexString()
    ) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (!admin) {
      return res.status(400).json({ message: "Error updating user" });
    }
    admin.name = name ? name : admin.name;
    admin.username = username ? username : admin.username;
    admin.email = email ? email : admin.email;
    await admin.save();
    admin.password = undefined;
    return res.status(200).json(admin);
  },
  // Delete a admin by username
  async delete(req, res) {
    console.log("AdminController > delete");
    const id = req.userId;
    const admin = await Admin.findByIdAndDelete(id);
    if (admin) {
      return res.status(200).json({ message: "Admin deleted successfully" });
    } else {
      return res.status(400).json({ message: "Error deleting admin" });
    }
  },

  async updateProfilePicture(req, res) {
    console.log("AdminController > updateProfilePicture");
    const id = req.userId;
    const { profilePicture } = req.body;
    const admin = await Admin.findOne({ _id: id });
    if (!admin) {
      return res.status(400).json({ message: "Error updating user" });
    }

    admin.profilePicture = profilePicture
      ? profilePicture
      : admin.profilePicture;
    // TO DO: use cloudinary to upload image
    await admin.save();
    return res.status(200).json(admin);
  },

  async updatePassword(req, res) {
    console.log("AdminController > updatePassword");
    const id = req.userId;

    const { password, confirmPassword, token } = req.body;
    const admin = await Admin.findOne({ _id: id });
    if (!admin) {
      return res.redirect("/unsuccessful-update", {
        backUrl: `${process.env.CLIENT_URL}/reset-password/${token}`,
      });
    }
    if (password !== confirmPassword) {
      return res.redirect("/unsuccessful-update", {
        backUrl: `${process.env.CLIENT_URL}/reset-password/${token}`,
      });
    }
    admin.password = await PasswordHash.hashPassword(password);
    await admin.save();
    jwt.addToBlackList(req.params.token);
    res.redirect("/success-update");
  },
};

module.exports = AdminController;

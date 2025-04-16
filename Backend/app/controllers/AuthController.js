const mongodb = require("./config/database.js");
// Models
const Customer = require("../models/Customer.js");
const Stylist = require("../models/Stylist.js");
const Admin = require("../models/Admin.js");
// Utils
const PasswordHash = require("../utils/passwordHash.js");
const jwt = require("../utils/jwt.js");
const { resetPassword } = require("../utils/emailService.js");

const AuthController = {
  async refreshToken(req, res) {
    console.log("AuthController > refresh token");
    const { token } = req.body;
    const decoded = jwt.decodeToken(token);
    if (!decoded.status) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const newToken = jwt.refreshToken(token);
    return res.status(200).json({ token: newToken });
  },
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
        const tokens = jwt.generateCustomerToken(customer._id);
        return res.status(200).json({ customer, tokens: tokens });
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
      profilePicture: "",
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
      console.log("Registered customer:");
      console.log(newCustomer);

      const tokens = jwt.generateCustomerToken(newCustomer._id);

      return res.status(201).json({ customer: newCustomer, tokens: tokens });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Error creating user" });
    }
  },

  async resetCustomerPassword(req, res) {
    console.log("AuthController > reset customer password");
    const { email } = req.body;
    const customer = await Customer.findOne({ email: email });
    if (customer) {
      const result = await resetPassword(
        email,
        customer.name,
        jwt.generateCustomerResetToken(customer._id)
      );
      console.log(result);
      if (!result) {
        return res.status(400).json({ message: "Error sending email" });
      }
      return res.status(200).json({ message: "Reset password email sent" });
    } else {
      return res.status(404).json({ message: "Email not found" });
    }
  },

  async loginStylist(req, res) {
    console.log("AuthController > login stylist");
    const { username, password } = req.body;
    const stylist = await Stylist.findOne({ username: username }).where(
      "isActive",
      true
    );
    if (stylist) {
      const isMatch = await PasswordHash.comparePassword(
        password,
        stylist.password
      );
      if (isMatch) {
        stylist.password = undefined;
        if (stylist.stylists.length > 0) {
          const token = jwt.generateStylistManagerToken(stylist._id);
          return res.status(200).json({ stylist, tokens: token });
        } else {
          const token = jwt.generateStylistToken(stylist._id);
          return res.status(200).json({ stylist, tokens: token });
        }
      }
    }
    return res
      .status(400)
      .json({ message: "Invalid username or password or is disabled" });
  },

  async registerStylist(req, res) {
    console.log("AuthController > register stylist");
    const { name, username, email, password } = req.body;
    const hashedPassword = await PasswordHash.hashPassword(password);
    const newStylist = new Stylist({
      name,
      username,
      email,
      password: hashedPassword,
    });

    try {
      let stylist = await Stylist.findOne({ username: username });
      if (stylist) {
        return res.status(400).json({ message: "Username already exists" });
      }
      stylist = await Stylist.findOne({ email: email });
      if (stylist) {
        return res.status(400).json({ message: "Email already exists" });
      }
      await newStylist.save();
      newStylist.password = undefined;
      return res.status(201).json(newStylist);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Error creating stylist" });
    }
  },

  async resetStylistPassword(req, res) {
    console.log("AuthController > reset stylist password");
    const { email } = req.body;
    const stylist = await Stylist.findOne({ email: email });
    if (stylist) {
      const result = await resetPassword(
        email,
        stylist.name,
        jwt.generateStylistResetToken(stylist._id)
      );
      if (!result) {
        return res.status(400).json({ message: "Error sending email" });
      }
      return res.status(200).json({ message: "Reset password email sent" });
    } else {
      return res.status(404).json({ message: "Email not found" });
    }
  },

  async loginAdmin(req, res) {
    console.log("AuthController > login admin");
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: username });
    if (admin) {
      const isMatch = await PasswordHash.comparePassword(
        password,
        admin.password
      );
      if (isMatch) {
        admin.password = undefined;
        const token = jwt.generateAdminToken(admin._id);
        return res.status(200).json({ admin, tokens: token });
      }
    }
    return res.status(400).json({ message: "Invalid username or password" });
  },

  async registerAdmin(req, res) {
    console.log("AuthController > register admin");
    const { name, username, email, password } = req.body;
    const hashedPassword = await PasswordHash.hashPassword(password);
    const newAdmin = new Admin({
      name,
      username,
      email,
      password: hashedPassword,
    });

    try {
      let admin = await Admin.findOne({ username: username });
      if (admin) {
        return res.status(400).json({ message: "Username already exists" });
      }
      admin = await Admin.findOne({ email: email });
      if (admin) {
        return res.status(400).json({ message: "Email already exists" });
      }
      await newAdmin.save();
      newAdmin.password = undefined;
      return res.status(201).json(newAdmin);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Error creating admin" });
    }
  },

  async resetAdminPassword(req, res) {
    console.log("AuthController > reset admin password");
    const { email } = req.body;
    const admin = await Admin.findOne({ email: email });
    if (admin) {
      const result = await resetPassword(
        email,
        admin.name,
        jwt.generateAdminResetToken(admin._id)
      );
      if (!result) {
        return res.status(400).json({ message: "Error sending email" });
      }
      return res.status(200).json({ message: "Reset password email sent" });
    } else {
      return res.status(404).json({ message: "Email not found" });
    }
  },

  async updatePasswordStylist(req, res) {
    console.log("AuthController > update password");
    const { currentPassword, newPassword } = req.body;
    const id = req.userId;
    const stylist = await Stylist.findOne({ _id: id });
    if (!stylist) {
      res.status(404).json({ message: "Stylist not found" });
    }
    const isMatch = await PasswordHash.comparePassword(
      currentPassword,
      stylist.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password" });
    }
    stylist.password = await PasswordHash.hashPassword(newPassword);
    await stylist.save();
    return res.status(200).json({ message: "Password updated" });
  },
  async updatePasswordAdmin(req, res) {
    console.log("AuthController > update password");
    const { currentPassword, newPassword } = req.body;
    const id = req.userId;
    const admin = await Admin.findOne({ _id: id });
    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
    }
    const isMatch = await PasswordHash.comparePassword(
      currentPassword,
      admin.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password" });
    }
    admin.password = await PasswordHash.hashPassword(newPassword);
    await admin.save();
    return res.status(200).json({ message: "Password updated" });
  },
};

module.exports = AuthController;

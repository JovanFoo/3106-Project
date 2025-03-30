const mongodb = require("./config/database.js");
const Stylist = require("../models/Stylist.js");
const PasswordHash = require("../utils/passwordHash.js");
const Expertise = require("../models/Expertise.js");

const StylistController = {
  // Retrieve a stylist by id
  async retrieveById(req, res) {
    console.log("StylistController > retrieve by ID");
    const { id } = req.params;
    const stylist = await Stylist.findOne({ _id: id });
    if (stylist) {
      stylist.password = undefined;
      return res.status(200).json(stylist);
    } else {
      return res
        .status(400)
        .json({ message: "Error retrieving stylist by ID" });
    }
  },
  // Retrieve a stylist by username
  async retrieve(req, res) {
    console.log("StylistController > retrieve by Username");
    const { username } = req.params;
    const stylist = await Stylist.findOne({ username: username });
    if (stylist) {
      stylist.password = undefined;
      return res.status(200).json(stylist);
    } else {
      return res
        .status(400)
        .json({ message: "Error retrieving stylist by Username" });
    }
  },
  // Retrieve a list of all stylists
  async retrieveAllStylists(req, res) {
    console.log("StylistController > retrieve all stylists");
    const stylists = await Stylist.find({}); // get all stylists
    stylists.map((stylist) => {
      stylist.password = undefined; // remove password from response
    });
    if (stylists) {
      return res.status(200).json(stylists);
    } else {
      return res
        .status(400)
        .json({ message: "Error retrieving list of stylists" });
    }
  },
  // Update a stylist's expertise
  async updateExpertises(req, res) {
    console.log("StylistController > updateExpertises");
    const id = req.userId;
    console.log("id", id);
    const { expertises } = req.body;
    const stylist = await Stylist.findOne({ _id: id });
    if (!stylist) {
      return res
        .status(400)
        .json({ message: "Error updating stylist expertises" });
    }
    expertises.map(async (expertiseId) => {
      console.log("expertiseId", expertiseId);
      return await Expertise.findOne({ _id: expertiseId });
    });
    stylist.expertises = expertises;
    await stylist.save();
    stylist.password = undefined;
    return res.status(200).json(stylist);
  },
  // Update a stylist's name, email by username
  async update(req, res) {
    console.log("StylistController > update");
    const { id } = req.params;
    const { name, email, username, bio, phoneNumber } = req.body;
    const stylist = await Stylist.findById(id);
    let existingStylist = await Stylist.findOne({ username: username });
    if (
      existingStylist &&
      stylist._id.toHexString() !== existingStylist._id.toHexString()
    ) {
      console.log(
        "existingStylist._id != customer._id",
        existingStylist._id,
        stylist._id
      );
      return res.status(400).json({ message: "Username already exists" });
    }
    existingStylist = await Stylist.findOne({ email: email });
    if (
      existingStylist &&
      stylist._id.toHexString() !== existingStylist._id.toHexString()
    ) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (!stylist) {
      return res.status(400).json({ message: "Error updating user" });
    }
    stylist.name = name ? name : stylist.name;
    stylist.username = username ? username : stylist.username;
    stylist.email = email ? email : stylist.email;
    stylist.bio = bio ? bio : stylist.bio || "";
    stylist.phoneNumber = phoneNumber ? phoneNumber : stylist.phoneNumber || "";
    await stylist.save();
    stylist.password = undefined;
    return res.status(200).json(stylist);
  },

  // Delete a stylist by username
  async delete(req, res) {
    console.log("StylistController > delete");
    const { id } = req.userId;
    const stylist = await Stylist.findByIdAndDelete(id);
    if (stylist) {
      return res.status(200).json({ message: "Stylist deleted successfully" });
    } else {
      return res.status(400).json({ message: "Error deleting customer" });
    }
  },

  // stylist has a list of appointments, similar to customer
  // Retrieve all stylist's appointments by id
  async retrieveAppointments(req, res) {
    console.log("StylistController > retrieveAppointments");
    const id = req.userId;
    const stylist = await Stylist.findOne({ _id: id }).populate("appointments");
    const temp = await Stylist.findOne({ _id: id });
    console.log(temp, id);
    if (stylist) {
      return res.status(200).json(stylist.appointments);
    } else {
      return res.status(400).json({ message: "Error retrieving appointments" });
    }
  },

  async updateProfilePicture(req, res) {
    console.log("StylistController > updateProfilePicture");
    const id = req.userId;
    const { profilePicture } = req.body;
    try {
      // console.log( "id", id );
      // console.log( "profilePicture", profilePicture );
      const stylist = await Stylist.updateOne(
        { _id: id },
        { profilePicture: profilePicture }
      );
      if (!stylist) {
        return res
          .status(400)
          .json({ message: "Error updating stylist profile picture" });
      }
      const newStylist = await Stylist.findOne({ _id: id });
      // stylist.profilePicture = profilePicture
      //   ? profilePicture
      //   : stylist.profilePicture || "";
      // TO DO: use cloudinary to upload image
      // await stylist.save();
      return res.status(200).json(newStylist);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  },

  async updatePassword(req, res) {
    console.log("StylistController > updatePassword");
    const id = req.userId;

    const { password, confirmPassword, token } = req.body;
    const stylist = await Stylist.findOne({ _id: id });
    if (!stylist) {
      return res.render("unsuccessful-update", {
        backUrl: `${process.env.CLIENT_URL}/reset-password/${token}`,
      });
    }
    if (password !== confirmPassword) {
      return res.render("unsuccessful-update", {
        backUrl: `${process.env.CLIENT_URL}/reset-password/${token}`,
      });
    }
    stylist.password = await PasswordHash.hashPassword(password);
    await stylist.save();
    return res.render("success-update");
  },

  // Retrieve all stylists (only admin can retrieve)
  async retrieveAll(req, res) {
    console.log("StylistController > retrieveAll");
    const stylists = await Stylist.find({});
    if (stylists) {
      return res.status(200).json(stylists);
    } else {
      return res.status(400).json({ message: "Error retrieving stylists" });
    }
  },
};

module.exports = StylistController;

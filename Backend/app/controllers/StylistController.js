const mongodb = require("./config/database.js");
const Stylist = require("../models/Stylist.js");
const PasswordHash = require("../utils/passwordHash.js");
const Expertise = require("../models/Expertise.js");
const Customer = require("../models/Customer.js");
const Service = require("../models/Service.js");
const Branch = require("../models/Branch.js");
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
    const stylistId = req.userId;

    try {
      // 1. Get stylist with appointments populated with service
      const stylist = await Stylist.findOne({ _id: stylistId }).populate({
        path: "appointments",
        populate: { path: "service" },
      });
      console.log("Stylist appointments:", stylist.appointments);

      if (!stylist) {
        return res.status(404).json({ message: "Stylist not found" });
      }

      const results = [];

      // 2. For each appointment, find the customer who has it
      for (const appt of stylist.appointments) {
        const customer = await Customer.findOne({
          appointments: appt._id,
        }).lean(); // lean() for better performance

        console.log("Processing appt:", appt._id.toString());
        console.log("Matched customer:", customer?.name);
        customer.password = undefined;

        results.push({
          id: appt._id.toString(),
          customer: customer,
          date: appt.date,
          request: appt.request,
          service: appt.service || "Service",
          image: customer?.profilePicture || "/images/default-avatar.jpg",
          status: appt.status || "Pending",
        });
      }

      return res.status(200).json(results);
    } catch (err) {
      console.error("Error in retrieveAppointments:", err);
      return res.status(500).json({ message: "Internal server error" });
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
  // Retrieve all stylists with pagination (only admin can retrieve)
  async retrieveAllWithPagination(req, res) {
    console.log("StylistController > retrieveAllWithPagination");
    const { page = 1, limit = 10 } = req.query;
    const stylists = await Stylist.find({});

    const totalStylists = stylists.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedstylists = stylists.slice(startIndex, endIndex);
    const paginated = {
      total: totalStylists,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalStylists / limit),
      hasNextPage: endIndex < totalStylists,
      stylists: paginatedstylists,
    };
    if (paginatedstylists) {
      return res.status(200).json(paginated);
    } else {
      return res.status(400).json({ message: "Error retrieving stylists" });
    }
  },

  async retrieveMyAppointments(req, res) {
    console.log("StylistController > retrieveMyAppointments");
    const stylistId = req.userId;
    const stylist = await Stylist.findOne({ _id: stylistId }).populate(
      "appointments"
    );
    if (!stylist) {
      return res.status(400).json({ message: "Error retrieving appointments" });
    }
    const appointments = stylist.appointments;
    const returnedAppointments = [];
    for (let i = 0; i < appointments.length; i++) {
      const customer = await Customer.findOne({}).where({
        appointments: appointments[i]._id,
      });
      if (!customer) {
        return res.status(400).json({ message: "Error retrieving customer" });
      }
      const serviceId = appointments[i].service;
      const service = await Service.findOne({ _id: serviceId });
      let addedDuration = 0;
      if (service) {
        addedDuration = service.duration;
      }
      const endDate = new Date(
        appointments[i].date + addedDuration * 60 * 1000
      );
      customer.password = undefined;
      appointments[i].customer = customer;
      returnedAppointments.push({
        _id: appointments[i]._id,
        customer: customer,
        startDate: appointments[i].date,
        endDate: endDate,
        request: appointments[i].request,
        totalAmount: appointments[i].totalAmount,
        isCompleted: appointments[i].isCompleted,
        review: appointments[i].review,
      });
    }
    console.log("appointments", returnedAppointments);
    if (stylist) {
      return res.status(200).json(returnedAppointments);
    } else {
      return res.status(400).json({ message: "Error retrieving appointments" });
    }
  },

  async toggleActive(req, res) {
    console.log("StylistController > toggleActive");
    const { id } = req.params;
    const stylist = await Stylist.findById(id);
    if (!stylist) {
      return res.status(400).json({ message: "Error updating stylist" });
    }
    stylist.isActive = !stylist.isActive;
    await stylist.save();
    return res.status(200).json(stylist);
  },
  async createStylistWithBranch(req, res) {
    console.log("StylistController > createStylistWithBranch");
    const { name, username, email, password, branch, phoneNumber, role } =
      req.body;
    const hashedPassword = await PasswordHash.hashPassword(password);
    const stylist = new Stylist({
      name,
      username,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    const branchFromId = await Branch.findOne({ _id: branch });
    if (!branchFromId) {
      return res.status(400).json({ message: "Error creating stylist" });
    }
    let existingStylist = await Stylist.findOne({ username: username });
    if (existingStylist) {
      return res.status(400).json({ message: "Username already exists" });
    }
    existingStylist = await Stylist.findOne({ email: email });
    if (existingStylist) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const manager = await Stylist.findOne({ _id: branchFromId.manager });
    if (!manager) {
      return res.status(400).json({ message: "Error creating stylist" });
    }
    branchFromId.stylists.push(stylist._id); //addming new stylist to branch
    if (role === "Manager") {
      const managerStylists = manager.stylists;
      manager.stylists = [];
      stylist.stylists = managerStylists;
      branchFromId.manager = stylist._id;
    } else {
      manager.stylists.push(stylist._id); //adding new stylist to manager
    }
    await branchFromId.save();
    await manager.save();
    await stylist.save();
    if (stylist) {
      stylist.password = undefined;
      return res.status(200).json(stylist);
    } else {
      return res.status(400).json({ message: "Error creating stylist" });
    }
  },
};

module.exports = StylistController;

const mongodb = require("./config/database.js");
const Stylist = require("../models/Stylist.js");
const PasswordHash = require("../utils/passwordHash.js");
const Expertise = require("../models/Expertise.js");
const Customer = require("../models/Customer.js");
const Service = require("../models/Service.js");
const Branch = require("../models/Branch.js");
const Appointment = require("../models/Appointment.js");
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
  // Retrieve stylist by name (not unique)
  async retrieveStylistsByName(req, res) {
    console.log("StylistController > retrieveByName");
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({ message: "Missing name query parameter" });
    }

    try {
      const stylists = await Stylist.find({
        name: { $regex: new RegExp(name, "i") }, // case-insensitive match
      });

      if (stylists.length === 0) {
        return res
          .status(404)
          .json({ message: "No stylists found matching the name" });
      }

      res.status(200).json(stylists);
    } catch (err) {
      console.error("Error in retrieveByName:", err);
      res.status(500).json({ message: "Internal server error" });
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
          service: appt.service?.name || "Service",
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
  async getStylistAvailabilityByDateAndService(req, res) {
    console.log("StylistController > getStylistAvailabilityByDateAndService");
    const { id } = req.params;
    const { branchId, serviceId, month, year, day } = req.query;
    const date = new Date(year, month - 1, day);
    date.setHours(date.getHours() + 8); //set to SGT
    console.log(date);

    function parseTime(timeStr, date) {
      let [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) {
        hours += 12;
      } else if (modifier === "AM" && hours === 12) {
        hours = 0;
      }

      let now = new Date(date);
      now.setUTCHours(now.getUTCHours() + 8); // SGT
      // console.log(`before set hours: ${now}`)
      now.setHours(hours, minutes, 0, 0);
      // console.log(`after set hours: ${now}`)

      return now;
    }

    // Get service duration
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    const serviceDuration = service.duration;

    // Salon Branch Operating Hours
    const branch = await Branch.findById(branchId);
    const selectedDate = new Date(date);
    const isWeekday =
      selectedDate.getDay() >= 1 || selectedDate.getDay() <= 6 ? true : false;
    const branchOpenTime = isWeekday
      ? parseTime(branch.weekdayOpeningTime, date)
      : parseTime(branch.weekendOpeningTime, date);
    const branchCloseTime = isWeekday
      ? parseTime(branch.weekdayClosingTime, date)
      : parseTime(branch.weekendClosingTime, date);

    const slotInterval = serviceDuration; // minutes between slots

    // Get stylist's appointments for the day, according to branch opening and closing times
    const appointments = await Appointment.find({
      stylist: id,
      date: {
        $gte: branchOpenTime,
        $lte: branchCloseTime,
      },
      status: { $in: ["Pending", "Confirmed"] }, // Only consider "active" appointments
    }).sort({ date: 1 });
    // console.log(`branch OT: ${branchOpenTime}`)
    console.log(appointments);

    // Generate all possible time slots for the day
    const allSlots = [];
    let currentTime = branchOpenTime;
    while (currentTime.getHours() < branchCloseTime.getHours()) {
      allSlots.push(new Date(currentTime));
      currentTime = new Date(currentTime.getTime() + slotInterval * 60000);
    }

    // Mark occupied slots
    const occupiedSlots = [];
    for (const appointment of appointments) {
      const appointmentStart = appointment.date;
      const appointmentServiceId = appointment.service;
      const service = await Service.findById(appointmentServiceId);
      const appointmentEnd = new Date(
        appointmentStart.getTime() + service.duration * 60000
      );

      // Mark all slots that overlap with this appointment
      for (const slot of allSlots) {
        const slotEnd = new Date(slot.getTime() + service.duration * 60000);
        if (
          (slot >= appointmentStart && slot < appointmentEnd) ||
          (slotEnd > appointmentStart && slotEnd <= appointmentEnd) ||
          (slot <= appointmentStart && slotEnd >= appointmentEnd)
        ) {
          occupiedSlots.push(slot);
        }
      }
    }
    // console.log(occupiedSlots);

    // Filter out occupied slots and slots that don't have enough time before closing
    const availableSlots = allSlots.filter((slot) => {
      // Check if slot is occupied
      const isOccupied = occupiedSlots.some(
        (occupied) => occupied.getTime() === slot.getTime()
      );
      // Check if there's enough time before closing
      const slotEnd = new Date(slot.getTime() + serviceDuration * 60000);
      const isBeforeClosing =
        slotEnd.getHours() <= branchCloseTime.getHours() || // up till closing time
        (slotEnd.getHours() === branchCloseTime.getHours() &&
          slotEnd.getMinutes() === 0);

      return !isOccupied && isBeforeClosing;
    });
    // console.log(availableSlots);

    // Format the available slots for response
    const formattedSlots = availableSlots.map((slot) => {
      const displayStartTime = slot.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const displayEndTime = new Date(
        slot.getTime() + serviceDuration * 60000
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        startTime: slot.toISOString(),
        endTime: new Date(
          slot.getTime() + serviceDuration * 60000
        ).toISOString(),
        displayTime: `${displayStartTime} - ${displayEndTime}`,
      };
    });

    if (formattedSlots) {
      return res.status(200).json({ timeSlots: formattedSlots });
    } else {
      return res.status(400).json({
        message:
          "Error retrieving available time slots for stylist, service and branch",
      });
    }
  },
};

module.exports = StylistController;

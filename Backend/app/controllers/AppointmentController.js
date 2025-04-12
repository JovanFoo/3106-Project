const mongodb = require("./config/database.js");
const Customer = require("../models/Customer.js");
const Appointment = require("../models/Appointment.js");
const PasswordHash = require("../utils/passwordHash.js");
const CustomerController = require("./CustomerController.js");
const StylistController = require("./StylistController.js");
const Stylist = require("../models/Stylist.js");
const Service = require("../models/Service.js");

const AppointmentController = {
  // Create a new appointment
  async create(req, res) {
    console.log("AppointmentController > create");
    const id = req.userId;
    let {
      date,
      request,
      totalAmount,
      serviceId,
      stylistId,
      branchId,
      pointsUsed,
    } = req.body;
    // const modDate = new Date(date);
    // modDate.setUTCHours(modDate.getUTCHours() + 8); // set to SGT
    totalAmount = parseFloat(totalAmount);
    try {
      const appointment = new Appointment({
        date: date,
        request,
        totalAmount,
        pointsUsed,
        service: serviceId,
        stylist: stylistId,
        branch: branchId,
      });
      const newAppointment = await appointment.save();
      const customer = await Customer.findById(id);
      customer.appointments.push(newAppointment);
      await customer.save();
      // TODO: add relationship to stylist also. stylist has a list of appts
      const stylist = await Stylist.findById(stylistId);
      stylist.appointments.push(newAppointment);
      await stylist.save();

      if (!customer) {
        return res.status(400).json({ message: "Error creating appointment" });
      }
      return res.status(201).json(appointment);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: error.message });
    }
  },
  // Retrieve a appointment by id
  async retrieve(req, res) {
    console.log("AppointmentController > retrieve");
    const { id } = req.params;
    const appointment = await Appointment.findOne({ _id: id });
    console.log(appointment);
    if (appointment) {
      return res.status(200).json(appointment);
    } else {
      return res.status(400).json({ message: "Error retrieving appointment" });
    }
  },
  // Update a appointment's date request by id
  async update(req, res) {
    console.log("AppointmentController > update");
    const { id } = req.params;
    const { date, request, totalAmount, pointsUsed } = req.body;
    const appointment = await Appointment.findOne({ _id: id });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    appointment.date = date ? new Date(date) : appointment.date;
    appointment.request = request ? request : appointment.request;
    appointment.pointsUsed = pointsUsed ? pointsUsed : appointment.pointsUsed;
    appointment.totalAmount = totalAmount
      ? parseFloat(totalAmount)
      : appointment.totalAmount;

    await appointment.save();
    return res.status(200).json(appointment);
  },
  // Delete an appointment by appointment id only if the customer can delete
  async delete(req, res) {
    console.log("AppointmentController > delete");
    const customerId = req.userId;
    const appointmentId = req.params.id;
    const currentAppt = await Appointment.findOne({ _id: appointmentId });
    const stylistId = currentAppt.stylist;

    const customer = await Customer.findOne({ _id: customerId });
    // Remove appointment from customer
    customer.appointments = customer.appointments.filter((appointment) => {
      return appointment._id.toString() !== appointmentId;
    });
    await customer.save();
    // Remove appointment from stylist
    const stylist = await Stylist.findOne({ _id: stylistId });
    stylist.appointments = stylist.appointments.filter((appointment) => {
      return appointment._id.toString() !== appointmentId;
    });
    await stylist.save();
    // Delete the appointment
    const appointment = await Appointment.findByIdAndDelete(appointmentId);

    if (customer && appointment && stylist) {
      return res
        .status(204)
        .json({ message: "Appointment deleted successfully" });
    } else {
      return res.status(400).json({ message: "Error deleting appointment" });
    }
  },
  // Update a appointment's isCompleted by id
  async updateCompleted(req, res) {
    console.log("AppointmentController > update");
    const { id } = req.params;
    const appointment = await Appointment.findOne({ _id: id });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    appointment.isCompleted = true;
    await appointment.save();
    return res.status(200).json(appointment);
  },
  // Update a appointment's status to cancelled by id
  async updateCancelled(req, res) {
    console.log("AppointmentController > update cancelled");
    const { id } = req.params;
    const appointment = await Appointment.findOne({ _id: id });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    appointment.status = "Cancelled";
    await appointment.save();
    return res.status(200).json(appointment);
  },

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const updated = await Appointment.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!updated)
        return res.status(404).json({ message: "Appointment not found" });

      res.json(updated);
    } catch (err) {
      console.error("Error updating appointment:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = AppointmentController;

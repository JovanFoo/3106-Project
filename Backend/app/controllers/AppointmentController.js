const mongodb = require("./config/database.js");
const Customer = require("../models/Customer.js");
const Appointment = require("../models/Appointment.js");
const PasswordHash = require("../utils/passwordHash.js");
const CustomerController = require("./CustomerController.js");
const StylistController = require("./StylistController.js");
const Stylist = require("../models/Stylist.js");

const AppointmentController = {
  // Create a new appointment
  async create(req, res) {
    console.log("AppointmentController > create");
    const id = req.userId;
    let { date, request, totalAmount, service, stylistId } = req.body;
    date = new Date(date);
    totalAmount = parseFloat(totalAmount);
    try {
      const appointment = new Appointment({
        date,
        request,
        totalAmount,
        service,
        stylist: stylistId
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
    const { date, request, totalAmount } = req.body;
    const appointment = await Appointment.findOne({ _id: id });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    appointment.date = date ? new Date(date) : appointment.date;
    appointment.request = request ? request : appointment.request;
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
    const customer = await Customer.findOne({ _id: customerId });
    customer.appointments.filter((appointment) => {
      return appointment._id !== appointmentId;
    });
    await customer.save();
    const appointment = await Appointment.findByIdAndDelete(appointmentId);

    if (customer && appointment) {
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
};

module.exports = AppointmentController;

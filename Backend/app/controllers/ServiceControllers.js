const mongodb = require("./config/database.js");
const Service = require("../models/Customer.js");
const PasswordHash = require("../utils/passwordHash.js");

const ServiceController = {
  // Create a new appointment
  async create(req, res) {
    console.log("serviceController > create");
    const id = req.userId;
    let { date, request, totalAmount, service } = req.body;
    date = new Date(date);
    totalAmount = parseFloat(totalAmount);
    try {
      const service = new Service({
        name,
        duration,
        description,
      });
      const svc = await service.save();
      if (!svc) {
        return res.status(400).json({ message: "Error creating svc" });
      }
      return res.status(201).json(svc);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: error.message });
    }
  },
  // Retrieve a svc by id
  async retrieve(req, res) {
    console.log("svccontroller > retrieve");
    const { id } = req.params;
    const service = await Service.findOne({ _id: id });
    console.log(service);
    if (service) {
      return res.status(200).json(service);
    } else {
      return res.status(400).json({ message: "Error retrieving appointment" });
    }
  },
  // Update a svc's date request by id
  async update(req, res) {
    //console.log("AppointmentController > update");
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
  // Delete a service by id
  async delete(req, res) {
    console.log("svccontroller > delete");
    const { id } = req.customerId;
    const appointment = await Service.findByIdAndDelete(id);

    if (appointment) {
      return res
        .status(204)
        .json({ message: "Appointment deleted successfully" });
    } else {
      return res.status(400).json({ message: "Error deleting appointment" });
    }
  },

  //   async updateCompleted(req, res) {
  //     console.log("AppointmentController > update");
  //     const { id } = req.params;
  //     const appointment = await Appointment.findOne({ _id: id });
  //     if (!appointment) {
  //       return res.status(404).json({ message: "Appointment not found" });
  //     }
  //     appointment.isCompleted = true;
  //     await appointment.save();
  //     return res.status(200).json(appointment);
  //   },
};

module.exports = ServiceController;

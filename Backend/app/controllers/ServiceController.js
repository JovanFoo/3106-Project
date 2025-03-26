const mongodb = require("./config/database.js");
const Service = require("../models/Service.js");

const ServiceController = {
  // Create a new service
  async create(req, res) {
    console.log("serviceController > create");

    let { name, duration, description } = req.body;

    try {
      const newService = new Service({
        name,
        duration,
        description,
      });

      const savedService = await newService.save();
      if (!savedService) {
        return res.status(400).json({ message: "Error creating service" });
      }
      return res.status(201).json(savedService);
    } catch (error) {
      console.error(error.message);
      return res.status(400).json({ message: error.message });
    }
  },

  // Retrieve a service by ID
  async retrieve(req, res) {
    console.log("svccontroller > retrieve");
    const { id } = req.params;

    try {
      const service = await Service.findOne({ _id: id });
      if (service) {
        return res.status(200).json(service);
      } else {
        return res.status(404).json({ message: "Service not found" });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Error retrieving service" });
    }
  },

  // Retrieve a list of all services provided
  async retrieveAll(req, res) {
    console.log("svccontroller > retrieve all svcs");
    try {
      const services = await Service.find();
      if (services) {
        return res.status(200).json(services);
      } else {
        return res.status(404).json({message: "No services found"});
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Error retrieving all services" });
    }
  },
  // Update a service by ID
  async update(req, res) {
    console.log("serviceController > update");
    const { id } = req.params;
    const { name, duration, description } = req.body;

    try {
      const service = await Service.findOne({ _id: id });
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      service.name = name || service.name;
      service.duration = duration || service.duration;
      service.description = description || service.description;

      await service.save();
      return res.status(200).json(service);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Error updating service" });
    }
  },

  // Delete a service by ID
  async delete(req, res) {
    console.log("svccontroller > delete");
    const { id } = req.params; // Fixed parameter extraction

    try {
      const service = await Service.findByIdAndDelete(id);

      if (service) {
        return res
          .status(204)
          .json({ message: "Service deleted successfully" });
      } else {
        return res.status(404).json({ message: "Service not found" });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Error deleting service" });
    }
  },
};

module.exports = ServiceController;

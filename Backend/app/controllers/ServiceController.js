const mongodb = require("./config/database.js");
const Service = require("../models/Service.js");
const path = require("path");

const ServiceController = {
  /*
  @desc: Create a new service
  @route: POST /api/services
  @access: Admin only
  @param: req.body: { name, duration, description, serviceRates }
  @return: 201 Created with the new service object
  @error: 400 Bad Request if any required field is missing or invalid
   */
  async create(req, res) {
    console.log("serviceController > create");

    let { name, duration, description, serviceRates } = req.body;

    try {
      const newService = new Service({
        name,
        duration,
        description,
        serviceRates,
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
      const services = await Service.find().populate("serviceRates");
      const { month, year, day } = req.query;

      const date = new Date();
      if (month && year && day) {
        date = new Date(year, month, day);
      }
      let temp = [];
      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        const MAXRATE = 1000000000000000;
        let rate = MAXRATE;
        for (let j = 0; j < service.serviceRates.length; j++) {
          const serviceRate = service.serviceRates[j];
          if (serviceRate.startDate <= date && serviceRate.endDate >= date) {
            if (serviceRate.rate < rate) {
              rate = serviceRate.rate;
            }
          }
        }
        if (rate !== MAXRATE) {
          temp.push({
            _id: service._id,
            name: service.name,
            duration: service.duration,
            description: service.description,
            serviceRate: rate,
            promotion: service.promotion,
            expertiseRequired: service.expertiseRequired,
          });
        }
      }
      if (temp.length > 0) {
        return res.status(200).json(temp);
      } else {
        return res.status(404).json({ message: "No services found" });
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
    const { name, duration, description, serviceRates } = req.body;

    try {
      const service = await Service.findOne({ _id: id });
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      service.name = name || service.name;
      service.duration = duration || service.duration;
      service.description = description || service.description;
      service.serviceRates = serviceRates || service.serviceRates;
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

  async retrieveAllWithAllServiceRates(req, res) {
    console.log(
      "ServiceRateController > retrieve all Service Rates with all Service Rates"
    );
    const { paginated } = req.params;
    const { page, limit } = req.query;
    if (typeof paginated !== "undefined" && paginated === "true") {
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
      if (isNaN(pageNumber) || isNaN(limitNumber)) {
        return res.status(400).json({ message: "Invalid page or limit" });
      }
      const startIndex = (pageNumber - 1) * limitNumber;
      const endIndex = startIndex + limitNumber;
      try {
        const services = await Service.find().populate("serviceRates");
        const totalServices = services.length;
        const paginatedServices = services.slice(startIndex, endIndex);
        const paginated = {
          total: totalServices,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(totalServices / limitNumber),
          hasNextPage: endIndex < totalServices,
          services: paginatedServices,
        };
        return res.status(200).json(paginated);
      } catch (error) {
        console.error(error.message);
        return res
          .status(500)
          .json({ message: "Error retrieving all Service" });
      }
    } else {
      try {
        const services = await Service.find().populate("serviceRates");
        for (let i = 0; i < services.length; i++) {
          const service = services[i];
          service.serviceRates = service.serviceRates.filter((serviceRate) => {
            return !serviceRate.isDisabled;
          });
        }
        if (services) {
          return res.status(200).json(services);
        } else {
          return res.status(404).json({ message: "No Service found" });
        }
      } catch (error) {
        console.error(error.message);
        return res
          .status(500)
          .json({ message: "Error retrieving all Service" });
      }
    }
  },
};

module.exports = ServiceController;

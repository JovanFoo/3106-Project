const mongodb = require("./config/database.js");
const ServiceRate = require("../models/ServiceRate.js");

const ServiceRateController = {
  // Create a new ServiceRate rate --> TODO: implement only for stylist manager?
  async create(req, res) {
    console.log("ServiceRateController > create");

    let { name, rate, startDate, endDate } = req.body;

    try {
      const newServiceRate = new ServiceRate({
        name,
        rate,
        startDate,
        endDate,
      });

      const savedServiceRate = await newServiceRate.save();
      if (!savedServiceRate) {
        return res.status(400).json({ message: "Error creating Service Rate" });
      }
      return res.status(201).json(savedServiceRate);
    } catch (error) {
      console.error(error.message);
      return res.status(400).json({ message: error.message });
    }
  },

  // Retrieve a ServiceRate by ID
  async retrieve(req, res) {
    console.log("ServiceRateController > retrieve");
    const { id } = req.params;

    try {
      const ServiceRate = await ServiceRate.findOne({ _id: id });
      if (ServiceRate) {
        return res.status(200).json(ServiceRate);
      } else {
        return res.status(404).json({ message: "Service Rate not found" });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Error retrieving Service Rate" });
    }
  },

  // Update a ServiceRate by ID --> TODO: implement only for stylist manager?
  async update(req, res) {
    console.log("ServiceRateController > update");
    const { id } = req.params;
    const { name, rate, startDate, endDate } = req.body;

    try {
      const ServiceRate = await ServiceRate.findOne({ _id: id });
      if (!ServiceRate) {
        return res.status(404).json({ message: "Service Rate not found" });
      }

      ServiceRate.name = name || ServiceRate.name;
      ServiceRate.rate = rate || ServiceRate.rate;
      ServiceRate.startDate = startDate || ServiceRate.startDate;
      ServiceRate.endDate = endDate || ServiceRate.endDate;

      await ServiceRate.save();
      return res.status(200).json(ServiceRate);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Error updating Service Rate" });
    }
  },

  // Delete a ServiceRate by ID --> TODO: implement only for stylist manager?
  async delete(req, res) {
    console.log("ServiceRateController > delete");
    const { id } = req.params;

    try {
      const ServiceRate = await ServiceRate.findByIdAndDelete(id);

      if (ServiceRate) {
        return res
          .status(204)
          .json({ message: "Service Rate deleted successfully" });
      } else {
        return res.status(404).json({ message: "Service Rate not found" });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Error deleting Service Rate" });
    }
  },
};

module.exports = ServiceRateController;

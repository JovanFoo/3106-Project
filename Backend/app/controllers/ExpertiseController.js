const mongodb = require("./config/database.js");
const Expertise = require("../models/Expertise.js");
const Stylist = require("../models/Stylist.js");
const ExpertiseController = {
  // Create new Expertise TODO: require only admin/branch manager account
  async create(req, res) {
    console.log("ExpertiseController > create");

    let { name, description } = req.body;
    try {
      const expertise = new Expertise({
        name,
        description,
      });
      const newExpertise = await expertise.save();
      if (!newExpertise) {
        return res.status(400).json({ message: "Error creating expertise" });
      }
      return res.status(201).json(newExpertise);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: error.message });
    }
  },
  // Retrieve Expertise
  async retrieve(req, res) {
    console.log("ExpertiseController > retrieve");
    const { id } = req.params;
    const expertise = await Expertise.findOne({ _id: id });
    console.log(expertise);
    if (expertise) {
      return res.status(200).json(expertise);
    } else {
      return res.status(400).json({ message: "Error retrieving appointment" });
    }
  },
  // List all Expertise
  async list(req, res) {
    console.log("ExpertiseController > list");
    const expertise = await Expertise.find();
    if (expertise) {
      return res.status(200).json(expertise);
    } else {
      return res.status(400).json({ message: "Error retrieving appointments" });
    }
  },
  // Update Expertise TODO: require only admin/branch manager account
  async update(req, res) {
    console.log("ExpertiseController > update");
    const { id } = req.params;
    const { name, description } = req.body;

    try {
      const expertise = await Expertise.findOne({ _id: id });
      if (!expertise) {
        return res.status(404).json({ message: "Expertise not found" });
      }
      // take updated value if there is one
      expertise.name = name || expertise.name;
      expertise.description = description || expertise.description;

      await expertise.save();
      return res.status(200).json(expertise);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Error updating expertise" });
    }
  },
  // Delete Expertise TODO: require only admin/branch manager account
  async delete(req, res) {
    console.log("ExpertiseController > delete");
    const { id } = req.params;

    try {
      const expertise = await Expertise.findOne({ _id: id });

      if (expertise) {
        await Expertise.findByIdAndDelete({ _id: id });
        await Stylist.find();
        return res
          .status(204)
          .json({ message: "Expertise deleted successfully" });
      } else {
        return res.status(404).json({ message: "Expertise not found" });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Error deleting expertise" });
    }
  },

  async getExpertisePagination(req, res) {
    console.log("ExpertiseController > getExpertisePagination");
    const { page = 1, limit = 10 } = req.query;
    const expertise = await Expertise.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Expertise.countDocuments();
    if (expertise) {
      return res.status(200).json({
        expertise,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } else {
      return res.status(400).json({ message: "Error retrieving appointments" });
    }
  },
};

module.exports = ExpertiseController;

const mongodb = require("./config/database.js");
const Expertise = require("../models/Expertise.js");

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
      return res.status(201).json(savedService);
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
};

module.exports = ExpertiseController;

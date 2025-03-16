const Branch = require("../models/Branch");

const BranchController = {
  // Create a new branch
  async create(req, res) {
    console.log("BranchController > create");
    const { branchId, location, isDisabled } = req.body;

    try {
      const branch = new Branch({
        branchId,
        location,
        isDisabled: isDisabled ?? false, // Default to false if not provided
      });

      await branch.save();
      return res.status(201).json(branch);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: error.message });
    }
  },

  // Retrieve a branch by ID
  async retrieve(req, res) {
    console.log("BranchController > retrieve");
    const { id } = req.params;

    try {
      const branch = await Branch.findById(id);
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      return res.status(200).json(branch);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Error retrieving branch" });
    }
  },

  // Retrieve all branches
  async retrieveAll(req, res) {
    console.log("BranchController > retrieveAll");

    try {
      const branches = await Branch.find();
      return res.status(200).json(branches);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Error retrieving branches" });
    }
  },

  // Update a branch by ID
  async update(req, res) {
    console.log("BranchController > update");
    const { id } = req.params;
    const { location, isDisabled } = req.body;

    try {
      const branch = await Branch.findById(id);
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      branch.location = location ?? branch.location;
      branch.isDisabled = isDisabled ?? branch.isDisabled;

      await branch.save();
      return res.status(200).json(branch);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Error updating branch" });
    }
  },

  // Delete a branch by ID
  async delete(req, res) {
    console.log("BranchController > delete");
    const { id } = req.params;

    try {
      const branch = await Branch.findByIdAndDelete(id);
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      return res.status(204).json({ message: "Branch deleted successfully" });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Error deleting branch" });
    }
  },
};

module.exports = BranchController;

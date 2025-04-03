const mongodb = require("./config/database.js");
const Branch = require("../models/Branch");
const Stylist = require("../models/Stylist");

const BranchController = {
  // Create a new branch
  async create(req, res) {
    console.log("BranchController > create");
    const {
      location,
      isDisabled,
      phoneNumber,
      weekdayOpeningTime,
      weekdayClosingTime,
      weekendOpeningTime,
      weekendClosingTime,
      holidayOpeningTime,
      holidayClosingTime,
    } = req.body;

    try {
      const branch = new Branch({
        location,
        phoneNumber,
        weekdayOpeningTime,
        weekdayClosingTime,
        weekendOpeningTime,
        weekendClosingTime,
        holidayOpeningTime,
        holidayClosingTime,
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
    const {
      holidayClosingTime,
      holidayOpeningTime,
      weekdayClosingTime,
      weekdayOpeningTime,
      weekendClosingTime,
      weekendOpeningTime,
      location,
      phoneNumber,
    } = req.body;

    try {
      const branch = await Branch.findById(id);
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      const updated = await Branch.findByIdAndUpdate(
        id,
        {
          location,
          phoneNumber,
          weekdayOpeningTime,
          weekdayClosingTime,
          weekendOpeningTime,
          weekendClosingTime,
          holidayOpeningTime,
          holidayClosingTime,
        },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Branch not found" });
      }
      console.log("Branch updated successfully:", updated);
      return res.status(200).json(updated);
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

  // Retrieve all stylists in a branch
  async retrieveStylists(req, res) {
    console.log("BranchController > retrieveStylists");
    const { branchId } = req.body;
    const { userId } = req;

    try {
      const stylist = await Stylist.findById(userId)
        .populate("stylists")
        .exec();
      if (!stylist) {
        return res.status(404).json({ message: "Stylist not found" });
      }
      // const branch = await Branch.findOne({ staffs: stylist._id });
      // if ( !branch )
      // {
      //   return res.status( 404 ).json( { message: "Branch not found" } );
      // }
      stylist.stylists.map((stylist) => (stylist.password = undefined));
      return res.status(200).json(stylist.stylists);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Error retrieving branch" });
    }
  },

  // Add stylist to a branch
  async addStylist(req, res) {
    console.log("StylistController > assign");
    const { id } = req.params;
    const { stylistManagerId, stylistId } = req.body;
    const stylist = await Stylist.findOne({ _id: stylistId });
    if (!stylist) {
      return res.status(400).json({ message: "Stylist not found" });
    }
    const stylistManager = await Stylist.findOne({ _id: stylistManagerId });
    if (!stylistManager) {
      return res.status(400).json({ message: "Stylist Manager not found" });
    }
    const branch = await Branch.findOne({ _id: id });
    if (!branch) {
      return res.status(400).json({ message: "Branch not found" });
    }
    if (branch.staffs.includes(stylist._id)) {
      return res
        .status(400)
        .json({ message: "Stylist already assigned to branch" });
    }
    stylistManager.stylists.push(stylist);
    if (!branch.staffs.includes(stylistManager._id)) {
      branch.staffs.push(stylistManager);
    }
    branch.staffs.push(stylist);
    await branch.save();
    await stylistManager.save();
    return res.status(200).json(branch);
  },
  // Remove stylist to a branch
  async removeStylist(req, res) {
    console.log("StylistController > remove");
    const { id } = req.params;
    const { stylistManagerId, stylistId } = req.body;
    const stylist = await Stylist.findOne({ _id: stylistId });
    if (!stylist) {
      return res.status(400).json({ message: "Stylist not found" });
    }
    const stylistManager = await Stylist.findOne({ _id: stylistManagerId });
    if (!stylistManager) {
      return res.status(400).json({ message: "Stylist Manager not found" });
    }
    const branch = await Branch.findOne({ _id: id });
    if (!branch) {
      return res.status(400).json({ message: "Branch not found" });
    }
    branch.staffs = branch.staffs.filter((x) => !stylist._id.equals(x._id));
    stylistManager.stylists = stylistManager.stylists.filter(
      (x) => !stylist._id.equals(x._id)
    );
    await branch.save();
    await stylistManager.save();
    return res.status(200).json(branch);
  },

  // Retrieve all branches a stylist is assigned to
  async retrieveBranchesByStylist(req, res) {
    console.log("BranchController > retrieveBranchesByStylist");

    try {
      const stylist = await Stylist.findById(req.userId);
      if (!stylist) {
        return res.status(404).json({ message: "Stylist not found" });
      }

      const branches = await Branch.find({ stylists: stylist._id });

      return res.status(200).json(branches);
    } catch (error) {
      console.log(error.message);
      return res
        .status(400)
        .json({ message: "Error retrieving branches for stylist" });
    }
  },
  // Retrieve all stylists in a branch
  async retrieveStylistsForBranch(req, res) {
    console.log("BranchController > retrieveStylistsForBranch");
    const { id } = req.params;

    try {
      const branch = await Branch.findById(id).populate("stylists");
      const stylists = branch.stylists;
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }
      stylists.map((stylist) => (stylist.password = undefined));
      return res.status(200).json(stylists);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Error retrieving branch" });
    }
  },
};

module.exports = BranchController;

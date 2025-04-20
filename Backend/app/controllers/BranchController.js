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
      const branch = await Branch.findById(id)
        .populate("manager", "name") // populate manager name
        .populate("stylists", "name"); // populate stylist names
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      return res.status(200).json(branch);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Error retrieving branch" });
    }
  },

  // Retrieve a branch by its location (branch name)
  async retrieveByBranchLocation(req, res) {
    console.log("BranchController > retrieveBranchByBranchName");
    const { location } = req.params;

    try {
      const branch = await Branch.findOne({ location });
      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      return res.status(200).json(branch);
    } catch (error) {
      console.log(error.message);
      return res
        .status(400)
        .json({ message: "Error retrieving branch by name" });
    }
  },

  // Retrieve all branches
  async retrieveAll(req, res) {
    console.log("BranchController > retrieveAll");

    try {
      const branches = await Branch.find()
        .populate("manager") // populate manager's name
        .populate("stylists", "name"); // populate each stylist's name
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
    if (branch.stylists.includes(stylist._id)) {
      return res
        .status(400)
        .json({ message: "Stylist already assigned to branch" });
    }
    const otherBranch = await Branch.findOne({ stylists: stylist._id });
    if (otherBranch) {
      if (otherBranch.manager.equals(stylist._id)) {
        return res
          .status(400)
          .json({ message: "Stylist is a manager of another branch" });
      }
      otherBranch.stylists = otherBranch.stylists.filter(
        (x) => !stylist._id.equals(x._id)
      );
      await otherBranch.save();
      const otherManager = await Stylist.findOne({
        _id: otherBranch.manager,
      });
      if (otherManager)
        otherManager.stylists = otherManager.stylists.filter(
          (x) => !stylist._id.equals(x._id)
        );
      await otherManager.save();
    }

    stylistManager.stylists.push(stylist);
    if (!branch.stylists.includes(stylistManager._id)) {
      branch.stylists.push(stylistManager);
    }
    branch.stylists.push(stylist);
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
    branch.stylists = branch.stylists.filter((x) => !stylist._id.equals(x._id));
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
      for (let stylist of branch.stylists) {
        await stylist.populate("expertises"); // Populate expertises for each stylist
      }
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

  async changeManager(req, res) {
    console.log("TeamController > change manager of a team");
    const { id: branchId } = req.params;
    const { stylistId } = req.body;
    if (!stylistId) {
      return res.status(400).json({ message: "Stylist ID is required" });
    }
    if (!branchId) {
      return res.status(400).json({ message: "Branch ID is required" });
    }
    try {
      const tobeManager = await Stylist.findById(stylistId);
      const branch = await Branch.findOne({ _id: branchId });

      const otherBranch = await Branch.findOne().where({
        stylists: { $in: stylistId },
      });
      if (!tobeManager) {
        return res.status(400).json({ message: "Stylist not found" });
      }
      if (tobeManager.stylists.length > 0) {
        return res.status(400).json({ message: "Stylist is a manager" });
      }
      if (!branch) {
        return res.status(400).json({ message: "Branch not found" });
      }
      if (branch.manager == stylistId) {
        return res
          .status(400)
          .json({ message: "This stylist is already a manager" });
      }
      if (otherBranch && otherBranch._id != branchId) {
        // remove stylist from other branch
        otherBranch.stylists = otherBranch.stylists.filter((staff) => {
          return staff.toString() != stylistId;
        });
        await otherBranch.save();
        const otherManager = await Stylist.findById(otherBranch.manager);
        if (otherManager) {
          otherManager.stylists = otherManager.stylists.filter((staff) => {
            return staff._id.toString() != stylistId;
          });
          await otherManager.save();
        }
      }
      const branchManager = await Stylist.findById(branch.manager);

      if (branchManager) {
        branchManagerStylists = branchManager.stylists;
        tobeManager.stylists = branchManager.stylists;
        if (!tobeManager.stylists.includes(stylistId)) {
          tobeManager.stylists.push(stylistId);
        }
        if (!tobeManager.stylists.includes(branchManager._id)) {
          tobeManager.stylists.push(branchManager._id);
        }
        branchManager.stylists = [];
        await branchManager.save();
      }
      await tobeManager.save();
      branch.manager = stylistId;
      await branch.save();
      return res.status(200).json(branch);
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Error updating branch" });
    }
  },

  async assignStylistToBranch(req, res) {
    console.log("BranchController > assignStylistToBranch");
    const { id: branchId } = req.params;
    const { stylistId } = req.body;
    if (!stylistId) {
      return res.status(400).json({ message: "Stylist ID is required" });
    }
    if (!branchId) {
      return res.status(400).json({ message: "Branch ID is required" });
    }

    try {
      const branch = await Branch.findById(branchId);
      const stylist = await Stylist.findById(stylistId);
      const otherBranch = await Branch.findOne({ stylists: stylistId });

      if (!branch) {
        return res.status(400).json({ message: "Branch not found" });
      }
      if (!stylist) {
        return res.status(400).json({ message: "Stylist not found" });
      }
      if (branch.stylists.includes(stylistId)) {
        return res
          .status(400)
          .json({ message: "Stylist already assigned to this branch" });
      }
      if (stylist.stylists.length > 0) {
        return res.status(400).json({ message: "Stylist is a manager" });
      }
      if (branch.manager == stylistId) {
        return res
          .status(400)
          .json({ message: "Stylist is already the manager of this branch" });
      }
      if (otherBranch) {
        otherBranch.stylists = otherBranch.stylists.filter((staff) => {
          return staff.toString() != stylistId;
        });
        await otherBranch.save();
        const otherManager = await Stylist.findById(otherBranch.manager);
        if (otherManager) {
          otherManager.stylists = otherManager.stylists.filter((staff) => {
            return staff._id.toString() != stylistId;
          });
          await otherManager.save();
        }
      }
      const branchManager = await Stylist.findById(branch.manager);
      if (branchManager) {
        console.log(branchManager);
        branchManager.stylists.push(stylist);
        await branchManager.save();
        branch.stylists.push(stylist);
        await branch.save();
      } else {
        branch.manager = stylistId;
        await branch.save();
        stylist.stylists.push(stylistId);
        await stylist.save();
      }
      const returnBranch = await Branch.findById(branchId)
        .populate("stylists", "name")
        .populate("manager", "name");
      res.status(200).json(returnBranch);
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Error updating branch" });
    }
  },
};

module.exports = BranchController;

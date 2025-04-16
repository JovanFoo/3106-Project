// const Team = require("../models/Team.js");
const Stylist = require("../models/Stylist.js");
const Branch = require("../models/Branch.js");
const { get } = require("mongoose");
const BranchController = require("./BranchController.js");

const TeamController = {
  // Team Controller is a sub-controller of the Stylist Controller and is used to manage the team of stylists.
  // It allows the manager to add, remove, and list stylists in the team.
  // The manager is the user who created the team and has the ability to manage it.

  // Add a stylist to the team
  //   async create(req, res) {
  //     console.log("TeamController > create");
  //     const { stylistId } = req.body;

  //     if (!stylistId) {
  //       return res.status(400).json({ message: "Stylist ID is required" });
  //     }

  //     if (stylistId === req.userId) {
  //       return res
  //         .status(400)
  //         .json({ message: "You cannot add yourself to the team." });
  //     }

  //     try {
  //       const stylist = await Stylist.findById(stylistId);
  //       if (!stylist) {
  //         return res.status(404).json({ message: "Stylist not found" });
  //       }

  //       let team = await Team.findOne(); // assuming a single team document

  //       if (!team) {
  //         // Create new team if none exists
  //         team = new Team({
  //           name: "Default Team",
  //           stylists: [stylistId],
  //           manager: req.userId,
  //         });
  //       } else {
  //         // Prevent duplicate stylist
  //         if (team.stylists.includes(stylistId)) {
  //           return res
  //             .status(400)
  //             .json({ message: "Stylist already in the team" });
  //         }

  //         team.stylists.push(stylistId);
  //       }

  //       const savedTeam = await team.save();
  //       if (!savedTeam) {
  //         return res.status(500).json({ message: "Failed to save team" });
  //       }

  //       return res.status(201).json(stylist);
  //     } catch (error) {
  //       console.error("❌ TeamController > create error:", error.message);
  //       return res.status(500).json({ message: "Server error" });
  //     }
  //   },
  async addANewTeamMember(req, res) {
    // only for manager
    console.log("TeamController > assign a stylist to a team");
    const stylistManagerId = req.userId;
    const { stylistId } = req.body;
    const stylist = await Stylist.findOne({ _id: stylistId });
    const branch = await Branch.findOne().where({
      manager: stylistManagerId,
    });
    const stylistManager = await Stylist.findOne({
      _id: stylistManagerId,
    });
    console.log(branch);
    if (!stylist) {
      return res.status(400).json({ message: "Stylist not found" });
    }
    if (!branch) {
      return res.status(400).json({ message: "Branch not found" });
    }
    if (!stylistManager) {
      return res.status(400).json({ message: "Stylist Manager not found" });
    }
    if (branch.manager != stylistManagerId) {
      return res
        .status(400)
        .json({ message: "You are not the manager of this branch" });
    }
    // if (stylistManagerId == stylistId) {
    //   return res.status(400).json({ message: "You cannot add yourself" });
    // }
    // add stylist to the branch and stylist manager
    let included = false;
    if (branch.stylists.includes(stylistId)) {
      included = true;
    } else {
      branch.stylists.push(stylistId);
    }
    if (stylistManager.stylists.includes(stylistId)) {
      included = true;
    } else {
      stylistManager.stylists.push(stylistId);
    }
    // if (included) {
    //   return res.status(400).json({ message: "Stylist already in the team" });
    // }
    if (!branch.stylists.includes(stylistManagerId)) {
      branch.stylists.push(stylistManagerId);
    }
    const savedBranch = await branch.save();
    const savedStylistManager = await stylistManager.save();
    savedStylistManager.stylists.map(
      (stylist) => (stylist.password = undefined)
    );
    res.status(200).json(savedStylistManager.stylists);
  },

  async getAllTeamMembers(req, res) {
    console.log("TeamController > getAllTeamMembers");
    const { userId } = req;
    try {
      const stylist = await Stylist.findById(userId)
        .populate("stylists")
        .exec();
      if (!stylist) {
        return res.status(404).json({ message: "Stylist not found" });
      }
      stylist.stylists.map((stylist) => (stylist.password = undefined));
      return res.status(200).json(stylist.stylists);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Error retrieving team members" });
    }
  },

  async removeATeamMember(req, res) {
    console.log("TeamController > remove a team member");
    const { stylistId } = req.body;
    const { userId } = req;
    const stylistManager = await Stylist.findById(userId);
    const branch = await Branch.findOne({ manager: userId });
    if (!stylistManager) {
      return res.status(400).json({ message: "Stylist Manager not found" });
    }
    if (!stylistManager.stylists.includes(stylistId)) {
      return res.status(400).json({ message: "Stylist not found in team" });
    }
    if (!branch) {
      return res.status(400).json({ message: "Branch not found" });
    }
    if (branch.stylists.includes(stylistId)) {
      branch.stylists.filter((staff) => staff != stylistId);
      await branch.save();
    }
    if (stylistManager.stylists.includes(stylistId)) {
      stylistManager.stylists.filter((stylist) => stylist != stylistId);
      await stylistManager.save();
    }
    if (stylistManager._id == stylistId) {
      return res.status(400).json({ message: "You cannot remove yourself" });
    }
    return res.status(204);
  },
  //   // Get all stylists from the team
  //   async list(req, res) {
  //     console.log("TeamController > list");
  //     try {
  //       const team = await Team.findOne().populate("stylists");
  //       if (!team) {
  //         return res.status(200).json([]);
  //       }

  //       return res.status(200).json(team.stylists);
  //     } catch (error) {
  //       console.error("❌ TeamController > list error:", error.message);
  //       return res.status(500).json({ message: "Error retrieving team members" });
  //     }
  //   },

  //   // Remove stylist from the team (by stylist ID)
  //   async delete(req, res) {
  //     console.log("TeamController > delete");
  //     const { id } = req.params;

  //     try {
  //       const team = await Team.findOne();
  //       if (!team) {
  //         return res.status(404).json({ message: "Team not found" });
  //       }

  //       const index = team.stylists.indexOf(id);
  //       if (index === -1) {
  //         return res.status(404).json({ message: "Stylist not found in team" });
  //       }

  //       team.stylists.splice(index, 1);
  //       await team.save();

  //       return res.status(204).json({ message: "Stylist removed from team" });
  //     } catch (error) {
  //       console.error("❌ TeamController > delete error:", error.message);
  //       return res
  //         .status(500)
  //         .json({ message: "Error removing stylist from team" });
  //     }
  //   },
};

module.exports = TeamController;

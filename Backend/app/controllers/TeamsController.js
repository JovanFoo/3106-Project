// const Team = require("../models/Team.js");
const Stylist = require("../models/Stylist.js");
const Branch = require("../models/Branch.js");
const { get } = require("mongoose");
const BranchController = require("./BranchController.js");

const TeamController = {
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
    const otherbranchManager = await Branch.findOne().where({
      manager: stylistId,
    });

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
    if (stylistManagerId == stylistId) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }
    if (stylist.stylists.length > 0) {
      return res.status(400).json({ message: "Stylist already in a team" });
    }
    // add stylist to the branch and stylist manager

    if (!otherbranchManager) {
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
      if (!branch.stylists.includes(stylistManagerId)) {
        branch.stylists.push(stylistManagerId);
      }
      const savedBranch = await branch.save();
      const savedStylistManager = await stylistManager.save();
      savedStylistManager.stylists.map(
        (stylist) => (stylist.password = undefined)
      );
      const otherBranch = await Branch.findOne().where({
        stylists: stylistId,
      });
      if (otherBranch) {
        console.log("otherBranch b4", otherBranch.stylists, stylistId);

        otherBranch.stylists = otherBranch.stylists.filter((staff) => {
          console.log(
            "otherBranch b4",
            staff._id.toString(),
            staff._id.toString() != stylistId
          );
          return staff.toString() != stylistId;
        });
        console.log("otherBranch aft", otherBranch.stylists, stylistId);
        await otherBranch.save();
        const otherManager = await Stylist.findById(otherBranch.manager);
        if (otherManager) {
          console.log("otherManager b4", otherManager.stylists, stylistId);
          otherManager.stylists = otherManager.stylists.filter((staff) => {
            console.log(
              "otherManager b4",
              staff._id.toString(),
              staff._id.toString() != stylistId
            );
            return staff._id.toString() != stylistId;
          });
          console.log("otherManager aft", otherManager.stylists, stylistId);
          await otherManager.save();
        }
      }
      res.status(200).json(savedStylistManager.stylists);
    } else {
      return res.status(400).json({ message: "This Stylist is a manager" });
    }
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
};

module.exports = TeamController;

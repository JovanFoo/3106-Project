const Team = require("../models/Team.js");
const Stylist = require("../models/Stylist.js");

const TeamController = {
    // Add a stylist to the team
    async create(req, res) {
        console.log("TeamController > create");
        const { stylistId } = req.body;

        if (!stylistId) {
            return res.status(400).json({ message: "Stylist ID is required" });
        }
        
        if (stylistId === req.userId) {
            return res.status(400).json({ message: "You cannot add yourself to the team." });
        }


        try {
            const stylist = await Stylist.findById(stylistId);
            if (!stylist) {
                return res.status(404).json({ message: "Stylist not found" });
            }

            let team = await Team.findOne(); // assuming a single team document

            if (!team) {
                // Create new team if none exists
                team = new Team({
                    name: "Default Team",
                    stylists: [stylistId],
                    manager: req.userId
                });
            } else {
                // Prevent duplicate stylist
                if (team.stylists.includes(stylistId)) {
                    return res.status(400).json({ message: "Stylist already in the team" });
                }

                team.stylists.push(stylistId);
            }

            const savedTeam = await team.save();
            if (!savedTeam) {
                return res.status(500).json({ message: "Failed to save team" });
            }

            return res.status(201).json(stylist);
        } catch (error) {
            console.error("❌ TeamController > create error:", error.message);
            return res.status(500).json({ message: "Server error" });
        }
    },

    // Get all stylists from the team
    async list(req, res) {
        console.log("TeamController > list");
        try {
            const team = await Team.findOne().populate("stylists");
            if (!team) {
                return res.status(200).json([]);
            }

            return res.status(200).json(team.stylists);
        } catch (error) {
            console.error("❌ TeamController > list error:", error.message);
            return res.status(500).json({ message: "Error retrieving team members" });
        }
    },

    // Remove stylist from the team (by stylist ID)
    async delete(req, res) {
        console.log("TeamController > delete");
        const { id } = req.params;

        try {
            const team = await Team.findOne();
            if (!team) {
                return res.status(404).json({ message: "Team not found" });
            }

            const index = team.stylists.indexOf(id);
            if (index === -1) {
                return res.status(404).json({ message: "Stylist not found in team" });
            }

            team.stylists.splice(index, 1);
            await team.save();

            return res.status(204).json({ message: "Stylist removed from team" });
        } catch (error) {
            console.error("❌ TeamController > delete error:", error.message);
            return res.status(500).json({ message: "Error removing stylist from team" });
        }
    },
};

module.exports = TeamController;

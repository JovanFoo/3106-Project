const mongodb = require("./config/database.js");
const Branch = require( "../models/Branch" );
const Stylist = require( "../models/Stylist" );

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

  // Retrieve all stylists in a branch
  async retrieveStylists ( req, res ) {
    console.log( "BranchController > retrieveStylists" );
    const { branchId } = req.body;
    const {userId} = req.user;

    try
    {
      const stylist = await Stylist.findOne( { userId } );
      if ( !stylist )
      {
        return res.status( 404 ).json( { message: "Stylist not found" } );
      }
      const branch = await Branch.findOne({ staffs: stylist._id });
      if ( !branch )
      {
        return res.status( 404 ).json( { message: "Branch not found" } );
      }
    }
    catch ( error )
    {
      console.log( error.message );
      return res.status( 400 ).json( { message: "Error retrieving branch" } );
    }
  },

  // Add stylist to a branch
  async addStylist ( req, res ) {
      console.log("StylistController > assign");
      const { id } = req.params;
      const { stylistManagerId, stylistId } = req.body;
      const stylist = await Stylist.findOne({ _id: stylistId });
      if (!stylist) {
        return res.status(400).json({ message: "Stylist not found" });
      }
      const stylistManager = await Stylist.findOne({ _id: stylistManagerId });
      if (!stylistManager) {
        return res.status(400).json({ message: "Stylist not found" });
      }
      const branch = await Branch.findOne({ _id: id });
      if (!branch) {
        return res.status(400).json({ message: "Branch not found" });
      }
      branch.staffs.push( stylist );
      stylistManager.stylists.push( stylist );
      await branch.save();
      await stylistManager.save();
      return res.status(200).json(branch);
  },
  // Remove stylist to a branch
  async removeStylist ( req, res ) {
      console.log("StylistController > remove");
      const { id } = req.params;
      const { stylistManagerId, stylistId } = req.body;
      const stylist = await Stylist.findOne({ _id: stylistId });
      if (!stylist) {
        return res.status(400).json({ message: "Stylist not found" });
      }
      const stylistManager = await Stylist.findOne({ _id: stylistManagerId });
      if (!stylistManager) {
        return res.status(400).json({ message: "Stylist not found" });
      }
      const branch = await Branch.findOne({ _id: id });
      if (!branch) {
        return res.status(400).json({ message: "Branch not found" });
      }
      branch.staffs.filter(x=> stylist._id.toHexString() !== x._id.toHexString());
      stylistManager.stylists.filter(x=> stylist._id.toHexString() !== x._id.toHexString());
      await branch.save();
      await stylistManager.save();
      return res.status(200).json(branch);
  }
};

module.exports = BranchController;

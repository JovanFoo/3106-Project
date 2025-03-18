const mongodb = require("./config/database.js");
const Discount = require("../models/Discount.js");

const DiscountController = {
  // Create a new Discount rate --> TODO: implement only for stylist manager/branch?
  async create(req, res) {
    console.log("DiscountController > create");

    let { points, value } = req.body;

    try {
      const newDiscount = new Discount({
        points,
        value,
      });

      const savedDiscount = await newDiscount.save();
      if (!savedDiscount) {
        return res.status(400).json({ message: "Error creating Discount" });
      }
      return res.status(201).json(savedDiscount);
    } catch (error) {
      console.error(error.message);
      return res.status(400).json({ message: error.message });
    }
  },

  // Retrieve a Discount by ID
  async retrieve(req, res) {
    console.log("DiscountController > retrieve");
    const { id } = req.params;

    try {
      const Discount = await Discount.findOne({ _id: id });
      if (Discount) {
        return res.status(200).json(Discount);
      } else {
        return res.status(404).json({ message: "Discount not found" });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Error retrieving Discount" });
    }
  },

  // Update a Discount by ID --> TODO: implement only for stylist manager/branch?
  async update(req, res) {
    console.log("DiscountController > update");
    const { id } = req.params;
    const { points, value } = req.body;

    try {
      const Discount = await Discount.findOne({ _id: id });
      if (!Discount) {
        return res.status(404).json({ message: "Discount not found" });
      }

      Discount.points = points || Discount.points;
      Discount.value = value || Discount.value;

      await Discount.save();
      return res.status(200).json(Discount);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Error updating Discount" });
    }
  },

  // Delete a Discount by ID --> TODO: implement only for stylist manager/branch?
  async delete(req, res) {
    console.log("DiscountController > delete");
    const { id } = req.params;

    try {
      const Discount = await Discount.findByIdAndDelete(id);

      if (Discount) {
        return res
          .status(204)
          .json({ message: "Discount deleted successfully" });
      } else {
        return res.status(404).json({ message: "Discount not found" });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Error deleting Discount" });
    }
  },
};

module.exports = DiscountController;

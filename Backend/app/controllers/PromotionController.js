const mongodb = require("./config/database.js");
const Promotion = require("../models/Promotion.js");
const Service = require("../models/Service.js");

const PromotionController = {
  // Create a new promo
  async create(req, res) {
    console.log("promocontroller > create");
    const { promotionName, promotionAmt, isClaimed } = req.body;
    id = req.userId;
    try {
      const promo = new Promotion({
        promotionName,
        promotionAmt: parseFloat(promotionAmt), // ensure this is a number
        isClaimed,
      });

      const service = await Service.findByIdAndUpdate(id, {
        $push: { Promotion: promo },
      });

      const savedPromo = await promo.save();
      if (!savedPromo) {
        return res.status(400).json({ message: "Error creating promotion" });
      }

      return res.status(201).json(savedPromo);
    } catch (error) {
      console.error(error.message);
      return res.status(400).json({ message: error.message });
    }
  },

  // Retrieve a promo by ID
  async retrieve(req, res) {
    console.log("promo > retrieve");
    const { id } = req.params;

    try {
      const promo = await Promotion.findOne({ _id: id });
      if (promo) {
        return res.status(200).json(promo);
      } else {
        return res.status(404).json({ message: "Promotion not found" });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Error retrieving promotion" });
    }
  },

  // Delete a promotion by ID
  async delete(req, res) {
    console.log("promo > delete");
    const { id } = req.params; // Fix parameter extraction

    try {
      const promo = await Promotion.findByIdAndDelete(id);

      if (promo) {
        return res
          .status(204)
          .json({ message: "Promotion deleted successfully" });
      } else {
        return res.status(404).json({ message: "Promotion not found" });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Error deleting promotion" });
    }
  },

  // Update a promotion by ID
  async update(req, res) {
    console.log("promocontroller > update");
    const { id } = req.params;
    const { promotionName, promotionAmt, isClaimed } = req.body;

    try {
      const promotion = await Promotion.findOne({ _id: id });
      if (!promotion) {
        return res.status(404).json({ message: "Promotion not found" });
      }

      let existingPromotion = await Promotion.findOne({ promotionName });

      if (
        existingPromotion &&
        promotion._id.toHexString() !== existingPromotion._id.toHexString()
      ) {
        console.log(
          "existingPromotion._id != promotion._id",
          existingPromotion._id,
          promotion._id
        );
        return res
          .status(400)
          .json({ message: "Promotion name already exists" });
      }

      // Update fields properly
      promotion.promotionName = promotionName || promotion.promotionName;
      promotion.promotionAmt = promotionAmt || promotion.promotionAmt;
      promotion.isClaimed = isClaimed ?? promotion.isClaimed; // Using ?? to handle boolean values

      await promotion.save();
      return res.status(200).json(promotion);
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: "Error updating promotion" });
    }
  },
};

module.exports = PromotionController;

//   async updateCompleted(req, res) {
//     console.log("AppointmentController > update");
//     const { id } = req.params;
//     const appointment = await Appointment.findOne({ _id: id });
//     if (!appointment) {
//       return res.status(404).json({ message: "Appointment not found" });
//     }
//     appointment.isCompleted = true;
//     await appointment.save();
//     return res.status(200).json(appointment);
//   },

module.exports = PromotionController;

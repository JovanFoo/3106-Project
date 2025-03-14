const mongodb = require("./config/database.js");
const Promotion = require("../models/Customer.js");
const PasswordHash = require("../utils/passwordHash.js");

const PromotionController = {
  // Create a new promo
  async create(req, res) {
    console.log("promocontroller > create");
    const id = req.userId;
    let { promotionName, promotionAmt, isClaimed } = req.body;
    date = new Date(date);
    totalAmount = parseFloat(totalAmount);
    try {
      const service = new Service({
        promotionName,
        promotionAmt,
        isClaimed,
      });
      const promo = await service.save();
      if (!promo) {
        return res.status(400).json({ message: "Error creating svc" });
      }
      return res.status(201).json(svc);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: error.message });
    }
  },
  // Retrieve a promo by id
  async retrieve(req, res) {
    console.log("promo > retrieve");
    const { id } = req.params;
    const promo = await Promotion.findOne({ _id: id });
    console.log(promo);
    if (promo) {
      return res.status(200).json(promo);
    } else {
      return res.status(400).json({ message: "Error retrieving appointment" });
    }
  },
  // Update a svc's date request by id

  // Delete a service by id
  async delete(req, res) {
    console.log("promo > delete");
    const { id } = req.customerId;
    const promo = await Promotion.findByIdAndDelete(id);

    if (promo) {
      return res
        .status(204)
        .json({ message: "Appointment deleted successfully" });
    } else {
      return res.status(400).json({ message: "Error deleting appointment" });
    }
  },

  async update(req, res) {
    console.log("promocontroller > update");
    const { id } = req.params;
    const { promotionName, promotionAmt, isClaimed } = req.body;
    const promotion = await Promotion.findOne({ _id: id });
    let existingPromotion = await Customer.findOne({
      promotionName: promotionName,
    });
    if (
      existingPromotion &&
      promotion._id.toHexString() !== existingPromotion._id.toHexString()
    ) {
      console.log(
        "existingCustomer._id != customer._id",
        existingPromotion._id,
        promotion._id
      );
      return res.status(400).json({ message: "Username already exists" });
    }

    promotion.promotionName = name ? name : promotion.name;
    promotion.promotionAmt = username ? username : promotionAmt;
    promotion.isClaimed = email ? email : promotion.isClaimed;
    await customer.save();
    customer.password = undefined;
    return res.status(200).json(promotion);
  },

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
};

module.exports = PromotionController;

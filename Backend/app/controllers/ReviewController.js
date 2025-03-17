const Appointment = require("../models/Appointment.js");
const Review = require("../models/Review.js");
const Customer = require("../models/Customer.js");
const ReviewController = {
  // Create a new review
  async create(req, res) {
    console.log("ReviewController > create");
    const { appointmentId } = req.params;
    const { text, stars } = req.body;
    try {
      const numberStar = parseFloat(stars);
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      const review = new Review({
        text,
        stars: numberStar,
        stylist: appointment.stylist,
      });
      await review.save();
      appointment.reviews.push(review);
      await appointment.save();
      if (!review) {
        return res.status(400).json({ message: "Error creating review" });
      }
      return res.status(201).json(review);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: error.message });
    }
  },

  // Retrieve a review by id
  async retrieve(req, res) {
    console.log("ReviewController > retrieve");
    const { id } = req.params;
    const review = await Review.findOne({ _id: id });
    console.log(review);
    if (review) {
      return res.status(200).json(review);
    } else {
      return res.status(400).json({ message: "Error retrieving review" });
    }
  },

  // Delete a review by id
  async delete(req, res) {
    console.log("ReviewController > delete");
    const { id } = req.params;
    const customer = await Customer.findById(req.userId).populate(
      "appointments"
    );
    const has = customer.appointments
      .filter((appointment) => {
        appointment.reviews.filter((review) => {
          if (review._id == id) {
            return review;
          }
        });
      })
      .reduce(true, (acc, val) => {
        return acc && val;
      });
    if (!has) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const review = await Review.findByIdAndDelete(id);
    if (review) {
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(400).json({ message: "Error deleting review" });
    }
  },
};

module.exports = ReviewController;

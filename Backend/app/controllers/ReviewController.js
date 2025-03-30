const Appointment = require("../models/Appointment.js");
const Review = require("../models/Review.js");
const Customer = require("../models/Customer.js");
const { retrieveAll } = require("./StylistController.js");
const ReviewController = {
  // Create a new review
  async create(req, res) {
    console.log("ReviewController > create");
    const { appointmentId } = req.params;
    const { text, stars, title } = req.body;
    try {
      const numberStar = parseFloat(stars);
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      const review = new Review({
        title,
        text,
        stars: numberStar,
        stylist: appointment.stylist,
      });
      await review.save();
      appointment.review = review;
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
        return appointment.review._id == id;
      })
      .reduce(true, (acc, val) => {
        return acc && val;
      });
    if (!has) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const review = await Review.findByIdAndDelete(id);
    customer.appointments = customer.appointments.filter(
      (appointment) => appointment.review._id != id
    );
    await customer.save();
    if (review) {
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(400).json({ message: "Error deleting review" });
    }
  },

  async retrieveStylistReviews(req, res) {
    console.log("ReviewController > retrieveStylistReviews");
    const { stylistId } = req.params;

    const appointments = await Appointment.find({ stylist: stylistId })
      .where("review")
      .ne(null);
    const customersWithReviews = await Customer.find({
      appointments: { $in: appointments },
    }).populate("appointments");
    const newReviews = customersWithReviews
      .flatMap((customer) => {
        return customer.appointments.map((appointment) => {
          appointment.customer = customer;
          return appointment;
        });
      })
      .filter((appointment) => {
        return appointment.stylist == stylistId;
      })
      .map((appointment) => {
        const customer = appointment.customer;
        customer.password = undefined;
        return {
          review: appointment.review,
          customer: customer.name,
        };
      });
    const temp = [];
    for (let index = 0; index < newReviews.length; index++) {
      const element = newReviews[index];
      console.log(element.customer);
      console.log(element.review);
      const review = await Review.findById(element.review);
      temp.push({
        text: review.text,
        stars: review.stars,
        title: review.title,
        customer: element.customer,
      });
    }

    if (temp) {
      return res.status(200).json(temp);
    } else {
      return res.status(400).json({ message: "Error retrieving reviews" });
    }
  },
};

module.exports = ReviewController;

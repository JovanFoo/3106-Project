const Appointment = require("../models/Appointment.js");
const Review = require("../models/Review.js");
const Customer = require("../models/Customer.js");
const Branch = require("../models/Branch.js");
const Stylist = require("../models/Stylist.js");
const { ObjectId } = require("mongodb");

const ReviewController = {
  // Create a new review
  async create(req, res) {
    console.log("ReviewController > create");
    const { appointmentId } = req.params;
    const { text, stars, title } = req.body;

    // Check if all required fields are provided
    if (!text || !stars || !title) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      // Parse stars as a float, handle potential invalid input
      const numberStar = parseFloat(stars);
      if (isNaN(numberStar) || numberStar < 1 || numberStar > 5) {
        return res.status(400).json({
          message:
            "Invalid star rating. Please provide a number between 1 and 5.",
        });
      }

      // Find the appointment
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Create a new review object
      const review = new Review({
        title,
        text,
        stars: numberStar,
        createdAt: new Date(),
        modifiedAt: new Date(),
        stylist: appointment.stylist, // This pulls stylist data from the appointment
        appointment: appointment._id, // Store the appointment's _id reference here
        customer: req.userId, // Link the review to the authenticated customer
      });

      // Save the review
      await review.save();

      // Update the appointment with the new review
      appointment.review = review._id;
      await appointment.save();

      // Return the created review
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
    try {
      const review = await Review.findById(id);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      return res.status(200).json(review);
    } catch (error) {
      console.error("Error retrieving review:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Retrieve reviews for a branch through stylists and appointments
  async retrieveBranchReviews(req, res) {
    const { branchId } = req.params;

    try {
      // Step 1: Fetch the branch by ID
      const branch = await Branch.findById(branchId).populate("stylists");

      if (!branch) {
        return res.status(404).json({ message: "Branch not found" });
      }

      // Step 2: Get all stylists for the branch
      const stylists = branch.stylists;

      if (!stylists || stylists.length === 0) {
        return res
          .status(404)
          .json({ message: "No stylists found for this branch" });
      }

      // Step 3: Fetch appointments for the stylists of the branch
      const appointments = await Appointment.find({
        stylist: { $in: stylists.map((stylist) => stylist._id) },
      }).select("_id");

      if (!appointments || appointments.length === 0) {
        return res
          .status(404)
          .json({ message: "No appointments found for this branch" });
      }

      // Step 4: Fetch reviews for the appointments
      const reviews = await Review.find({
        appointment: {
          $in: appointments.map((appointment) => appointment._id),
        },
      })
        .populate("stylist", "name")
        .populate("customer", "username");

      if (!reviews || reviews.length === 0) {
        return res
          .status(404)
          .json({ message: "No reviews found for this branch" });
      }

      // Step 5: Return the reviews
      res.status(200).json(reviews);
    } catch (error) {
      console.error("Error fetching reviews for branch:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Update a review
  async update(req, res) {
    const { id } = req.params;
    const { text, stars, title } = req.body;

    try {
      // Find and update the review
      const updatedReview = await Review.findByIdAndUpdate(
        id,
        { title, text, stars, modifiedAt: new Date() },
        { new: true }
      );

      if (!updatedReview) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.status(200).json(updatedReview);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  // Delete a review by id
  async delete(req, res) {
    console.log("ReviewController > delete");
    const { id } = req.params;
    const customer = await Customer.findById(req.userId).populate(
      "appointments"
    );

    const has = customer.appointments.some((appointment) => {
      if (appointment.review) {
        return appointment.review.equals(ObjectId.createFromHexString(id));
      }
    });

    if (!has) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Remove the review from the appointment
      const review = await Review.findByIdAndDelete(id);

      const matchingAppointments = customer.appointments.filter(
        (appointment) => {
          if (appointment.review) {
            return appointment.review.equals(ObjectId.createFromHexString(id));
          }
        }
      );

      for (const appt of matchingAppointments) {
        await Appointment.findByIdAndUpdate(appt._id, {
          $unset: { review: 1 },
        });
      }

      await customer.save();

      if (review) {
        return res.status(200).json({ message: "Review deleted successfully" });
      } else {
        return res.status(400).json({ message: "Error deleting review" });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  async deleteForAdmin(req, res) {
    console.log("ReviewController > delete");
    const { id } = req.params;
    console.log(id);
    try {
    let review = await Review.findById(id);
    const appointment = await Appointment.findById(review.appointment);

    appointment.review = null;
    await appointment.save();

    review = await Review.findByIdAndDelete(id);

      if (review) {
        return res.status(200).json({ message: "Review deleted successfully" });
      } else {
        return res.status(400).json({ message: "Error deleting review" });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  // Retrieve reviews for a specific stylist
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
      if (!element.review) {
        continue;
      }
      const review = await Review.findById(element.review);
      temp.push({
        text: review.text,
        stars: review.stars,
        title: review.title,
        customer: element.customer,
      });
    }
    if (temp.length === 0) {
      return res.status(404).json({ message: "No reviews found" });
    }
    return res.status(200).json(temp);
  },
  // stylist page
  async retrieveStylistReviews1(req, res) {
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
      if (!element.review) {
        continue;
      }
      const review = await Review.findById(element.review);
      if (review) {
        temp.push({
        _id: review._id,
        text: review.text,
        stars: review.stars,
        title: review.title,
        customer: element.customer,
      });
      }
      
    }

    if (temp) {
      return res.status(200).json(temp);
    } else {
      return res.status(400).json({ message: "Error retrieving reviews" });
    }
  },
};

module.exports = ReviewController;

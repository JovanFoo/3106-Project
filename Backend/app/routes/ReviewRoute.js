const express = require("express");

const ReviewRouter = express.Router();
const ReviewController = require("../controllers/ReviewController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");

// Get single review
ReviewRouter.get("/:id", ReviewController.retrieve);

// Get all reviews
ReviewRouter.get("/", ReviewController.retrieveAllReviews); // could use auth too

// Get reviews for a specific stylist (Customer side)
ReviewRouter.get(
  "/stylist/:stylistId",
  AuthMiddleware.authCustomerToken,
  ReviewController.retrieveStylistReviews
);
// Get reviews for a specific stylist (Admin side)
ReviewRouter.get(
  "/:stylistId/stylistReviews",
  AuthMiddleware.authAdminOrStylistToken,
  ReviewController.retrieveStylistReviews1
);

// Get reviews for a specific branch
ReviewRouter.get("/branch/:branchId", ReviewController.retrieveBranchReviews);

// Create a review for a specific appointment (afterwards)
ReviewRouter.post(
  "/:appointmentId",
  AuthMiddleware.authCustomerToken,
  ReviewController.create
);

// Update an existing review
ReviewRouter.put(
  "/:id",
  AuthMiddleware.authCustomerToken,
  ReviewController.update
);

ReviewRouter.delete(
  "/:id/admin",
  AuthMiddleware.authAdminToken,
  ReviewController.deleteForAdmin
);

// Delete a review
ReviewRouter.delete(
  "/:id",
  AuthMiddleware.authCustomerToken,
  ReviewController.delete
);

module.exports = ReviewRouter;

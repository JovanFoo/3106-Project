const express = require("express");

const ReviewRouter = express.Router();
const ReviewController = require("../controllers/ReviewController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");

// get single review
ReviewRouter.get("/:id", ReviewController.retrieve);

// get all reviews
ReviewRouter.get("/", ReviewController.retrieveAllReviews); // could use auth too

// get reviews for a specific stylist (Customer side)
ReviewRouter.get(
  "/stylist/:stylistId",
  AuthMiddleware.authCustomerToken,
  ReviewController.retrieveStylistReviews
);
// get reviews for a specific stylist (Admin side)
ReviewRouter.get(
  "/:stylistId/stylistReviews",
  AuthMiddleware.authAdminOrStylistToken,
  ReviewController.retrieveStylistReviews1
);

// get reviews for a specific branch
ReviewRouter.get("/branch/:branchId", ReviewController.retrieveBranchReviews);

// create a review for a specific appointment (afterwards)
ReviewRouter.post(
  "/:appointmentId",
  AuthMiddleware.authCustomerToken,
  ReviewController.create
);

// update an existing review
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

// delete a review
ReviewRouter.delete(
  "/:id",
  AuthMiddleware.authCustomerToken,
  ReviewController.delete
);

module.exports = ReviewRouter;

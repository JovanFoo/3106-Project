const express = require("express");

const ReviewRouter = express.Router();
const ReviewController = require("../controllers/ReviewController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");

ReviewRouter.get("/:id", ReviewController.retrieve);
ReviewRouter.post(
  "/:appointmentId",
  //   AuthMiddleware.authCustomerToken,
  ReviewController.create
);
// ReviewRouter.put(
//   "/:id",
//   AuthMiddleware.authCustomerToken,
//   ReviewController.update
// );
ReviewRouter.delete(
  "/:id",
  AuthMiddleware.authCustomerToken,
  ReviewController.delete
);

ReviewRouter.get(
  "/:stylistId/stylistReviews",
  ReviewController.retrieveStylistReviews
);

module.exports = ReviewRouter;

const express = require("express");

const DiscountRouter = express.Router();

const DiscountController = require("../controllers/DiscountController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");
const Discount = require("../models/Discount.js");

// get Discount by id
DiscountRouter.get(
  "/:id",
  AuthMiddleware.authCustomerToken,
  DiscountController.retrieve
);
// update Discount by id --> TODO: (only stylist manager can create?)
DiscountRouter.put(
  "/:id",
  AuthMiddleware.authStylistManagerToken,
  DiscountController.update
);
// create Discount by id --> TODO: (only stylist manager can create?)
DiscountRouter.put(
  "/",
  AuthMiddleware.authStylistManagerToken,
  DiscountController.create
);
// delete Discount by id --> TODO: (only stylist manager can create?)
DiscountRouter.delete(
  "/:id",
  AuthMiddleware.authStylistManagerToken,
  DiscountController.delete
);

module.exports = DiscountRouter;

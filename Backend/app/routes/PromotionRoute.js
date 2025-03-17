const express = require("express");

const PromotionRouter = express.Router();

const PromotionController = require("../controllers/PromotionController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");
const Promotion = require("../models/Promotion.js");
// get promo by id
PromotionRouter.get(
  "/:id",
  AuthMiddleware.authCustomerToken,
  PromotionController.retrieve
);
// update promo by id
PromotionRouter.put(
  "/:id",
  AuthMiddleware.authCustomerToken,
  PromotionController.update
);
// delete promo by id (only a login customer can delete their account)
PromotionRouter.delete(
  "/",
  AuthMiddleware.authCustomerToken,
  PromotionController.delete
);

module.exports = PromotionRouter;

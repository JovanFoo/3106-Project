const express = require("express");

const GalleryRouter = express.Router();

const GalleryController = require("../controllers/GalleryController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");

// get list of all galleries for a stylist
GalleryRouter.get(
  "/all/:id",
  // AuthMiddleware.authCustomerOrStylistToken,
  GalleryController.retrieveAll
);
// get gallery by id anyone can access
GalleryRouter.get("/:id", GalleryController.retrieve);
// create a new gallery (only logged in stylist can create)
GalleryRouter.post(
  "/",
  AuthMiddleware.authStylistToken,
  GalleryController.create
);

GalleryRouter.delete(
  "/:id",
  AuthMiddleware.authStylistToken,
  GalleryController.delete
);
module.exports = GalleryRouter;

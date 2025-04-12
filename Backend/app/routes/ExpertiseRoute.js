const express = require("express");

const ExpertiseRouter = express.Router();

const ExpertiseController = require("../controllers/ExpertiseController.js");
const AuthMiddleware = require("../middlewares/AuthMiddleware.js");
const Expertise = require("../models/Expertise.js");

ExpertiseRouter.get(
  "/pagination",
  AuthMiddleware.authAdminToken,
  ExpertiseController.getExpertisePagination
);

// get expertise by id
ExpertiseRouter.get(
  "/:id",
  AuthMiddleware.authCustomerToken,
  ExpertiseController.retrieve
);
// get all expertise
ExpertiseRouter.get(
  "/",
  // AuthMiddleware.authCustomerOrStylistToken,
  ExpertiseController.list
);
// add expertise to stylist
ExpertiseRouter.post(
  "/",
  AuthMiddleware.authAdminOrStylistManagerToken,
  ExpertiseController.create
);

// update expertise by id (only admin can update)
ExpertiseRouter.put(
  "/:id",
  AuthMiddleware.authAdminToken,
  ExpertiseController.update
);
// create expertise by id (only admin can create)
// ExpertiseRouter.put(
//   "/",
//   AuthMiddleware.authAdminToken,
//   ExpertiseController.create
// );
// delete expertise by id (only admin can delete)
ExpertiseRouter.delete(
  "/:id",
  AuthMiddleware.authAdminToken,
  ExpertiseController.delete
);

module.exports = ExpertiseRouter;

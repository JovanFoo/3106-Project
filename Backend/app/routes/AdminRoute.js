const express = require("express");

const AdminRouter = express.Router();
const AdminController = require("../controllers/AdminController");
const AuthMiddleWare = require("../middlewares/AuthMiddleware");

AdminRouter.put("/", AuthMiddleWare.authAdminToken, AdminController.update);
AdminRouter.get(
  "/:id",
  AuthMiddleWare.authAdminToken,
  AdminController.retrieve
);
AdminRouter.put(
  "/profilePicture",
  AuthMiddleWare.authAdminToken,
  AdminController.updateProfilePicture
);

module.exports = AdminRouter;

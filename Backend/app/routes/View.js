const express = require("express");
const { authCustomerResetToken } = require("../middlewares/AuthMiddleware");

const ViewRouter = express.Router();

ViewRouter.get("/reset-password/:token", authCustomerResetToken, (req, res) => {
  res.render("resetPassword", { token: token, userType: "Customer" });
});

module.exports = ViewRouter;

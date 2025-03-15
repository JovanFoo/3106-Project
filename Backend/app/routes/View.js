const express = require("express");
const { authCustomerResetToken } = require("../middlewares/AuthMiddleware");

const ViewRouter = express.Router();

ViewRouter.get("/", (req, res) => res.render("404"));
ViewRouter.post("/", (req, res) => res.send("Express on Vercel"));
ViewRouter.get("/reset-password/:token", authCustomerResetToken, (req, res) => {
  res.render("resetPassword", { token: token, userType: "Customer" });
});

module.exports = ViewRouter;

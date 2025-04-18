const express = require("express");
const { authAnyResetPassword } = require("../middlewares/AuthMiddleware");

const ViewRouter = express.Router();

ViewRouter.get("/", (req, res) => res.render("404.ejs"));
ViewRouter.post("/", (req, res) => res.send("Express on Vercel"));
ViewRouter.get("/reset-password/:token", authAnyResetPassword, (req, res) => {
  token = req.params.token;
  res.render("resetPassword", { token: token, userType: req.userType });
});
ViewRouter.get("/success-update", (req, res) => res.render("success-update"));
ViewRouter.get("/unsuccessful-update", (req, res) =>
  res.render("unsuccessful-update")
);
ViewRouter.get("/error", (req, res) => res.render("404"));

module.exports = ViewRouter;

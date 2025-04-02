const jwt = require("../utils/jwt.js");
const AuthMiddleware = {
  // Single Auth Middleware
  // Middleware to check if the user is Customer
  async authCustomerToken(req, res, next) {
    console.log("AuthMiddleware > only Customer can access");
    token = req.headers["authorization"];
    console.log(token);
    if (token == null) return res.status(401).json({ message: "Unauthorized" });
    decoded = jwt.decodeToken(token);
    if (!decoded.status)
      return res.status(401).json({ message: "Unauthorized" });
    if (decoded.values.type != "Customer")
      return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.values.userId;
    next();
  },
  // Middleware to check if the user is Stylist
  async authStylistToken(req, res, next) {
    console.log("AuthMiddleware > only Stylist can access");
    token = req.headers["authorization"];
    if (token == null) return res.status(401).json({ message: "Unauthorized" });
    decoded = jwt.decodeToken(token);
    if (!decoded.status)
      return res.status(401).json({ message: "Unauthorized" });
    if (
      decoded.values.type != "Stylist" &&
      decoded.values.type != "StylistManager"
    )
      return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.values.userId;
    next();
  },
  // Middleware to check if the user is Stylist Manager
  async authStylistManagerToken(req, res, next) {
    console.log("AuthMiddleware > only Stylist Manager can access");
    token = req.headers["authorization"];
    if (token == null) return res.status(401).json({ message: "Unauthorized" });
    decoded = jwt.decodeToken(token);
    if (!decoded.status)
      return res.status(401).json({ message: "Unauthorized" });
    if (decoded.values.type != "StylistManager")
      return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.values.userId;
    next();
  },
  // Middleware to check if the user is Admin
  async authAdminToken(req, res, next) {
    console.log("AuthMiddleware > only Admin can access");
    token = req.headers["authorization"];
    if (token == null) return res.status(401).json({ message: "Unauthorized" });
    decoded = jwt.decodeToken(token);
    if (!decoded.status)
      return res.status(401).json({ message: "Unauthorized" });
    if (decoded.values.type != "Admin")
      return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.values.userId;
    next();
  },

  // Multiple Auth Middleware
  // Middleware to check if the user is Customer or Stylist
  async authCustomerOrStylistToken(req, res, next) {
    console.log("AuthMiddleware > only Customer Or Stylist can access");
    token = req.headers["authorization"];
    if (token == null) return res.status(401).json({ message: "Unauthorized" });
    decoded = jwt.decodeToken(token);
    if (!decoded.status)
      return res.status(401).json({ message: "Unauthorized" });
    if (decoded.values.type != "Customer" && decoded.values.type != "Stylist")
      return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.values.userId;
    next();
  },
  // Middleware to check if the user is Admin or Stylist
  async authAdminOrStylistToken(req, res, next) {
    console.log("AuthMiddleware > only Admin or Stylist can access");
    token = req.headers["authorization"];
    if (token == null) return res.status(401).json({ message: "Unauthorized" });
    decoded = jwt.decodeToken(token);
    if (!decoded.status)
      return res.status(401).json({ message: "Unauthorized" });
    if (
      decoded.values.type != "Admin" &&
      decoded.values.type != "Stylist" &&
      decoded.values.type != "StylistManager"
    )
      return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.values.userId;
    next();
  },
  // Middleware to check if the user is Admin or Stylist Manager
  async authAdminOrStylistManagerToken(req, res, next) {
    console.log("AuthMiddleware > only Admin or Stylist Manager can access");
    token = req.headers["authorization"];
    if (token == null) return res.status(401).json({ message: "Unauthorized" });
    decoded = jwt.decodeToken(token);
    if (!decoded.status)
      return res.status(401).json({ message: "Unauthorized" });
    if (
      decoded.values.type != "Admin" &&
      decoded.values.type != "StylistManager"
    )
      return res.status(401).json({ message: "Unauthorized" });
    req.userId = decoded.values.userId;
    next();
  },

  // Middleware to check if the user is Admin/Stylist Manager/customer (for teams purpose)

  async authCustomerStylistOrManagerToken(req, res, next) {
    console.log(
      "AuthMiddleware > allow Customer, Stylist, Admin, or StylistManager"
    );

    const token = req.headers["authorization"];
    if (token == null) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.decodeToken(token);
    if (!decoded.status)
      return res.status(401).json({ message: "Unauthorized" });

    const role = decoded.values.type;

    if (
      role !== "Customer" &&
      role !== "Stylist" &&
      role !== "Admin" &&
      role !== "StylistManager"
    ) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.userId = decoded.values.userId;
    next();
  },

  // Middleware for reset password
  async authCustomerResetToken(req, res, next) {
    console.log("AuthMiddleware > only Customer with reset can access");
    token = req.params.token;
    if (token == null) return res.render("404");
    decoded = jwt.decodeToken(token);
    if (!decoded.status) return res.render("404");
    if (decoded.values.type != "Customer-Reset") return res.render("404");
    req.userId = decoded.values.userId;
    if (jwt.checkBlackList(token)) return res.render("404");
    next();
  },
  async authStylistResetToken(req, res, next) {
    console.log("AuthMiddleware > only Stylist can access");
    token = req.params.token;
    if (token == null) return res.render("404");
    decoded = jwt.decodeToken(token);
    if (!decoded.status) return res.render("404");
    if (decoded.values.type != "Stylist-Reset") return res.render("404");
    req.userId = decoded.values.userId;
    next();
  },
  async authAdminResetToken(req, res, next) {
    console.log("AuthMiddleware > only Admin can access");
    token = req.params.token;
    if (token == null) return res.render("404");
    decoded = jwt.decodeToken(token);
    if (!decoded.status) return res.render("404");
    if (decoded.values.type != "Admin-Reset") return res.render("404");
    req.userId = decoded.values.userId;
    next();
  },
};

module.exports = AuthMiddleware;

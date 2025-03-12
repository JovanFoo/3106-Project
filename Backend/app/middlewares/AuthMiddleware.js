const jwt = require("../utils/jwt.js");
const AuthMiddleware = {
  async authCustomerToken(req, res, next) {
    console.log("AuthMiddleware > only Customer can access");
    token = req.headers["authorization"];
    if (token == null) return res.json({ message: "Unauthorized" });
    decoded = jwt.decodeToken(token);
    if (!decoded.status) return res.json({ message: "Unauthorized" });
    if (decoded.values.type != "Customer")
      return res.json({ message: "Unauthorized" });
    req.customerId = decoded.values.userId;
    next();
  },
  async authCustomerOrStylistToken(req, res, next) {
    console.log("AuthMiddleware > only Customer Or Stylist can access");
    token = req.headers["authorization"];
    if (token == null) return res.json({ message: "Unauthorized" });
    decoded = jwt.decodeToken(token);
    if (!decoded.status) return res.json({ message: "Unauthorized" });
    if (decoded.values.type != "customer" && decoded.values.type != "stylist")
      return res.json({ message: "Unauthorized" });
    next();
  },
  async authStylistToken(req, res, next) {
    console.log("AuthMiddleware > only Stylist can access");
    token = req.headers["authorization"];
    if (token == null) return res.json({ message: "Unauthorized" });
    decoded = jwt.decodeToken(token);
    if (!decoded.status) return res.json({ message: "Unauthorized" });
    if (decoded.values.type != "Stylist")
      return res.json({ message: "Unauthorized" });
    req.customerId = decoded.values.userId;
    next();
  },
  async authStylistManagerToken(req, res, next) {
    console.log("AuthMiddleware > only Stylist Manager can access");
    token = req.headers["authorization"];
    if (token == null) return res.json({ message: "Unauthorized" });
    decoded = jwt.decodeToken(token);
    if (!decoded.status) return res.json({ message: "Unauthorized" });
    if (decoded.values.type != "Stylist")
      return res.json({ message: "Unauthorized" });
    req.customerId = decoded.values.userId;
    next();
  },
};

module.exports = AuthMiddleware;

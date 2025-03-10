const mongodb = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/SalonFlow";

mongodb.connect(MONGODB_URI);

module.exports = mongodb;

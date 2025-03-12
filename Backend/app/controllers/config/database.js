const mongodb = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

mongodb.connect(MONGODB_URI);

module.exports = mongodb;

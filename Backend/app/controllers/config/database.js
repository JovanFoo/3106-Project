const mongodb = require("mongoose");
const MONGODB_URI = process.env.MONGODB_URI;

// try {
// } catch (error) {
//   mongodb.connect(process.env.MONGODB_URI_DEV);
//   console.log("Error connecting to MongoDB");
//   console.log(error);
// }
const run = async () => {
  await mongodb.connect(MONGODB_URI);
  console.log("Connected to MongoDB");
};

const AdminController = require("../AdminController.js");

run()
  .then((res) => AdminController.initaliseAdmin())
  .catch((err) => console.error(err));

module.exports = mongodb;

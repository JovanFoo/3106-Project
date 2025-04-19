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
let working = false;

setInterval(() => {
  if (working) return;
  run()
    .then((res) => {
      AdminController.initaliseAdmin();
      working = true;
      console.log("MongoDB connection established successfully.");
    })
    .catch((err) => console.error(err));
}, 1000 * 90); // every 1.5 minutes

module.exports = mongodb;

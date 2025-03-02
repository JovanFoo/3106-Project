const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.post("/", (req, res) => {
  console.log("Hello World");
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

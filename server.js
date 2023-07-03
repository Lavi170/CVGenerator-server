const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const userRoutes = require("./routes/user");
const cors = require("cors");
app.use(cors());

mongoose
  .connect(
    `mongodb+srv://lavireichman:lavi11@cluster0.l8vldrc.mongodb.net/?retryWrites=true&w=majority`,
    {}
  )
  .then(() => {
    console.log("Successfully connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.log("Unable to connect to MongoDB Atlas");
    console.error(err);
  });

app.use(bodyParser.json());

app.use("/user", userRoutes);


app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.listen(3006, () => {
  console.log("Server running on port 3006");
});
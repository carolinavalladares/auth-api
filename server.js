require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 4000;

// import route middleware
const authRouter = require("./routes/auth");

// middlewares
app.use(express.json());
app.use(cors());

// route middlewares
app.use("/api/auth", authRouter);

// Connect to DB
mongoose.set("strictQuery", true);
mongoose.connect(
  process.env.DB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to DB");
  }
);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 8080;
const { verifyUser } = require("./middlewares/verifyUser");
const User = require("./models/User");

// import route middleware
const authRouter = require("./routes/auth");
const postRouter = require("./routes/posts");
const timelineRouter = require("./routes/timeline");
const usersRouter = require("./routes/users");

// middlewares
app.use(express.json());
app.use(cors());

// route middlewares
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/timeline", timelineRouter);
app.use("/api/users", usersRouter);

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

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateRegister, validateLogin } = require("../utils/validation");
const { verifyUser } = require("../middlewares/verifyUser");

router.get("/user", verifyUser, (req, res) => {
  const { user } = req;

  if (!user) {
    res.status(400).send("No user found");
  }

  res
    .status(200)
    .send({ username: user.username, email: user.email, id: user._id });
});

router.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  const { error } = validateRegister(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const userExists = await User.findOne({ email: email });
  if (userExists) return res.status(401).send("User already exists");

  //   hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    // create user
    const newUser = new User({
      email,
      password: hashedPassword,
      username,
    });
    const user = await newUser.save();
    res
      .status(200)
      .send({ userCreated: { username: user.username, email: user.email } });
  } catch (error) {
    res.status(400).send(error);
  }
});

// login
router.post("/login", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { email, password } = req.body;

  const userExists = await User.findOne({ email: email });
  if (!userExists) return res.status(404).send("User does not exist.");

  const validated = await bcrypt.compare(password, userExists.password);

  if (validated) {
    const token = jwt.sign({ userId: userExists._id }, process.env.JWT_SECRET);

    res.status(200).send({
      user: {
        id: userExists._id,
        username: userExists.username,
        email: userExists.email,
      },
      token: token,
    });
  } else {
    res.status(403).send("Email or password incorrect.");
  }
});

module.exports = router;

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

  res.status(200).send({
    profileImage: user.profileImage,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    id: user._id,
    followers: user.followers,
    following: user.following,
    favourites: user.favourites,
    posts: user.posts,
    createdAt: user.createdAt,
  });
});

router.post("/register", async (req, res) => {
  const { email, password, username, displayName, profileImage } = req.body;

  const { error } = validateRegister(req.body);
  if (error)
    return res
      .status(400)
      .json({ message: error.details[0].message, status: 400 });

  const userExists = await User.findOne({ email: email });
  if (userExists)
    return res
      .status(401)
      .json({ message: "User already exists", status: 401 });

  const usernameExists = await User.findOne({ username: username });
  if (usernameExists)
    return res.status(401).json({ message: "username not available" });

  //   hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    // create user
    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      displayName,
      profileImage,
    });
    const user = await newUser.save();
    res.status(201).json({
      userCreated: {
        profileImage: user.profileImage,
        displayName: user.displayName,
        username: user.username,
        email: user.email,
        id: user._id,
      },
      status: 201,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error creating user",
      status: 400,
    });
  }
});

// login
router.post("/login", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send("Error");

  const { email, password } = req.body;
  const userExists = await User.findOne({ email: email });
  if (!userExists)
    return res
      .status(404)
      .json({ message: "User does not exist", status: 404 });

  const validated = await bcrypt.compare(password, userExists.password);

  if (validated) {
    const token = jwt.sign({ userId: userExists._id }, process.env.JWT_SECRET);

    res.status(200).send({
      user: {
        profileImage: userExists.profileImage,
        createdAt: userExists.createdAt,
        id: userExists._id,
        displayName: userExists.displayName,
        username: userExists.username,
        email: userExists.email,
        followers: userExists.followers,
        following: userExists.following,
        favourites: userExists.favourites,
        posts: userExists.posts,
      },
      token: token,
    });
  } else {
    res.status(403).send("Email or password incorrect.");
  }
});

module.exports = router;

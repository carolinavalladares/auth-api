const express = require("express");
const router = express.Router();
const { verifyUser } = require("../middlewares/verifyUser");
const User = require("../models/User");

router.get("/all", verifyUser, async (req, res) => {
  const { user } = req;
  try {
    const users = await User.find({ _id: { $ne: user._id } });

    res.status(200).json({ users });
  } catch (error) {
    res.status(400).json({ message: "Couldn't get users", status: 400, error });
  }
});

router.get("/:id", verifyUser, async (req, res) => {
  const { id } = req.params;

  try {
    const {
      username,
      displayName,
      email,
      _id,
      followers,
      following,
      createdAt,
      profileImage,
    } = await User.findById(id);

    res.status(200).json({
      status: 200,
      user: {
        username,
        displayName,
        email,
        _id,
        followers,
        following,
        createdAt,
        profileImage,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "Couldn't get user", status: 400, error });
  }
});

module.exports = router;

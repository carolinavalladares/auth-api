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

router.patch("/follow/:id", verifyUser, async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  try {
    const loggedInUser = await User.findById(user._id);

    if (loggedInUser.following.includes(id)) {
      return res
        .status(401)
        .json({ message: "Already following user", status: 401 });
    }

    loggedInUser.following.push(`${id}`);
    const updatedLoggedInUser = await loggedInUser.save();

    const followedUser = await User.findById(id);
    followedUser.followers.push(`${user._id}`);
    const updatedFollowedUser = await followedUser.save();

    res
      .status(200)
      .json({ updatedLoggedInUser, updatedFollowedUser, status: 200 });
  } catch (error) {
    res.status(400).json({ message: "update failed", status: 400, error });
  }
});

router.delete("/unfollow/:id", verifyUser, async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  try {
    const loggedInUser = await User.findById(`${user._id}`);

    if (!loggedInUser.following.includes(id)) {
      return res
        .status(401)
        .json({ message: "Not following user", status: 401 });
    }

    const indexOfUserIdFollowing = loggedInUser.following.indexOf(id);
    loggedInUser.following.splice(indexOfUserIdFollowing, 1);
    await loggedInUser.save();

    const unfollowedUser = await User.findById(`${id}`);
    const indexOfUserIdFollower = unfollowedUser.followers.indexOf(user._id);
    unfollowedUser.followers.splice(indexOfUserIdFollower, 1);
    await unfollowedUser.save();

    res.status(200).json({ status: 200, unfollowedUser, loggedInUser });
  } catch (error) {
    res
      .status(400)
      .json({ message: "error unfollowing user", status: 400, error });
  }
});

module.exports = router;

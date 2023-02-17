const express = require("express");
const router = express.Router();
const { verifyUser } = require("../middlewares/verifyUser");
const Timeline = require("../models/Timeline");

router.get("/all", verifyUser, async (req, res) => {
  try {
    const docs = await Timeline.find({});

    // const postIds = docs.map((doc) => {
    //   return { postId: doc.postId };
    // });

    res.status(200).json({ posts: docs, status: 200 });
  } catch (error) {
    res.status(400).json({ message: "Couldn't get posts", status: 400, error });
  }
});

router.get("/user-timeline", verifyUser, async (req, res) => {
  try {
    const docs = await Timeline.find({});

    //    Logic to determin which posts will be sent according to user's follows here

    res.status(200).json({ posts: docs, status: 200 });
  } catch (error) {
    res.status(400).json({ message: "Couldn't get posts", status: 400, error });
  }
});

module.exports = router;

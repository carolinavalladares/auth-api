const express = require("express");
const router = express.Router();
const { verifyUser } = require("../middlewares/verifyUser");
const Timeline = require("../models/Timeline");
const Posts = require("../models/Post");

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
  const { user } = req;

  try {
    //Logic to determin which posts will be sent back according to user's follows here
    const userTimeline = await Timeline.find({
      authorId: {
        $in: user.following,
      },
    });

    const postIds = userTimeline.map((doc) => {
      return doc.postId;
    });

    const postsFollowing = await Posts.find(
      {
        _id: { $in: postIds },
      },
      {},
      { sort: { createdAt: -1 } }
    );

    const myPosts = await Posts.find(
      { authorId: user._id },
      {},
      { sort: { createdAt: -1 } }
    );

    const allPosts = [...myPosts, ...postsFollowing].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({
      posts: allPosts,
      status: 200,
    });
  } catch (error) {
    res.status(400).json({ message: "Couldn't get posts", status: 400, error });
  }
});

module.exports = router;

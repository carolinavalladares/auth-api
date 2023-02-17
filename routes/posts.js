const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const TimelinePost = require("../models/Timeline");
const { verifyUser } = require("../middlewares/verifyUser");
const { validatePost } = require("../utils/validation");

router.get("/", (req, res) => {
  res.send("Hello");
});

// Add new post
router.post("/add-new", verifyUser, async (req, res) => {
  const { content } = req.body;
  const { user } = req;

  const { error } = validatePost(req.body);
  if (error)
    return res.status(400).json({ message: "no content", status: 400, error });

  try {
    const post = new Post({
      authorId: `${user._id}`,
      author: {
        username: user.username,
        displayName: user.displayName,
        profileImage: user.profileImage,
      },
      content: content,
    });

    const newPost = await post.save();

    const timelinePost = new TimelinePost({
      postId: newPost._id,
      authorId: user._id,
    });

    const newTimelinePost = await timelinePost.save();

    res.status(201).json({ newPost, newTimelinePost, status: 201 });
  } catch (error) {
    return res.status(400).json({
      message: "Error creating post",
      status: 400,
      error,
    });
  }
});

router.get("/user-posts", verifyUser, async (req, res) => {
  const { user } = req;

  Post.find(
    { authorId: user._id },
    {},
    { sort: { createdAt: -1 } },
    (error, posts) => {
      if (error) {
        return res
          .status(400)
          .json({ message: "Couldn't get posts", status: 400, error });
      }

      res.status(200).json({ status: 200, posts });
    }
  );
});

module.exports = router;

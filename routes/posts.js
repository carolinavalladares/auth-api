const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
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

      const postsArr = posts.map((post) => {
        return {
          authorId: post.authorId,
          author: post.author,
          favourites: post.favourites,
          content: post.content,
          updatedAt: post.updatedAt,
          createdAt: post.createdAt,
          id: post._id,
          comments: post.comments,
        };
      });

      res.status(200).json({ status: 200, posts: postsArr });
    }
  );
});

router.get("/list/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const posts = await Post.find(
      { authorId: { $eq: id } },
      {},
      { sort: { createdAt: -1 } }
    );

    const postsArr = posts.map((post) => {
      return {
        authorId: post.authorId,
        author: post.author,
        favourites: post.favourites,
        content: post.content,
        updatedAt: post.updatedAt,
        createdAt: post.createdAt,
        id: post._id,
        comments: post.comments,
      };
    });

    res.status(200).json({ status: 200, posts: postsArr });
  } catch (error) {
    res.status(400).json({ message: "Couldn't get posts", status: 400, error });
  }
});

router.get("/get-one/:id", verifyUser, async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    const postObj = {
      authorId: post.authorId,
      author: post.author,
      favourites: post.favourites,
      content: post.content,
      updatedAt: post.updatedAt,
      createdAt: post.createdAt,
      id: post._id,
      comments: post.comments,
    };

    res.status(200).json({ status: 200, post: postObj });
  } catch (error) {
    res.status(404).json({ message: "Post not found", status: 404, error });
  }
});

router.delete("/delete-one/:id", verifyUser, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFromTimeline = await TimelinePost.deleteOne({ postId: id });

    const post = await Post.deleteOne({ _id: id });
    const timelinePost = await TimelinePost.deleteOne({ postId: id });
    const comments = await Comment.deleteMany({ postId: id });

    res.status(200).json({
      status: 200,
      deletedPost: {
        authorId: post.authorId,
        author: post.author,
        favourites: post.favourites,
        content: post.content,
        updatedAt: post.updatedAt,
        createdAt: post.createdAt,
        id: post._id,
        comments: post.comments,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete post", status: 400 });
  }
});

router.patch("/update-one/:id", verifyUser, async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  const { content } = req.body;

  if (!content)
    return req.status(400).json({
      message: "unable to update post, please send content",
      status: 400,
    });

  const post = await Post.findById(id);

  if (!post)
    return res.status(404).json({ message: "No post found", status: 404 });

  if (post.authorId != user._id) {
    return res.status(401).json({
      message: "You do not have permission to edit this post",
      status: 401,
    });
  }

  try {
    const date = new Date();

    post.content = content;
    post.updatedAt = date;
    await post.save();

    res.status(200).json({
      post: {
        authorId: post.authorId,
        author: post.author,
        favourites: post.favourites,
        content: post.content,
        updatedAt: post.updatedAt,
        createdAt: post.createdAt,
        id: post._id,
        comments: post.comments,
      },
      status: 200,
    });
  } catch (error) {
    res
      .status(400)
      .json({ status: 400, message: "Error while editing post", error });
  }
});

router.patch("/like-post/:id", verifyUser, async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "post not found", status: 404 });
    }

    if (post.favourites.includes(`${user._id}`)) {
      return res
        .status(400)
        .json({ message: "already liked post", status: 400 });
    }

    post.favourites.push(`${user._id}`);
    await post.save();

    res.status(200).json({
      status: 200,
      post: {
        authorId: post.authorId,
        author: post.author,
        favourites: post.favourites,
        content: post.content,
        updatedAt: post.updatedAt,
        createdAt: post.createdAt,
        id: post._id,
        comments: post.comments,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "Error", status: 400, error });
  }
});

router.patch("/dislike-post/:id", verifyUser, async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post)
      return res.status(404).json({ message: "post not found", status: 400 });

    if (!post.favourites.includes(`${user._id}`))
      return res
        .status(404)
        .json({ message: "User did not like the post", status: 400 });

    const userIdIndex = post.favourites.indexOf(user._id);

    post.favourites.splice(userIdIndex, 1);
    await post.save();

    res.status(200).json({
      post: {
        authorId: post.authorId,
        author: post.author,
        favourites: post.favourites,
        content: post.content,
        updatedAt: post.updatedAt,
        createdAt: post.createdAt,
        id: post._id,
        comments: post.comments,
      },
      status: 200,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Couldn't dislike post", status: 400, error });
  }
});

router.post("/add-comment/:id", verifyUser, async (req, res) => {
  const { user } = req;
  const { content } = req.body;
  const { id } = req.params;

  if (!content || !id) {
    return res
      .status(400)
      .json({ message: "required data missing", status: 400 });
  }

  try {
    const newComment = new Comment({
      content: content,
      postId: id,
      authorId: `${user._id}`,
      author: {
        username: user.username,
        displayName: user.displayName,
        profileImage: user.profileImage,
      },
    });

    await newComment.save();

    const savedComment = {
      authorId: newComment.authorId,
      author: newComment.author,
      postId: newComment.postId,
      id: newComment._id,
      content: newComment.content,
    };

    const post = await Post.findById(id);

    post.comments.push(`${newComment._id}`);

    await post.save();

    res.status(200).json({ newComment: savedComment, status: 200 });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to created comment", status: 400, error });
  }
});

router.get("/get-comments/:id", verifyUser, async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    const commentsArr = await Comment.find(
      { _id: { $in: post.comments } },
      {},
      { sort: { createdAt: -1 } }
    );

    const comments = commentsArr.map((item) => {
      return {
        author: item.author,
        authorId: item.authorId,
        content: item.content,
        id: item._id,
        createdAt: item.createdAt,
      };
    });

    res.status(200).json({ status: 200, comments });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error fetching comments", status: 400, error });
  }
});

module.exports = router;

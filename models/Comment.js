const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  author: {
    username: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", CommentSchema);

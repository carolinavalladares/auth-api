const mongoose = require("mongoose");

const UserId = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
});

const PostSchema = mongoose.Schema({
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
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  favourites: {
    type: [UserId],
    default: [],
  },
});

module.exports = mongoose.model("Post", PostSchema);

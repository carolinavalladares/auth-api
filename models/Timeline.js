const mongoose = require("mongoose");

const TimelinePostSchema = mongoose.Schema({
  postId: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TimelinePost", TimelinePostSchema);

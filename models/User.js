const mongoose = require("mongoose");

// const UserId = new mongoose.Schema({
//   userId: {
//     type: String,
//     required: true,
//   },
// });

const postId = new mongoose.Schema({
  postId: {
    type: String,
    required: true,
  },
});

const UserSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: "",
  },
  username: {
    type: String,
    required: true,
    min: 3,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  favourites: {
    type: [postId],
    default: [],
  },
  followers: {
    type: [String],
    default: [],
  },
  following: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", UserSchema);

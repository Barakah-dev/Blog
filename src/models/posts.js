const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  body: {
    type: String,
    // required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const Posts = mongoose.model("post", PostSchema);
module.exports = Posts;
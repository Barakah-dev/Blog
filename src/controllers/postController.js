const Posts = require("../models/posts");
// const Redis = require("ioredis");
// const redis = new Redis({ port: 52800, host: "localhost" });
const { invalidatePostsKeys, redis } = require("../middleware/cacheMiddleware");

exports.redis = redis;
exports.createPost = async (req, res) => {
  try {
    const { title, category, body, author } = req.body;

    if (!title || !category || !body) {
      return res.status(400).json({ status: false, message: "Please input all fields!" });
    }
    const newPost = new Posts({ title, category, body, author: req.user.id });

    await newPost.save();

    invalidatePostsKeys(newPost);
    
    res.status(200).json({
      status: true,
      message: "Operation successful",
      data: newPost
    });
  } catch (error) {
    res.status(500).json({ status: false, error: "An error occurred while creating the post" });
  }
};

exports.fetchAllPosts = async (req, res) => {
  try {
    const allPosts = await Posts.find(
      {
        isDeleted: { $ne: true},
        deletedAt: null
      },
      "author title category body createdAt updatedAt"
    ).populate({
      path: "author",
      select: "firstName lastName userName -_id"
    });

    if (allPosts.length === 0) {
      return res.status(404).json({ error: "Posts do not exist!" });
    }

    res.status(200).json({
      status: true,
      message: "Operation successful", 
      data: allPosts
    });
  } catch (error) {
    res.status(500).json({ status: false, error: "An error occurred while fetching posts" });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ status: false, error: "Title query parameter is required" });
    }

    const post = await Posts.findById(id, "author title category body createdAt updatedAt");

    if (!post || post.isDeleted === true || post.deletedAt) {
      return res.status(404).json({ status: false, message: "Post does not exist!" });
    }

    res.status(200).json({
      status: true,
      message: "Operation successful", 
      data: post
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching the post" });
  }
}

exports.fetchPostByTitle = async (req, res) => {
  try {
    const { title } = req.params;
    if (!title) {
      return res.status(400).json({ error: "Title query parameter is required" });
    }

    const post = await Posts.findOne(
      {title},
      "author title category body createdAt updatedAt"
    )
    if (!post || post.isDeleted === true || post.deletedAt) {
      return res.status(404).json({ status: false, message: "Post does not exist!" });
    }

    res.status(200).json({
      status: true,
      message: "Operation successful",
      data: post
    })
  } catch (error) {
    res.status(500).json({ status: false, error: "An error occurred while fetching posts" });
  }
}

exports.fetchPostByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    if (!category) {
      return res.status(400).json({ error: "Category query parameter is required" });
    }

    const posts = await Posts.find(
      {
        category,
        isDeleted: {$ne: true},
        deletedAt: null
      },
      "author title category body createdAt updatedAt"
    ).populate({
      path: "author",
      select: "firstName lastName userName -_id"
    });

    if (posts.length == 0) {
      return res.status(404).json({ error: "Posts do not exist in this category" });
    }

    res.status(200).json({
      status: true,
      message: "Operation successful",
      data: posts
    })
  } catch (error) {
    res.status(500).json({ status: false, error: "An error occurred while fetching posts" });
  }
}

exports.updatePost = async (req, res) => {
  try {
    const {id, title, category, body} = req.body;
    const postToUpdate = await Posts.findById(
      id,
      "author title category body createdAt updatedAt"
    );

    if (!postToUpdate || postToUpdate.isDeleted === true || postToUpdate.deletedAt) {
      return res.status(404).json({ status: false, message: "Post does not exist!" })
    }

    postToUpdate.title = title;
    postToUpdate.category = category;
    postToUpdate.body = body;
    const updatedPost = await postToUpdate.save();

    invalidatePostsKeys(updatedPost);

    res.status(200).json({
      status: true,
      message: "Operation successful!",
      data: updatedPost
    })
  } catch (error) {
    res.status(500).json({ status: false, error: "An error occurred while updating the post" });
  }
}

exports.deletePost = async (req, res) => {
  try {
    const id = req.params.id;

    const postToDelete = await Posts.findByIdAndUpdate(
      id, {isDeleted: true, deletedAt: new Date()}
    );

    if (!postToDelete || postToDelete.isDeleted === true || postToDelete.deletedAt) {
      return res.status(404).json({ status: false, message: "Post does not exist!" })
    }

    invalidatePostsKeys(postToDelete);

    res.status(200).json({ status: true, message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, error: "An error occurred while deleting the post" });
  }
}

exports.hardDelete = async(req, res) => {
  try {
    const id = req.params.id;

    const deletedPost = await Posts.findByIdAndDelete(id);
    if (!deletedPost || deletedPost.isDeleted === true || deletedPost.deletedAt) {
      return res.status(404).json({ status: false, message: "Post does not exist!" })
    }

    invalidatePostsKeys(deletedPost);

    res.status(200).json({ status: true, message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, error: "An error occurred while deleting the post" });
  }
}

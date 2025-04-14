const express = require("express");
const PostController = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");
const { cacheMiddleware } = require("../middleware/cacheMiddleware");

const postRouter = express.Router();

postRouter.use(authMiddleware);

postRouter.post("/", PostController.createPost);

postRouter.get("/", cacheMiddleware, PostController.fetchAllPosts);

postRouter.get("/:id", cacheMiddleware, PostController.getPostById);

postRouter.get("/title/:title", cacheMiddleware, PostController.fetchPostByTitle);

postRouter.get("/category/:category", cacheMiddleware, PostController.fetchPostByCategory);

postRouter.put("/update", PostController.updatePost);

postRouter.delete("/:id", PostController.deletePost);

// postRouter.delete("/:id", PostController.hardDelete);

module.exports = postRouter;
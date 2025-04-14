const express = require("express");
const UserController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { cacheMiddleware } = require("../middleware/cacheMiddleware")

const userRouter = express.Router();

userRouter.post("/signup", UserController.userSignUp);

userRouter.post("/login", UserController.logIn);

userRouter.use(authMiddleware);

userRouter.get("/", cacheMiddleware, UserController.fetchAllUsers);

userRouter.get("/:id", cacheMiddleware, UserController.getUserById);

userRouter.patch("/update", UserController.updateUser);

userRouter.delete("/:id", UserController.deleteUser);

// userRouter.delete("/:id", UserController.hardDelete);

module.exports = userRouter;
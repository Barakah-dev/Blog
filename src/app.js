const express = require("express");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const helmet = require("helmet");

const appRouter = express.Router();
const app = express();
app.use(helmet());

appRouter.use("/posts", postRoutes);
appRouter.use("/users", userRoutes);

module.exports = appRouter;
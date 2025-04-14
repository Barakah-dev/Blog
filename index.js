const express = require("express");
const connectToDb = require("./src/config/db");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const appRouter = require("./src/app");

const PORT = process.env.PORT || 8001;

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended: true}));

connectToDb();

app.use("/api/v1", appRouter)

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
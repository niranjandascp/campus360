require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");


const connectDB = require("./config/db");

const path = require("path");

const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");

connectDB();

const app = express();

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", homeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀Server running at http://localhost:${PORT}`
  );
});
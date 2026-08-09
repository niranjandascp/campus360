require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./config/db");

const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");
const lostFoundRoutes = require("./routes/lostFoundRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { initSocket } = require("./socket");

connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io server
initSocket(server);

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
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
app.use("/api/lost-found", lostFoundRoutes);
app.use("/api", messageRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found"
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(
    `🚀Server running with Socket.io at http://localhost:${PORT}`
  );
});
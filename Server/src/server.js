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
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const eventRoutes = require("./routes/eventRoutes");
const { initSocket } = require("./socket");

const User = require("./models/User");

connectDB().then(() => {
  seedAdminUser();
});

const seedAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ email: "admin@campus360.edu" });
    if (!adminExists) {
      await User.create({
        name: "System Administrator",
        email: "admin@campus360.edu",
        password: "admin123",
        role: "admin",
        userId: "CMP-888888",
        department: "Administration",
        year: "Faculty"
      });
      console.log("👑 Default Admin Account created: admin@campus360.edu / admin123");
    }
  } catch (err) {
    console.error("Error seeding default admin:", err.message);
  }
};

const app = express();
const server = http.createServer(app);

// Initialize Socket.io server
initSocket(server);

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.startsWith("http://localhost:")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
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
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", messageRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found"
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(
    `🚀 Server running with Socket.io at http://localhost:${PORT}`
  );
});
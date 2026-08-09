const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
};

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      department,
      year
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      department,
      year
    });

    if (!user.userId) {
      user.userId = `CMP-${Math.floor(100000 + Math.random() * 900000)}`;
      await user.save();
    }

    res.status(201).json({
      message: "Registration successful",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.userId,
        department: user.department || "",
        year: user.year || ""
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email })
      .select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordCorrect = await user.comparePassword(password);

    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (!user.userId) {
      user.userId = `CMP-${Math.floor(100000 + Math.random() * 900000)}`;
      await user.save();
    }

    res.json({
      message: "Login successful",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.userId,
        department: user.department || "",
        year: user.year || ""
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Admin email and password are required"
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid admin credentials"
      });
    }

    const passwordCorrect = await user.comparePassword(password);

    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Invalid admin credentials"
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied: Admin authorization required. Normal student accounts cannot log in through the Admin Portal."
      });
    }

    if (!user.userId) {
      user.userId = `CMP-${Math.floor(100000 + Math.random() * 900000)}`;
      await user.save();
    }

    res.json({
      message: "Admin authentication successful",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.userId,
        department: user.department || "",
        year: user.year || ""
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  adminLogin
};
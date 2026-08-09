const express = require("express");
const User = require("../models/User");
const Issue = require("../models/Issue");
const LostFound = require("../models/LostFound");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// GET /api/users/search
router.get("/search", protect, async (req, res) => {
  try {
    const { q, department, role } = req.query;
    const filter = { _id: { $ne: req.user._id } };

    if (q) {
      const searchRegex = new RegExp(q, "i");
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
        { userId: searchRegex },
        { year: searchRegex }
      ];
    }

    if (department) filter.department = new RegExp(department, "i");
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select("name email department year role userId avatar createdAt")
      .sort({ name: 1 })
      .limit(30);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/me
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.userId) {
      user.userId = `CMP-${Math.floor(100000 + Math.random() * 900000)}`;
      await user.save();
    }

    const issuesCount = await Issue.countDocuments({ reportedBy: user._id });
    const lostFoundCount = await LostFound.countDocuments({ reportedBy: user._id });

    res.json({
      ...user.toObject(),
      stats: { issuesReported: issuesCount, lostFoundPosts: lostFoundCount }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/users/profile - Update name/dept/year/userId
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, department, year, userId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name.trim();
    if (department !== undefined) user.department = department.trim();
    if (year !== undefined) user.year = year.trim();

    if (userId && userId.trim() !== user.userId) {
      const existing = await User.findOne({ userId: userId.trim(), _id: { $ne: user._id } });
      if (existing) return res.status(400).json({ message: "Campus User ID is already taken" });
      user.userId = userId.trim();
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.userId,
        department: user.department,
        year: user.year,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/users/avatar - Upload profile picture
router.post("/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.avatar = avatarUrl;
    await user.save();

    res.json({
      message: "Profile picture updated successfully",
      avatar: avatarUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.userId,
        department: user.department,
        year: user.year,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/users/:identifier
router.get("/:identifier", protect, async (req, res) => {
  try {
    const { identifier } = req.params;
    let user;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(identifier).select("name email department year role userId avatar createdAt");
    }

    if (!user) {
      user = await User.findOne({ userId: identifier }).select("name email department year role userId avatar createdAt");
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    const issuesCount = await Issue.countDocuments({ reportedBy: user._id });
    const lostFoundCount = await LostFound.countDocuments({ reportedBy: user._id });

    res.json({
      ...user.toObject(),
      stats: { issuesReported: issuesCount, lostFoundPosts: lostFoundCount }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

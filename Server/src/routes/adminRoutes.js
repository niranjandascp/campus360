const express = require("express");
const User = require("../models/User");
const Issue = require("../models/Issue");
const LostFound = require("../models/LostFound");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin middleware check
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access required" });
  }
};

// GET /api/admin/stats - System Analytics Overview
router.get("/stats", protect, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalIssues = await Issue.countDocuments();
    const openIssues = await Issue.countDocuments({ status: "open" });
    const inProgressIssues = await Issue.countDocuments({ status: "in-progress" });
    const resolvedIssues = await Issue.countDocuments({ status: "resolved" });

    const totalLostFound = await LostFound.countDocuments();
    const activeLostFound = await LostFound.countDocuments({ status: "active" });
    const claimedLostFound = await LostFound.countDocuments({ status: "claimed" });

    const totalConversations = await Conversation.countDocuments();
    const totalMessages = await Message.countDocuments();

    // Category breakdown for issues
    const issueCategories = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.json({
      users: { total: totalUsers },
      issues: {
        total: totalIssues,
        open: openIssues,
        inProgress: inProgressIssues,
        resolved: resolvedIssues,
        categories: issueCategories
      },
      lostFound: {
        total: totalLostFound,
        active: activeLostFound,
        claimed: claimedLostFound
      },
      messaging: {
        conversations: totalConversations,
        messages: totalMessages
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/users - Get all users for admin management
router.get("/users", protect, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/users/:id/role - Toggle/Update User Role (student / admin)
router.put("/users/:id/role", protect, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({
      message: `User role updated to ${role}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        userId: user.userId
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete("/users/:id", protect, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Clean up associated posts
    await Issue.deleteMany({ reportedBy: req.params.id });
    await LostFound.deleteMany({ reportedBy: req.params.id });

    res.json({ message: "User account and associated records deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/issues/:id/status - Update issue status
router.put("/issues/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["open", "in-progress", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    issue.status = status;
    await issue.save();

    res.json({ message: `Issue status updated to ${status}`, issue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/issues/:id - Delete an issue
router.delete("/issues/:id", protect, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    res.json({ message: "Issue deleted by admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/lost-found/:id - Delete a Lost & Found item
router.delete("/lost-found/:id", protect, async (req, res) => {
  try {
    const item = await LostFound.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Lost & Found post not found" });
    }
    res.json({ message: "Lost & Found item deleted by admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

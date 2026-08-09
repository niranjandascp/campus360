const express = require("express");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/conversations - Get all conversations for current user
router.get("/conversations", protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate("participants", "name email department role")
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/conversations/users - Get all users to start new chat
router.get("/conversations/users", protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("name email department role")
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/conversations - Find existing or create new conversation
router.post("/conversations", protect, async (req, res) => {
  try {
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId is required" });
    }

    // Check if conversation already exists between these 2 users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, otherUserId], $size: 2 }
    }).populate("participants", "name email department role");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, otherUserId],
        lastMessage: "",
        lastMessageAt: new Date()
      });

      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        "name email department role"
      );
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/conversations/:id/messages - Get messages for conversation
router.get("/conversations/:id/messages", protect, async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.id
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/conversations/:id - Delete an entire conversation thread
router.delete("/conversations/:id", protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Ensure user is participant
    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: "Not authorized to delete this conversation" });
    }

    // Delete all messages in conversation
    await Message.deleteMany({ conversation: req.params.id });

    // Delete conversation
    await Conversation.findByIdAndDelete(req.params.id);

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/messages/:id - Delete a single message
router.delete("/messages/:id", protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

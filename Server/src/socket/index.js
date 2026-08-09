const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

const onlineUsers = new Map(); // userId -> socketId

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 User connected via Socket.io: ${socket.userId} (socketId: ${socket.id})`);

    // Track online user
    if (socket.userId) {
      onlineUsers.set(socket.userId.toString(), socket.id);
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    }

    // Join conversation room
    socket.on("joinConversation", (conversationId) => {
      if (conversationId) {
        socket.join(conversationId);
        console.log(`User ${socket.userId} joined conversation room: ${conversationId}`);
      }
    });

    // Handle sending message
    socket.on("sendMessage", async ({ conversationId, text }) => {
      try {
        if (!conversationId || !text) return;

        // Save message to MongoDB
        const newMessage = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          text: text.trim(),
          readBy: [socket.userId]
        });

        // Update conversation lastMessage & lastMessageAt
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text.trim(),
          lastMessageAt: new Date()
        });

        // Populate sender info
        const populatedMessage = await Message.findById(newMessage._id).populate(
          "sender",
          "name email"
        );

        // Broadcast to everyone in conversation room
        io.to(conversationId).emit("receiveMessage", populatedMessage);
      } catch (error) {
        console.error("Socket sendMessage error:", error);
        socket.emit("messageError", { message: error.message });
      }
    });

    // Handle delete message event
    socket.on("deleteMessage", async ({ messageId, conversationId }) => {
      try {
        await Message.findByIdAndDelete(messageId);
        io.to(conversationId).emit("messageDeleted", { messageId, conversationId });
      } catch (error) {
        console.error("Socket deleteMessage error:", error);
      }
    });

    // Handle delete conversation event
    socket.on("deleteConversation", async ({ conversationId }) => {
      try {
        await Message.deleteMany({ conversation: conversationId });
        await Conversation.findByIdAndDelete(conversationId);
        io.to(conversationId).emit("conversationDeleted", { conversationId });
      } catch (error) {
        console.error("Socket deleteConversation error:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId.toString());
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
        console.log(`❌ User disconnected: ${socket.userId}`);
      }
    });
  });

  return io;
};

module.exports = { initSocket };

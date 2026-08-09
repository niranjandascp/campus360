import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Send, User as UserIcon, Search, MessageSquare, Plus, ArrowLeft, Circle, CheckCheck, Loader2, X, ChevronDown, Trash2 } from "lucide-react";
import { Navbar } from "@/components/ui/mini-navbar";
import { getConversations, getConversationUsers, createConversation, getMessages, deleteConversation, deleteSingleMessage } from "@/services/api";
import { connectSocket, getSocket } from "@/utils/socketClient";

export default function MessagesPage() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // New Chat Modal
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const messagesEndRef = useRef(null);
  const chatThreadRef = useRef(null);
  const navigate = useNavigate();

  const isDark = theme === "dark";

  // Auto-scroll to bottom of message thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleThreadScroll = () => {
    if (!chatThreadRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatThreadRef.current;
    // Show scroll button if user has scrolled up more than 120px
    if (scrollHeight - scrollTop - clientHeight > 120) {
      setShowScrollBottom(true);
    } else {
      setShowScrollBottom(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Authenticate user & connect socket
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      navigate("/signin");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (e) {
      navigate("/signin");
      return;
    }

    // Initialize socket connection
    const socket = connectSocket();

    if (socket) {
      socket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      socket.on("receiveMessage", (newMessage) => {
        setMessages((prevMessages) => {
          // Avoid duplicate messages
          if (prevMessages.some((m) => m._id === newMessage._id)) return prevMessages;
          return [...prevMessages, newMessage];
        });

        // Update conversation list preview
        setConversations((prevConvs) =>
          prevConvs.map((conv) => {
            if (conv._id === newMessage.conversation) {
              return {
                ...conv,
                lastMessage: newMessage.text,
                lastMessageAt: newMessage.createdAt
              };
            }
            return conv;
          })
        );
      });

      socket.on("messageDeleted", ({ messageId }) => {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      });

      socket.on("conversationDeleted", ({ conversationId }) => {
        setConversations((prev) => prev.filter((c) => c._id !== conversationId));
        if (activeConversation && activeConversation._id === conversationId) {
          setActiveConversation(null);
          setMessages([]);
        }
      });
    }

    fetchConversations();
  }, []);

  const handleDeleteConversation = async (convId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat conversation?")) return;

    setConversations((prev) => prev.filter((c) => c._id !== convId));
    if (activeConversation && activeConversation._id === convId) {
      setActiveConversation(null);
      setMessages([]);
    }

    const socket = getSocket();
    if (socket) {
      socket.emit("deleteConversation", { conversationId: convId });
    }

    try {
      await deleteConversation(convId);
    } catch (err) {
      console.warn("Delete conversation API error:", err);
    }
  };

  const handleDeleteMessage = async (msgId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Delete this message?")) return;

    setMessages((prev) => prev.filter((m) => m._id !== msgId));

    if (activeConversation) {
      const socket = getSocket();
      if (socket) {
        socket.emit("deleteMessage", { messageId: msgId, conversationId: activeConversation._id });
      }
    }

    try {
      await deleteSingleMessage(msgId);
    } catch (err) {
      console.warn("Delete message API error:", err);
    }
  };

  // Fetch initial conversations list
  const fetchConversations = async () => {
    setLoadingConvs(true);
    try {
      const data = await getConversations();
      if (Array.isArray(data)) {
        setConversations(data);
        if (data.length > 0 && !activeConversation) {
          selectConversation(data[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoadingConvs(false);
    }
  };

  // Select active conversation and join socket room
  const selectConversation = async (conv) => {
    setActiveConversation(conv);
    setLoadingMessages(true);
    setShowScrollBottom(false);

    const socket = getSocket();
    if (socket) {
      socket.emit("joinConversation", conv._id);
    }

    try {
      const msgs = await getMessages(conv._id);
      if (Array.isArray(msgs)) {
        setMessages(msgs);
        setTimeout(() => scrollToBottom("auto"), 50);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Open modal to select user for new chat
  const handleOpenNewChat = async () => {
    setIsNewChatOpen(true);
    setLoadingUsers(true);
    try {
      const users = await getConversationUsers();
      if (Array.isArray(users)) {
        setAvailableUsers(users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Start new conversation with a specific user
  const handleStartChatWithUser = async (otherUserId) => {
    try {
      const conv = await createConversation(otherUserId);
      if (conv && conv._id) {
        setIsNewChatOpen(false);
        // Refresh conversations list and select new conv
        await fetchConversations();
        selectConversation(conv);
      }
    } catch (err) {
      console.error("Error creating conversation:", err);
    }
  };

  // Send message via Socket.io
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const socket = getSocket();
    if (socket) {
      socket.emit("sendMessage", {
        conversationId: activeConversation._id,
        text: inputText
      });
      setInputText("");
    }
  };

  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants || !user) return { name: "User", email: "" };
    return (
      conv.participants.find((p) => String(p._id) !== String(user.id || user._id)) || {
        name: "User",
        email: ""
      }
    );
  };

  const filteredConversations = conversations.filter((conv) => {
    const other = getOtherParticipant(conv);
    return other.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div
      className="h-screen max-h-screen w-full flex flex-col overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "#12192B" : "#FBFAF6",
        color: isDark ? "#FBFAF6" : "#12192B",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <Navbar
        activeTab="messages"
        user={user}
        onLogout={() => {
          localStorage.clear();
          navigate("/signin");
        }}
        theme={theme}
        onToggleTheme={() => {
          const next = theme === "light" ? "dark" : "light";
          setTheme(next);
          localStorage.setItem("theme", next);
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4 flex flex-col min-h-0">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-full border transition-all hover:scale-105"
              style={{ borderColor: "#E4E0D3" }}
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1
                className="text-xl sm:text-2xl font-bold tracking-tight leading-none"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Campus Messages
              </h1>
              <p className="text-[11px] opacity-75 mt-0.5">Real-time peer-to-peer campus messaging</p>
            </div>
          </div>

          <button
            onClick={handleOpenNewChat}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-md transition-all active:scale-95 text-white"
            style={{ backgroundColor: "#CB9A2E" }}
          >
            <Plus size={16} /> New Chat
          </button>
        </div>

        {/* Messaging Grid Layout */}
        <div
          className="flex-1 grid grid-cols-1 md:grid-cols-12 rounded-3xl border shadow-2xl overflow-hidden min-h-0 h-full"
          style={{
            borderColor: "#E4E0D3",
            backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
          }}
        >
          {/* LEFT SIDEBAR: Conversations List */}
          <div
            className="md:col-span-4 border-r flex flex-col h-full min-h-0"
            style={{ borderColor: "#E4E0D3" }}
          >
            {/* Search Bar */}
            <div className="p-3 border-b shrink-0" style={{ borderColor: "#E4E0D3" }}>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-full text-xs border focus:outline-none"
                  style={{
                    borderColor: "#E4E0D3",
                    backgroundColor: isDark ? "#182238" : "#F0EDE3",
                    color: isDark ? "#FBFAF6" : "#12192B"
                  }}
                />
              </div>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "#E4E0D3" }}>
              {loadingConvs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-amber-500" size={24} />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center opacity-60 text-xs">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
                  No conversations found. Click <strong>"New Chat"</strong> to start messaging!
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const isActive = activeConversation && activeConversation._id === conv._id;
                  const isOnline = onlineUsers.includes(other._id);

                  return (
                    <div
                      key={conv._id}
                      onClick={() => selectConversation(conv)}
                      className={`w-full text-left p-4 flex items-center justify-between group transition-colors cursor-pointer ${
                        isActive
                          ? isDark
                            ? "bg-slate-800"
                            : "bg-[#F0EDE3]"
                          : isDark
                          ? "hover:bg-slate-900"
                          : "hover:bg-amber-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white shadow-sm"
                            style={{ backgroundColor: "#3B5BA9" }}
                          >
                            {other.name ? other.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className="font-semibold text-sm truncate">{other.name}</h4>
                            {conv.lastMessageAt && (
                              <span className="text-[10px] opacity-60">
                                {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs opacity-70 truncate">
                            {conv.lastMessage || "Started a new conversation"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteConversation(conv._id, e)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/20 opacity-80 group-hover:opacity-100 transition-opacity ml-2 shrink-0 z-10"
                        title="Delete Conversation"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Active Thread */}
          <div className="md:col-span-8 flex flex-col h-full min-h-0 bg-opacity-30">
            {activeConversation ? (
              <>
                {/* Active Chat Header */}
                <div
                  className="p-4 border-b flex items-center justify-between shrink-0"
                  style={{ borderColor: "#E4E0D3" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm"
                      style={{ backgroundColor: "#CB9A2E" }}
                    >
                      {getOtherParticipant(activeConversation).name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3
                        className="font-bold text-base leading-none"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        {getOtherParticipant(activeConversation).name}
                      </h3>
                      <span className="text-[11px] opacity-60">
                        {getOtherParticipant(activeConversation).email}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteConversation(activeConversation._id, e)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                    title="Delete Chat History"
                  >
                    <Trash2 size={14} /> Delete Chat
                  </button>
                </div>

                {/* Scrollable Message Thread */}
                <div
                  ref={chatThreadRef}
                  onScroll={handleThreadScroll}
                  className="flex-1 p-4 overflow-y-auto space-y-3 relative min-h-0"
                >
                  {loadingMessages ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="animate-spin text-amber-500" size={28} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16 opacity-60 text-xs">
                      Send a message to start the conversation!
                    </div>
                  ) : (
                    <>
                      <div
                        className="text-center py-2 border-b mb-3 opacity-40 text-[11px] font-medium tracking-wide uppercase"
                        style={{ borderColor: "#E4E0D3" }}
                      >
                        ─── Beginning of Message History ───
                      </div>

                      {messages.map((msg) => {
                      const senderId =
                        msg.sender && typeof msg.sender === "object"
                          ? msg.sender._id || msg.sender.id
                          : msg.sender;
                      const currentUserId = user ? user.id || user._id : null;
                      const isMyMessage = Boolean(
                        senderId && currentUserId && String(senderId) === String(currentUserId)
                      );

                      return (
                        <div
                          key={msg._id}
                          className={`flex flex-col w-full group ${
                            isMyMessage ? "items-end text-right" : "items-start text-left"
                          }`}
                        >
                          <div
                            className={`flex items-center gap-1.5 max-w-[80%] ${
                              isMyMessage ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            <div
                              className="px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm"
                              style={{
                                backgroundColor: isMyMessage ? "#3B5BA9" : "#F0EDE3",
                                color: isMyMessage ? "#FBFAF6" : "#12192B",
                                borderBottomRightRadius: isMyMessage ? "4px" : "16px",
                                borderBottomLeftRadius: isMyMessage ? "16px" : "4px"
                              }}
                            >
                              {msg.text}
                            </div>

                            <button
                              onClick={(e) => handleDeleteMessage(msg._id, e)}
                              className="opacity-60 hover:opacity-100 p-1 text-red-500 hover:bg-red-500/10 rounded-full transition-all shrink-0 ml-1"
                              title="Delete Message"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <span className="text-[10px] opacity-50 mt-1 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </>
                  )}
                  <div ref={messagesEndRef} />

                  {/* Floating Scroll To Bottom Button */}
                  {showScrollBottom && (
                    <button
                      onClick={scrollToBottom}
                      className="sticky bottom-2 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full shadow-lg border text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 z-10"
                      style={{
                        backgroundColor: isDark ? "#182238" : "#FFFFFF",
                        borderColor: "#E4E0D3",
                        color: "#3B5BA9"
                      }}
                    >
                      <ChevronDown size={14} /> Jump to latest
                    </button>
                  )}
                </div>

                {/* Bottom Input Field */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t flex items-center gap-2 shrink-0"
                  style={{ borderColor: "#E4E0D3" }}
                >
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-full text-xs border focus:outline-none"
                    style={{
                      borderColor: "#E4E0D3",
                      backgroundColor: isDark ? "#182238" : "#FBFAF6",
                      color: isDark ? "#FBFAF6" : "#12192B"
                    }}
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-full text-white shadow-md active:scale-95 transition-all"
                    style={{ backgroundColor: "#3B5BA9" }}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
                <MessageSquare size={48} className="mb-3 opacity-30" />
                <h3
                  className="text-lg font-bold mb-1"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  Select a Conversation
                </h3>
                <p className="text-xs max-w-xs">
                  Choose a peer from the left sidebar or start a new chat to begin real-time messaging.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* NEW CHAT USER SELECTION MODAL */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md p-6 rounded-3xl border shadow-2xl relative max-h-[80vh] flex flex-col"
            style={{
              backgroundColor: isDark ? "#0f1624" : "#FFFFFF",
              borderColor: "#E4E0D3",
              color: isDark ? "#FBFAF6" : "#12192B"
            }}
          >
            <button
              onClick={() => setIsNewChatOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h2
              className="text-xl font-bold mb-1"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Start a Conversation
            </h2>
            <p className="text-xs opacity-60 mb-4">Select a student or campus user to message</p>

            <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "#E4E0D3" }}>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="animate-spin text-amber-500" size={24} />
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="py-8 text-center text-xs opacity-60">No other users found.</div>
              ) : (
                availableUsers.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleStartChatWithUser(u._id)}
                    className="w-full text-left py-3 px-2 flex items-center justify-between hover:bg-amber-50/20 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs"
                        style={{ backgroundColor: "#3B5BA9" }}
                      >
                        {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold">{u.name}</h4>
                        <span className="text-[10px] opacity-60">{u.email}</span>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                      style={{ borderColor: "#E4E0D3" }}
                    >
                      Chat
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Send, User as UserIcon, Search, MessageSquare, Plus, Loader2, X, ChevronDown, Trash2, Image as ImageIcon, Sparkles, Circle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getConversations, getConversationUsers, createConversation, getMessages, deleteConversation, deleteSingleMessage } from "@/services/api";
import { connectSocket, getSocket } from "@/utils/socketClient";

const DEMO_CONVERSATIONS = [
  {
    _id: "demo-conv-1",
    participants: [
      { _id: "demo-user-1", name: "Campus Library Support", email: "library@campus.edu", department: "Central Library" }
    ],
    lastMessage: "Your reserved engineering study room (B-104) is ready!",
    lastMessageAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: "demo-conv-2",
    participants: [
      { _id: "demo-user-2", name: "Sarah Jenkins", email: "sarah.j@student.campus.edu", department: "Computer Science" }
    ],
    lastMessage: "Hey! Do you have the PDF notes for Physics Lecture 5?",
    lastMessageAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    _id: "demo-conv-3",
    participants: [
      { _id: "demo-user-3", name: "Campus Security Desk", email: "security@campus.edu", department: "Student Safety" }
    ],
    lastMessage: "Items found at Main Canteen have been cataloged.",
    lastMessageAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const DEMO_USERS = [
  { _id: "demo-user-1", name: "Campus Library Support", email: "library@campus.edu", department: "Central Library" },
  { _id: "demo-user-2", name: "Sarah Jenkins", email: "sarah.j@student.campus.edu", department: "Computer Science" },
  { _id: "demo-user-3", name: "Campus Security Desk", email: "security@campus.edu", department: "Student Safety" },
  { _id: "demo-user-4", name: "David Chen", email: "david.c@student.campus.edu", department: "Electronics" }
];

export default function MessagesPage() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState(null); // for hover-delete

  // New Chat Modal
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const messagesEndRef = useRef(null);
  const chatThreadRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleThreadScroll = () => {
    if (!chatThreadRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatThreadRef.current;
    if (scrollHeight - scrollTop - clientHeight > 120) {
      setShowScrollBottom(true);
    } else {
      setShowScrollBottom(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    const socket = connectSocket();

    if (socket) {
      socket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      socket.on("receiveMessage", (newMessage) => {
        setMessages((prevMessages) => {
          if (prevMessages.some((m) => m._id === newMessage._id)) return prevMessages;

          const hasTempMatch = prevMessages.some(
            (m) => String(m._id).startsWith("msg-") && m.text === newMessage.text
          );
          if (hasTempMatch) {
            return prevMessages.map((m) =>
              String(m._id).startsWith("msg-") && m.text === newMessage.text ? newMessage : m
            );
          }

          return [...prevMessages, newMessage];
        });

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
    } catch (err) {}
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
    } catch (err) {}
  };

  const fetchConversations = async () => {
    setLoadingConvs(true);
    try {
      const data = await getConversations();
      if (Array.isArray(data) && data.length > 0) {
        setConversations(data);
        if (!activeConversation) {
          selectConversation(data[0]);
        }
      } else {
        setConversations(DEMO_CONVERSATIONS);
        if (!activeConversation) {
          selectConversation(DEMO_CONVERSATIONS[0]);
        }
      }
    } catch (err) {
      setConversations(DEMO_CONVERSATIONS);
      if (!activeConversation) {
        selectConversation(DEMO_CONVERSATIONS[0]);
      }
    } finally {
      setLoadingConvs(false);
    }
  };

  const selectConversation = async (conv) => {
    setActiveConversation(conv);
    setLoadingMessages(true);
    setShowScrollBottom(false);

    const socket = getSocket();
    if (socket && !String(conv._id).startsWith("demo")) {
      socket.emit("joinConversation", conv._id);
    }

    try {
      if (String(conv._id).startsWith("demo")) {
        const demoMsgs = [
          {
            _id: `msg-${Date.now()}-1`,
            text: conv.lastMessage || "Hello! Welcome to Campus360 messaging.",
            sender: conv.participants[0],
            createdAt: conv.lastMessageAt || new Date().toISOString()
          }
        ];
        setMessages(demoMsgs);
      } else {
        const msgs = await getMessages(conv._id);
        if (Array.isArray(msgs)) {
          setMessages(msgs);
        } else {
          setMessages([]);
        }
      }
      setTimeout(() => scrollToBottom(), 50);
    } catch (err) {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleOpenNewChat = async () => {
    setIsNewChatOpen(true);
    setLoadingUsers(true);
    try {
      const users = await getConversationUsers();
      if (Array.isArray(users) && users.length > 0) {
        setAvailableUsers(users);
      } else {
        setAvailableUsers(DEMO_USERS);
      }
    } catch (err) {
      setAvailableUsers(DEMO_USERS);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleStartChatWithUser = async (otherUserId) => {
    try {
      const conv = await createConversation(otherUserId);
      if (conv && conv._id) {
        setIsNewChatOpen(false);
        await fetchConversations();
        selectConversation(conv);
      } else {
        const selectedUser = DEMO_USERS.find((u) => u._id === otherUserId) || {
          _id: otherUserId,
          name: "Campus Member",
          email: "member@campus.edu"
        };
        const newConv = {
          _id: `conv-${Date.now()}`,
          participants: [selectedUser],
          lastMessage: "Chat started",
          lastMessageAt: new Date().toISOString()
        };
        setConversations([newConv, ...conversations]);
        setIsNewChatOpen(false);
        selectConversation(newConv);
      }
    } catch (err) {
      setIsNewChatOpen(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const textToSend = inputText.trim();
    setInputText("");

    const newMsgObj = {
      _id: `msg-${Date.now()}`,
      conversation: activeConversation._id,
      sender: user ? user.id || user._id : "current-user",
      text: textToSend,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMsgObj]);

    setConversations((prevConvs) =>
      prevConvs.map((c) =>
        c._id === activeConversation._id
          ? { ...c, lastMessage: textToSend, lastMessageAt: newMsgObj.createdAt }
          : c
      )
    );

    const socket = getSocket();
    if (socket && !String(activeConversation._id).startsWith("demo")) {
      socket.emit("sendMessage", {
        conversationId: activeConversation._id,
        text: textToSend
      });
    }
  };

  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants || !user) return { name: "Campus User", email: "" };
    return (
      conv.participants.find((p) => String(p._id) !== String(user.id || user._id)) ||
      conv.participants[0] || { name: "Campus User", email: "" }
    );
  };

  const filteredConversations = conversations.filter((conv) => {
    const other = getOtherParticipant(conv);
    return (
      other.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      other.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <DashboardLayout user={user} onLogout={() => { localStorage.clear(); navigate("/signin"); }} activeNav="messages">

      {/* PAGE HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6546DB] uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-[#6546DB]" />
            <span>Peer Messaging</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">Campus Chat</h1>
        </div>
        <button
          onClick={handleOpenNewChat}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md bg-gradient-to-r from-[#6546DB] to-[#8E5AEF] text-white hover:opacity-95 transition-all"
        >
          <Plus size={16} /> New Chat
        </button>
      </div>

      {/* ===== WHATSAPP-STYLE FIXED CHAT SHELL ===== */}
      <div
        className="rounded-3xl border border-[var(--border-color)] overflow-hidden"
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          height: "calc(100vh - 200px)",
          minHeight: "520px",
          backgroundColor: "var(--surface-card)"
        }}
      >
        {/* ── LEFT PANEL: Conversation List (scrolls independently) ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--border-color)",
            overflow: "hidden"
          }}
        >
          {/* Search bar — fixed at top */}
          <div style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: 32,
                  paddingRight: 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                  borderRadius: 12,
                  fontSize: 11,
                  backgroundColor: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Conversation items — OWN scroll */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            {loadingConvs ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                <Loader2 className="animate-spin text-[#6546DB]" size={24} />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", fontSize: 11, color: "var(--text-muted)" }}>
                No chats yet. Click <strong>New Chat</strong> to start!
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isActive = activeConversation && activeConversation._id === conv._id;
                return (
                  <div
                    key={conv._id}
                    onClick={() => selectConversation(conv)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      cursor: "pointer",
                      borderBottom: "1px solid var(--border-color)",
                      backgroundColor: isActive ? "rgba(101,70,219,0.10)" : "transparent",
                      transition: "background 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                        background: "linear-gradient(135deg,#6546DB,#8E5AEF)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, color: "#fff", fontSize: 15
                      }}>
                        {other.name ? other.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {other.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {conv.lastMessage || "New conversation"}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(conv._id, e)}
                      style={{ padding: 6, borderRadius: 8, color: "#ef4444", background: "transparent", border: "none", cursor: "pointer", flexShrink: 0 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Chat Thread ── */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
          {activeConversation ? (
            <>
              {/* Chat Header — fixed */}
              <div style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-color)",
                backgroundColor: "var(--surface-card)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexShrink: 0
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: "#6546DB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, color: "#fff", fontSize: 14, flexShrink: 0
                }}>
                  {getOtherParticipant(activeConversation).name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
                    {getOtherParticipant(activeConversation).name}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {getOtherParticipant(activeConversation).email}
                  </div>
                </div>
              </div>

              {/* ── Messages Area — THE ONLY SCROLLABLE ZONE ── */}
              <div
                ref={chatThreadRef}
                onScroll={handleThreadScroll}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10
                }}
              >
                {loadingMessages ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                    <Loader2 className="animate-spin text-[#6546DB]" size={28} />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const senderId = msg.sender && typeof msg.sender === "object"
                      ? msg.sender._id || msg.sender.id
                      : msg.sender;
                    const isMe = Boolean(
                      senderId && user &&
                      (String(senderId) === String(user.id || user._id) || senderId === "current-user")
                    );
                    const timeStr = msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "";
                    const isHovered = hoveredMsg === msg._id;
                    return (
                      <div
                        key={msg._id}
                        onMouseEnter={() => setHoveredMsg(msg._id)}
                        onMouseLeave={() => setHoveredMsg(null)}
                        style={{
                          display: "flex",
                          flexDirection: isMe ? "row-reverse" : "row",
                          alignItems: "flex-end",
                          gap: 6,
                          position: "relative"
                        }}
                      >
                        {/* Message bubble */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", maxWidth: "72%" }}>
                          <div style={{
                            padding: "10px 14px",
                            borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            fontSize: 12,
                            lineHeight: 1.5,
                            wordBreak: "break-word",
                            backgroundColor: isMe ? "#6546DB" : "var(--surface-elevated, #1F2248)",
                            color: isMe ? "#fff" : "var(--text-primary)",
                            boxShadow: isMe ? "0 2px 8px rgba(101,70,219,0.3)" : "0 1px 4px rgba(0,0,0,0.15)",
                            transition: "opacity 0.15s"
                          }}>
                            {msg.text}
                          </div>
                          {timeStr && (
                            <span style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>
                              {timeStr}
                            </span>
                          )}
                        </div>

                        {/* Hover delete button — only own messages */}
                        {isMe && (
                          <button
                            onClick={(e) => handleDeleteMessage(msg._id, e)}
                            title="Delete message"
                            style={{
                              opacity: isHovered ? 1 : 0,
                              pointerEvents: isHovered ? "auto" : "none",
                              transition: "opacity 0.18s ease",
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              backgroundColor: "rgba(239,68,68,0.12)",
                              border: "1px solid rgba(239,68,68,0.25)",
                              color: "#ef4444",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginBottom: 18
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Scroll-to-bottom button */}
              {showScrollBottom && (
                <button
                  onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                  style={{
                    position: "absolute",
                    bottom: 72,
                    right: 20,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: "#6546DB",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 16px rgba(101,70,219,0.5)",
                    zIndex: 10
                  }}
                >
                  <ChevronDown size={18} />
                </button>
              )}

              {/* Input Bar — fixed at bottom */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: "10px 14px",
                  borderTop: "1px solid var(--border-color)",
                  backgroundColor: "var(--surface-card)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0
                }}
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 20,
                    fontSize: 12,
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    outline: "none"
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: 40, height: 40,
                    borderRadius: "50%",
                    backgroundColor: "#6546DB",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(101,70,219,0.4)"
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", textAlign: "center", padding: 32 }}>
              <MessageSquare size={44} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)", margin: 0 }}>Select a Conversation</p>
              <p style={{ fontSize: 11, marginTop: 4 }}>Pick a chat from the left to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* NEW CHAT MODAL */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-2xl relative max-h-[80vh] flex flex-col">
            <button onClick={() => setIsNewChatOpen(false)} className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-1">Start a Conversation</h2>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Select a student or campus member to chat with</p>

            <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-color)]">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="animate-spin text-[#6546DB]" size={24} />
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--text-muted)]">No users found.</div>
              ) : (
                availableUsers.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => handleStartChatWithUser(u._id)}
                    className="w-full text-left py-3 px-2 flex items-center justify-between hover:bg-[var(--bg-primary)] rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6546DB] to-[#8E5AEF] flex items-center justify-center font-bold text-white text-xs">
                        {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-[var(--text-primary)]">{u.name}</h4>
                        <span className="text-[10px] text-[var(--text-secondary)]">{u.email}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-[var(--border-color)] text-[#6546DB]">
                      Message
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

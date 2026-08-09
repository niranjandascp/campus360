import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, Users, AlertTriangle, PackageCheck, MessageSquare, ShieldAlert, ArrowLeft, Loader2, CheckCircle2, Clock, Trash2, Shield, Search, RefreshCw, IdCard, UserCheck, Check, X, Filter } from "lucide-react";
import { Navbar } from "@/components/ui/mini-navbar";
import { getAdminStats, getAdminUsers, updateUserRole, deleteUserAccount, getIssues, adminUpdateIssueStatus, adminDeleteIssue, getLostFoundItems, adminDeleteLostFound, updateLostFoundStatus } from "@/services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [currentUser, setCurrentUser] = useState(null);

  // Active Hub Tab: 'stats' | 'users' | 'issues' | 'lostfound'
  const [activeTab, setActiveTab] = useState("stats");

  // Analytics & Stats State
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users State
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  // Issues Moderation State
  const [issuesList, setIssuesList] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [issueFilter, setIssueFilter] = useState("all");

  // Lost & Found Moderation State
  const [lostFoundList, setLostFoundList] = useState([]);
  const [loadingLostFound, setLoadingLostFound] = useState(false);

  // Notification State
  const [toastMessage, setToastMessage] = useState("");

  const isDark = theme === "dark";

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !stored) {
      navigate("/admin-login");
      return;
    }

    try {
      const u = JSON.parse(stored);
      if (u.role !== "admin") {
        navigate("/admin-login");
        return;
      }
      setCurrentUser(u);
    } catch (e) {
      navigate("/admin-login");
      return;
    }

    fetchStats();
    fetchUsersData();
    fetchIssuesData();
    fetchLostFoundData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const data = await getAdminStats();
      if (data && data.users) {
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsersData = async () => {
    setLoadingUsers(true);
    try {
      const data = await getAdminUsers();
      if (Array.isArray(data)) {
        setUsersList(data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchIssuesData = async () => {
    setLoadingIssues(true);
    try {
      const data = await getIssues();
      const list = Array.isArray(data) ? data : (data?.issues || data?.data || []);
      setIssuesList(list);
    } catch (err) {
      console.error("Error fetching issues:", err);
    } finally {
      setLoadingIssues(false);
    }
  };

  const fetchLostFoundData = async () => {
    setLoadingLostFound(true);
    try {
      const data = await getLostFoundItems();
      const list = Array.isArray(data) ? data : (data?.items || data?.data || []);
      setLostFoundList(list);
    } catch (err) {
      console.error("Error fetching lost found items:", err);
    } finally {
      setLoadingLostFound(false);
    }
  };

  // Role Switch Handler
  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === "admin" ? "student" : "admin";
    try {
      const res = await updateUserRole(targetUser._id, newRole);
      if (res.user) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u))
        );
        showToast(`Updated ${targetUser.name}'s role to ${newRole.toUpperCase()}`);
        fetchStats();
      }
    } catch (err) {
      console.error("Error updating user role:", err);
    }
  };

  // Delete User Account
  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}'s account? This action cannot be undone.`)) return;

    try {
      await deleteUserAccount(userId);
      setUsersList((prev) => prev.filter((u) => u._id !== userId));
      showToast(`User ${name} deleted successfully`);
      fetchStats();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // Update Issue Status
  const handleUpdateIssueStatus = async (issueId, status) => {
    try {
      await adminUpdateIssueStatus(issueId, status);
      setIssuesList((prev) =>
        prev.map((item) => (item._id === issueId ? { ...item, status } : item))
      );
      showToast(`Issue status changed to ${status.toUpperCase()}`);
      fetchStats();
    } catch (err) {
      console.error("Error updating issue status:", err);
    }
  };

  // Delete Issue
  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    try {
      await adminDeleteIssue(issueId);
      setIssuesList((prev) => prev.filter((item) => item._id !== issueId));
      showToast("Issue deleted by admin");
      fetchStats();
    } catch (err) {
      console.error("Error deleting issue:", err);
    }
  };

  // Delete Lost & Found item
  const handleDeleteLostFound = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await adminDeleteLostFound(itemId);
      setLostFoundList((prev) => prev.filter((item) => item._id !== itemId));
      showToast("Lost & Found post deleted");
      fetchStats();
    } catch (err) {
      console.error("Error deleting lost found item:", err);
    }
  };

  // Toggle Claimed status for Lost & Found item
  const handleToggleClaimed = async (itemId, currentStatus) => {
    const newStatus = currentStatus === "claimed" ? "active" : "claimed";
    try {
      await updateLostFoundStatus(itemId, newStatus);
      setLostFoundList((prev) =>
        prev.map((item) => (item._id === itemId ? { ...item, status: newStatus } : item))
      );
      showToast(`Item marked as ${newStatus.toUpperCase()}`);
      fetchStats();
    } catch (err) {
      console.error("Error toggling claimed status:", err);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const query = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.department?.toLowerCase().includes(query) ||
      u.userId?.toLowerCase().includes(query)
    );
  });

  const filteredIssues = issuesList.filter((item) => {
    if (issueFilter === "all") return true;
    return item.status === issueFilter;
  });

  return (
    <div
      className="min-h-screen w-full transition-colors duration-300 pb-16"
      style={{
        backgroundColor: isDark ? "#12192B" : "#FBFAF6",
        color: isDark ? "#FBFAF6" : "#12192B",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <Navbar
        user={currentUser}
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

      {/* Toast Popup Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 px-4 py-3 rounded-2xl bg-[#CB9A2E] text-white shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-8">
        {/* Top Title Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-full border transition-all hover:scale-105"
              style={{ borderColor: "#E4E0D3" }}
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1
                  className="text-2xl sm:text-3xl font-bold tracking-tight"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  Admin Command Dashboard
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500 text-white shadow-sm">
                  System Admin
                </span>
              </div>
              <p className="text-xs opacity-75 mt-0.5">Control center for users, reported issues & campus operations</p>
            </div>
          </div>

          <button
            onClick={() => {
              fetchStats();
              fetchUsersData();
              fetchIssuesData();
              fetchLostFoundData();
              showToast("Dashboard refreshed!");
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border shadow-sm transition-all hover:scale-105 active:scale-95"
            style={{ borderColor: "#E4E0D3" }}
          >
            <RefreshCw size={14} /> Refresh Analytics
          </button>
        </div>

        {/* 4 STATS METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Users */}
          <div
            className="p-6 rounded-3xl border shadow-xl flex items-center justify-between group hover:scale-[1.02] transition-all"
            style={{
              borderColor: "#E4E0D3",
              backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
            }}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 block">Total Members</span>
              <h2 className="text-3xl font-black mt-1" style={{ color: "#3B5BA9" }}>
                {loadingStats ? "..." : stats?.users?.total || 0}
              </h2>
              <span className="text-[11px] opacity-70 mt-1 block">Registered Campus Users</span>
            </div>
            <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
              <Users size={28} />
            </div>
          </div>

          {/* Card 2: Reported Issues */}
          <div
            className="p-6 rounded-3xl border shadow-xl flex items-center justify-between group hover:scale-[1.02] transition-all"
            style={{
              borderColor: "#E4E0D3",
              backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
            }}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 block">Reported Issues</span>
              <h2 className="text-3xl font-black mt-1 text-amber-500">
                {loadingStats ? "..." : stats?.issues?.total || 0}
              </h2>
              <span className="text-[11px] opacity-70 mt-1 block">
                {stats?.issues?.open || 0} Open • {stats?.issues?.resolved || 0} Resolved
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
              <AlertTriangle size={28} />
            </div>
          </div>

          {/* Card 3: Lost & Found Posts */}
          <div
            className="p-6 rounded-3xl border shadow-xl flex items-center justify-between group hover:scale-[1.02] transition-all"
            style={{
              borderColor: "#E4E0D3",
              backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
            }}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 block">Lost & Found Posts</span>
              <h2 className="text-3xl font-black mt-1 text-emerald-500">
                {loadingStats ? "..." : stats?.lostFound?.total || 0}
              </h2>
              <span className="text-[11px] opacity-70 mt-1 block">
                {stats?.lostFound?.active || 0} Active • {stats?.lostFound?.claimed || 0} Claimed
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
              <PackageCheck size={28} />
            </div>
          </div>

          {/* Card 4: Real-time Messages */}
          <div
            className="p-6 rounded-3xl border shadow-xl flex items-center justify-between group hover:scale-[1.02] transition-all"
            style={{
              borderColor: "#E4E0D3",
              backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
            }}
          >
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 block">Active Messages</span>
              <h2 className="text-3xl font-black mt-1 text-purple-500">
                {loadingStats ? "..." : stats?.messaging?.messages || 0}
              </h2>
              <span className="text-[11px] opacity-70 mt-1 block">
                Across {stats?.messaging?.conversations || 0} Conversations
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform">
              <MessageSquare size={28} />
            </div>
          </div>
        </div>

        {/* TABBED NAVIGATION CONTROL */}
        <div
          className="flex p-1.5 rounded-2xl border shadow-inner max-w-full overflow-x-auto"
          style={{
            borderColor: "#E4E0D3",
            backgroundColor: isDark ? "#0f1624" : "#F0EDE3"
          }}
        >
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "stats"
                ? "bg-[#CB9A2E] text-white shadow-md"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <LayoutDashboard size={15} /> System Overview
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "users"
                ? "bg-[#CB9A2E] text-white shadow-md"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <Users size={15} /> Users ({usersList.length})
          </button>

          <button
            onClick={() => setActiveTab("issues")}
            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "issues"
                ? "bg-[#CB9A2E] text-white shadow-md"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <AlertTriangle size={15} /> Issues ({issuesList.length})
          </button>

          <button
            onClick={() => setActiveTab("lostfound")}
            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === "lostfound"
                ? "bg-[#CB9A2E] text-white shadow-md"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            <PackageCheck size={15} /> Lost & Found ({lostFoundList.length})
          </button>
        </div>

        {/* TAB CONTENT 1: SYSTEM OVERVIEW & CATEGORY BREAKDOWN */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
            {/* Left: Issue Category Breakdown */}
            <div
              className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6"
              style={{
                borderColor: "#E4E0D3",
                backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
              }}
            >
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Reported Issues by Category
              </h3>

              {!stats?.issues?.categories || stats.issues.categories.length === 0 ? (
                <div className="text-center py-12 opacity-60 text-xs">No issues reported yet.</div>
              ) : (
                <div className="space-y-4">
                  {stats.issues.categories.map((cat) => {
                    const percentage = Math.round((cat.count / (stats.issues.total || 1)) * 100);
                    return (
                      <div key={cat._id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="capitalize">{cat._id || "General"}</span>
                          <span>
                            {cat.count} issues ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: "#3B5BA9"
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Quick Admin Control Shortcuts */}
            <div
              className="lg:col-span-5 p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6"
              style={{
                borderColor: "#E4E0D3",
                backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
              }}
            >
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Quick Administration Controls
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab("users")}
                  className="w-full p-4 rounded-2xl border text-left flex items-center justify-between hover:bg-amber-500/10 transition-colors group"
                  style={{ borderColor: "#E4E0D3" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">Manage User Accounts</h4>
                      <p className="text-[11px] opacity-60">Grant admin rights or moderate user profiles</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold opacity-70 group-hover:translate-x-1 transition-transform">→</span>
                </button>

                <button
                  onClick={() => setActiveTab("issues")}
                  className="w-full p-4 rounded-2xl border text-left flex items-center justify-between hover:bg-amber-500/10 transition-colors group"
                  style={{ borderColor: "#E4E0D3" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">Resolve Campus Complaints</h4>
                      <p className="text-[11px] opacity-60">Update issue statuses to In Progress / Resolved</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold opacity-70 group-hover:translate-x-1 transition-transform">→</span>
                </button>

                <button
                  onClick={() => setActiveTab("lostfound")}
                  className="w-full p-4 rounded-2xl border text-left flex items-center justify-between hover:bg-amber-500/10 transition-colors group"
                  style={{ borderColor: "#E4E0D3" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                      <PackageCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">Lost & Found Moderation</h4>
                      <p className="text-[11px] opacity-60">Mark items claimed or remove inappropriate posts</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold opacity-70 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: USER MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search Filter Bar */}
            <div
              className="p-4 rounded-3xl border shadow-lg flex items-center justify-between gap-4"
              style={{
                borderColor: "#E4E0D3",
                backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
              }}
            >
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
                <input
                  type="text"
                  placeholder="Filter users by name, email, department or Campus User ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full text-xs border focus:outline-none"
                  style={{
                    borderColor: "#E4E0D3",
                    backgroundColor: isDark ? "#182238" : "#FBFAF6",
                    color: isDark ? "#FBFAF6" : "#12192B"
                  }}
                />
              </div>
            </div>

            {/* Users Table */}
            <div
              className="rounded-3xl border shadow-xl overflow-hidden"
              style={{
                borderColor: "#E4E0D3",
                backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
              }}
            >
              {loadingUsers ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="animate-spin text-amber-500" size={32} />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16 opacity-60 text-xs">No users matching search query.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr
                        className="border-b uppercase text-[10px] tracking-wider opacity-60"
                        style={{ borderColor: "#E4E0D3" }}
                      >
                        <th className="p-4">User Details</th>
                        <th className="p-4">Campus User ID</th>
                        <th className="p-4">Department / Year</th>
                        <th className="p-4">Role</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "#E4E0D3" }}>
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-amber-500/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                                style={{ backgroundColor: "#3B5BA9" }}
                              >
                                {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <div>
                                <h4 className="font-bold text-xs">{u.name}</h4>
                                <span className="opacity-60 text-[11px] block">{u.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border"
                              style={{ borderColor: "#E4E0D3", backgroundColor: "#3B5BA9", color: "#FFFFFF" }}
                            >
                              <IdCard size={12} /> {u.userId || `CMP-${u._id.substring(18)}`}
                            </span>
                          </td>

                          <td className="p-4 opacity-80">
                            <div>{u.department || "N/A"}</div>
                            <div className="text-[10px] opacity-60">{u.year || "Student"}</div>
                          </td>

                          <td className="p-4">
                            <button
                              onClick={() => handleToggleRole(u)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1 border ${
                                u.role === "admin"
                                  ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                                  : "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500 hover:text-white"
                              }`}
                              title="Click to toggle Admin/Student role"
                            >
                              <Shield size={11} /> {u.role || "student"}
                            </button>
                          </td>

                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: ISSUES CONTROL CENTER */}
        {activeTab === "issues" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Filter Pills */}
            <div className="flex items-center gap-2">
              {["all", "open", "in-progress", "resolved"].map((st) => (
                <button
                  key={st}
                  onClick={() => setIssueFilter(st)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border ${
                    issueFilter === st
                      ? "bg-[#CB9A2E] text-white border-[#CB9A2E] shadow-md"
                      : "opacity-70 border-[#E4E0D3] hover:opacity-100"
                  }`}
                >
                  {st} Issues
                </button>
              ))}
            </div>

            {/* Issues Cards Grid */}
            {loadingIssues ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-amber-500" size={32} />
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="text-center py-16 opacity-60 text-xs">No issues found for this filter.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue._id}
                    className="p-6 rounded-3xl border shadow-lg space-y-4 flex flex-col justify-between"
                    style={{
                      borderColor: "#E4E0D3",
                      backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
                    }}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600">
                          {issue.category || "General"}
                        </span>

                        <div className="flex items-center gap-1">
                          <select
                            value={issue.status}
                            onChange={(e) => handleUpdateIssueStatus(issue._id, e.target.value)}
                            className="px-3 py-1 rounded-full text-[11px] font-bold border focus:outline-none cursor-pointer"
                            style={{
                              borderColor: "#E4E0D3",
                              backgroundColor: isDark ? "#182238" : "#F0EDE3",
                              color: isDark ? "#FBFAF6" : "#12192B"
                            }}
                          >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                          </select>

                          <button
                            onClick={() => handleDeleteIssue(issue._id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                            title="Delete Issue"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-base leading-snug">{issue.title}</h3>
                      <p className="text-xs opacity-75 mt-1 leading-relaxed line-clamp-3">{issue.description}</p>
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between text-[11px] opacity-60" style={{ borderColor: "#E4E0D3" }}>
                      <span>Reported by: {issue.reportedBy?.name || "Student"}</span>
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT 4: LOST & FOUND MODERATION */}
        {activeTab === "lostfound" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {loadingLostFound ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-amber-500" size={32} />
              </div>
            ) : lostFoundList.length === 0 ? (
              <div className="text-center py-16 opacity-60 text-xs">No Lost & Found posts found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {lostFoundList.map((item) => (
                  <div
                    key={item._id}
                    className="p-6 rounded-3xl border shadow-lg flex flex-col justify-between space-y-4"
                    style={{
                      borderColor: "#E4E0D3",
                      backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            item.type === "lost" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                          }`}
                        >
                          {item.type}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "claimed" ? "bg-emerald-500 text-white" : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {item.status || "active"}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm">{item.title}</h3>
                      <p className="text-xs opacity-75 mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                      <span className="text-[11px] opacity-60 mt-2 block font-medium">📍 {item.location}</span>
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: "#E4E0D3" }}>
                      <button
                        onClick={() => handleToggleClaimed(item._id, item.status)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                        style={{ borderColor: "#E4E0D3" }}
                      >
                        {item.status === "claimed" ? "Mark Active" : "Mark Claimed"}
                      </button>

                      <button
                        onClick={() => handleDeleteLostFound(item._id)}
                        className="p-1.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

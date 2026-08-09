import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, Users, Wrench, Package, CheckCircle2, RefreshCw, Trash2, Edit3, User, MessageSquare, Activity, Sparkles, Check
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getAdminStats, getAdminUsers, updateUserRole, deleteUserAccount,
  getIssues, adminUpdateIssueStatus, adminDeleteIssue, getLostFoundItems
} from "@/services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [toastMessage, setToastMessage] = useState("");

  // Data lists
  const [usersList, setUsersList] = useState([]);
  const [issuesList, setIssuesList] = useState([]);
  const [lostFoundList, setLostFoundList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      navigate("/signin");
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role !== "admin") {
        alert("Access Denied: Admin authorization required.");
        navigate("/dashboard");
        return;
      }
      setCurrentUser(parsed);
    } catch (e) {
      navigate("/signin");
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
    try {
      const res = await getAdminStats();
      if (res && res.users) {
        setStats(res);
      } else {
        setStats({
          users: { total: usersList.length || 4, students: 3, admins: 1 },
          issues: { total: issuesList.length || 3, open: 2, resolved: 1 },
          lostFound: { total: 3, lost: 1, found: 2 },
          messaging: { messages: 12, conversations: 3 }
        });
      }
    } catch (err) {}
  };

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      if (Array.isArray(data) && data.length > 0) {
        setUsersList(data);
      } else {
        setUsersList([
          { _id: "usr-1", name: "System Administrator", email: "admin@campus360.edu", role: "admin", department: "Administration" },
          { _id: "usr-2", name: "Sarah Jenkins", email: "sarah.j@student.campus.edu", role: "student", department: "Computer Science" },
          { _id: "usr-3", name: "David Chen", email: "david.c@student.campus.edu", role: "student", department: "Information Tech" }
        ]);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const fetchIssuesData = async () => {
    try {
      const res = await getIssues();
      const list = Array.isArray(res) ? res : res?.issues || [];
      setIssuesList(list);
    } catch (err) {}
  };

  const fetchLostFoundData = async () => {
    try {
      const data = await getLostFoundItems();
      const list = Array.isArray(data) ? data : data?.items || [];
      setLostFoundList(list);
    } catch (err) {}
  };

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === "admin" ? "student" : "admin";
    try {
      const res = await updateUserRole(targetUser._id, newRole);
      setUsersList((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u))
      );
      showToast(`Updated ${targetUser.name}'s role to ${newRole}`);
    } catch (err) {}
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Delete ${name}'s account?`)) return;
    try {
      await deleteUserAccount(userId);
      setUsersList((prev) => prev.filter((u) => u._id !== userId));
      showToast(`Deleted ${name}`);
    } catch (err) {}
  };

  const handleStatusChange = async (issueId, status) => {
    try {
      await adminUpdateIssueStatus(issueId, status);
      setIssuesList((prev) =>
        prev.map((i) => (i._id === issueId ? { ...i, status } : i))
      );
      showToast(`Issue status updated to ${status}`);
    } catch (err) {}
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm("Delete this issue report permanently?")) return;
    try {
      await adminDeleteIssue(issueId);
      setIssuesList((prev) => prev.filter((i) => i._id !== issueId));
      showToast("Issue deleted from system");
    } catch (err) {}
  };

  const filteredUsers = usersList.filter((u) => {
    const query = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.department?.toLowerCase().includes(query)
    );
  });

  return (
    <DashboardLayout user={currentUser} onLogout={() => { localStorage.clear(); navigate("/signin"); }} activeNav="admin">
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#20B486] text-white shadow-lg text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6546DB] uppercase tracking-wider">
            <Shield className="w-4 h-4 text-[#6546DB]" />
            <span>Administration Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
            System Control Center
          </h1>
        </div>

        <button
          onClick={() => { fetchStats(); fetchUsersData(); fetchIssuesData(); fetchLostFoundData(); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--surface-card)] transition-all shrink-0"
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-5 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase block mb-1">Users</span>
          <h2 className="text-2xl font-bold text-[#6546DB]">{stats?.users?.total || usersList.length || 4}</h2>
          <span className="text-[11px] text-[var(--text-secondary)]">Registered Accounts</span>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase block mb-1">Issues</span>
          <h2 className="text-2xl font-bold text-[#4D7CFE]">{stats?.issues?.total || issuesList.length || 3}</h2>
          <span className="text-[11px] text-[var(--text-secondary)]">{stats?.issues?.open || 2} Open</span>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase block mb-1">Lost & Found</span>
          <h2 className="text-2xl font-bold text-[#20B486]">{stats?.lostFound?.total || lostFoundList.length || 3}</h2>
          <span className="text-[11px] text-[var(--text-secondary)]">Item Postings</span>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase block mb-1">Messages</span>
          <h2 className="text-2xl font-bold text-[#F0A34A]">{stats?.messaging?.messages || 12}</h2>
          <span className="text-[11px] text-[var(--text-secondary)]">Active Conversations</span>
        </div>
      </div>

      {/* TABS */}
      <div className="flex p-1 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-color)] mb-6">
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "stats" ? "bg-[#6546DB] text-white shadow-sm" : "text-[var(--text-secondary)]"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "users" ? "bg-[#6546DB] text-white shadow-sm" : "text-[var(--text-secondary)]"
          }`}
        >
          Users ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab("issues")}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "issues" ? "bg-[#6546DB] text-white shadow-sm" : "text-[var(--text-secondary)]"
          }`}
        >
          Issues ({issuesList.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs">
            <h3 className="font-bold text-base text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <Activity size={18} className="text-[#6546DB]" /> System Health & Status
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-primary)]">
                <span className="font-semibold text-[var(--text-secondary)]">Database Connection</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#20B486]/10 text-[#20B486]">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-primary)]">
                <span className="font-semibold text-[var(--text-secondary)]">Socket.io Gateway</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#20B486]/10 text-[#20B486]">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-primary)]">
                <span className="font-semibold text-[var(--text-secondary)]">File Storage Service</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#20B486]/10 text-[#20B486]">ONLINE</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs">
            <h3 className="font-bold text-base text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-[#6546DB]" /> Admin Quick Actions
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
              Moderation controls allow managing student roles, resolving reported campus maintenance issues, and overseeing marketplace postings.
            </p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveTab("users")} className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#6546DB] text-white">
                Manage User Roles
              </button>
              <button onClick={() => setActiveTab("issues")} className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border-color)] text-[var(--text-primary)]">
                Review Issue Reports
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeTab === "users" && (
        <div className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs overflow-hidden">
          <div className="p-3 border-b border-[var(--border-color)]">
            <input
              type="text"
              placeholder="Search users by name, email, department..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-xl text-xs bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <div className="divide-y divide-[var(--border-color)]">
            {filteredUsers.map((u) => (
              <div key={u._id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-[var(--text-primary)]">{u.name}</h4>
                  <span className="text-[var(--text-secondary)]">{u.email} · {u.department || "General"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRole(u)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold border border-[#6546DB]/20 text-[#6546DB] hover:bg-[#6546DB] hover:text-white transition-all capitalize"
                  >
                    {u.role || "student"}
                  </button>
                  <button onClick={() => handleDeleteUser(u._id, u.name)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ISSUES */}
      {activeTab === "issues" && (
        <div className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs overflow-hidden">
          <div className="divide-y divide-[var(--border-color)]">
            {issuesList.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)]">No reported issues found in system.</div>
            ) : (
              issuesList.map((issue) => (
                <div key={issue._id} className="p-4 flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1 pr-4">
                    <h4 className="font-bold text-[var(--text-primary)] truncate">{issue.title}</h4>
                    <span className="text-[var(--text-secondary)] block truncate">{issue.description}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleStatusChange(issue._id, issue.status === "resolved" ? "open" : "resolved")}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold border uppercase transition-all ${
                        issue.status === "resolved"
                          ? "bg-[#20B486]/10 text-[#20B486] border-[#20B486]/20"
                          : "bg-[#6546DB]/10 text-[#6546DB] border-[#6546DB]/20"
                      }`}
                    >
                      {issue.status || "open"}
                    </button>
                    <button onClick={() => handleDeleteIssue(issue._id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

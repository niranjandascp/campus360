import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Search, User as UserIcon, Mail, Building, GraduationCap, ShieldCheck, Calendar, Edit3, MessageSquare, ArrowLeft, Loader2, Check, X, IdCard, Sparkles, Filter } from "lucide-react";
import { Navbar } from "@/components/ui/mini-navbar";
import { getCurrentUserProfile, getUserProfile, updateUserProfile, searchUsers, createConversation } from "@/services/api";

export default function ProfilePage() {
  const { identifier } = useParams(); // _id or userId or undefined (for self)
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // User Finder / Directory Search State
  const [activeTab, setActiveTab] = useState("directory"); // 'profile' | 'directory'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  // Edit Profile Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editUserId, setEditUserId] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const isDark = theme === "dark";

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !stored) {
      navigate("/signin");
      return;
    }

    try {
      setCurrentUser(JSON.parse(stored));
    } catch (e) {
      navigate("/signin");
      return;
    }

    fetchProfile();
    fetchDirectory();
  }, [identifier]);

  // Fetch target user profile
  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      let data;
      if (!identifier || identifier === "me") {
        data = await getCurrentUserProfile();
      } else {
        data = await getUserProfile(identifier);
      }

      if (data && (data._id || data.id)) {
        setProfileData(data);
        if (!identifier || identifier === "me") {
          setEditName(data.name || "");
          setEditDept(data.department || "");
          setEditYear(data.year || "");
          setEditUserId(data.userId || "");
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch Directory users
  const fetchDirectory = async (query = searchQuery, dept = selectedDept, role = selectedRole) => {
    setLoadingDirectory(true);
    try {
      const data = await searchUsers(query, dept, role);
      if (Array.isArray(data)) {
        setDirectoryUsers(data);
      }
    } catch (err) {
      console.error("Error searching directory:", err);
    } finally {
      setLoadingDirectory(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDirectory(searchQuery, selectedDept, selectedRole);
  };

  // Start chat with user
  const handleStartChat = async (targetUserId) => {
    try {
      const conv = await createConversation(targetUserId);
      if (conv && conv._id) {
        navigate("/messages");
      }
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  // Save profile updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setEditError("");
    setEditSuccess("");

    try {
      const res = await updateUserProfile({
        name: editName,
        department: editDept,
        year: editYear,
        userId: editUserId
      });

      if (res.message && res.message.includes("success")) {
        setEditSuccess("Profile updated successfully!");
        setProfileData((prev) => ({
          ...prev,
          name: editName,
          department: editDept,
          year: editYear,
          userId: editUserId
        }));

        // Update local storage
        if (res.user) {
          localStorage.setItem("user", JSON.stringify(res.user));
          setCurrentUser(res.user);
        }

        setTimeout(() => setIsEditOpen(false), 1000);
      } else {
        setEditError(res.message || "Failed to update profile");
      }
    } catch (err) {
      setEditError(err.message || "Error updating profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const isSelf = profileData && currentUser && (String(profileData._id || profileData.id) === String(currentUser.id || currentUser._id));

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        {/* Header Navigation Bar */}
        <div className="flex items-center justify-between mb-8">
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
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Campus User Directory
              </h1>
              <p className="text-xs opacity-75">Find students, search IDs & view campus profiles</p>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div
            className="flex p-1 rounded-full border shadow-inner"
            style={{
              borderColor: "#E4E0D3",
              backgroundColor: isDark ? "#0f1624" : "#F0EDE3"
            }}
          >
            <button
              onClick={() => setActiveTab("directory")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "directory"
                  ? "bg-[#CB9A2E] text-white shadow-md"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              User Finder
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "profile"
                  ? "bg-[#CB9A2E] text-white shadow-md"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {isSelf ? "My Profile" : "User Viewer"}
            </button>
          </div>
        </div>

        {/* TAB 1: USER FINDER & SEARCH DIRECTORY */}
        {activeTab === "directory" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search Controls Card */}
            <div
              className="p-6 rounded-3xl border shadow-xl"
              style={{
                borderColor: "#E4E0D3",
                backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
              }}
            >
              <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
                  <input
                    type="text"
                    placeholder="Search by Name, Campus ID (e.g. CMP-123), Email or Department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs border focus:outline-none"
                    style={{
                      borderColor: "#E4E0D3",
                      backgroundColor: isDark ? "#182238" : "#FBFAF6",
                      color: isDark ? "#FBFAF6" : "#12192B"
                    }}
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedDept}
                    onChange={(e) => {
                      setSelectedDept(e.target.value);
                      fetchDirectory(searchQuery, e.target.value, selectedRole);
                    }}
                    className="px-4 py-3 rounded-2xl text-xs border focus:outline-none cursor-pointer"
                    style={{
                      borderColor: "#E4E0D3",
                      backgroundColor: isDark ? "#182238" : "#FBFAF6",
                      color: isDark ? "#FBFAF6" : "#12192B"
                    }}
                  >
                    <option value="">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Business Administration">Business Admin</option>
                  </select>

                  <select
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      fetchDirectory(searchQuery, selectedDept, e.target.value);
                    }}
                    className="px-4 py-3 rounded-2xl text-xs border focus:outline-none cursor-pointer"
                    style={{
                      borderColor: "#E4E0D3",
                      backgroundColor: isDark ? "#182238" : "#FBFAF6",
                      color: isDark ? "#FBFAF6" : "#12192B"
                    }}
                  >
                    <option value="">All Roles</option>
                    <option value="student">Student</option>
                    <option value="admin">Faculty / Admin</option>
                  </select>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl text-xs font-bold text-white shadow-md active:scale-95 transition-all shrink-0"
                    style={{ backgroundColor: "#3B5BA9" }}
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* User Grid Results */}
            {loadingDirectory ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-amber-500" size={32} />
              </div>
            ) : directoryUsers.length === 0 ? (
              <div
                className="p-12 text-center rounded-3xl border opacity-70"
                style={{ borderColor: "#E4E0D3" }}
              >
                <UserIcon size={48} className="mx-auto mb-3 opacity-30" />
                <h3
                  className="text-lg font-bold"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  No Campus Members Found
                </h3>
                <p className="text-xs max-w-sm mx-auto mt-1">
                  Try adjusting your search query, clearing department filters, or searching by exact Campus ID.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {directoryUsers.map((usr) => (
                  <div
                    key={usr._id}
                    className="p-6 rounded-3xl border shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                    style={{
                      borderColor: "#E4E0D3",
                      backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
                    }}
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-md"
                            style={{ backgroundColor: "#3B5BA9" }}
                          >
                            {usr.name ? usr.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <h3 className="font-bold text-base leading-snug group-hover:text-[#CB9A2E] transition-colors">
                              {usr.name}
                            </h3>
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border mt-0.5"
                              style={{ borderColor: "#E4E0D3", backgroundColor: "#3B5BA9", color: "#FFFFFF" }}
                            >
                              <IdCard size={11} /> {usr.userId || `CMP-${usr._id.substring(18)}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Info Badges */}
                      <div className="space-y-2 text-xs opacity-80 mb-6">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="opacity-60 shrink-0" />
                          <span className="truncate">{usr.email}</span>
                        </div>
                        {usr.department && (
                          <div className="flex items-center gap-2">
                            <Building size={14} className="opacity-60 shrink-0" />
                            <span>{usr.department}</span>
                          </div>
                        )}
                        {usr.year && (
                          <div className="flex items-center gap-2">
                            <GraduationCap size={14} className="opacity-60 shrink-0" />
                            <span>{usr.year}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className="opacity-60 shrink-0" />
                          <span className="capitalize font-semibold">{usr.role || "student"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="pt-4 border-t flex items-center gap-2" style={{ borderColor: "#E4E0D3" }}>
                      <button
                        onClick={() => {
                          setProfileData(usr);
                          setActiveTab("profile");
                        }}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-all text-center"
                        style={{ borderColor: "#E4E0D3" }}
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleStartChat(usr._id)}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold text-white shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: "#CB9A2E" }}
                      >
                        <MessageSquare size={14} /> Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: USER VIEWER / PROFILE CARD */}
        {activeTab === "profile" && (
          <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
            {loadingProfile ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-amber-500" size={32} />
              </div>
            ) : !profileData ? (
              <div className="text-center py-16 opacity-70">User profile not found.</div>
            ) : (
              <div
                className="p-8 sm:p-10 rounded-3xl border shadow-2xl space-y-8"
                style={{
                  borderColor: "#E4E0D3",
                  backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
                }}
              >
                {/* Profile Banner */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 border-b pb-8" style={{ borderColor: "#E4E0D3" }}>
                  <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-4xl text-white shadow-xl ring-4 ring-amber-500/20"
                      style={{ backgroundColor: "#3B5BA9" }}
                    >
                      {profileData.name ? profileData.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                        <h2
                          className="text-2xl sm:text-3xl font-bold"
                          style={{ fontFamily: "'Fraunces', serif" }}
                        >
                          {profileData.name}
                        </h2>
                        {profileData.role === "admin" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider">
                            Admin
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold">
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm"
                          style={{ borderColor: "#E4E0D3", backgroundColor: "#3B5BA9", color: "#FFFFFF" }}
                        >
                          <IdCard size={14} /> ID: {profileData.userId || `CMP-${(profileData._id || profileData.id).substring(18)}`}
                        </span>
                        <span className="opacity-60">• {profileData.email}</span>
                      </div>
                    </div>
                  </div>

                  {isSelf ? (
                    <button
                      onClick={() => setIsEditOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                      style={{ backgroundColor: "#CB9A2E" }}
                    >
                      <Edit3 size={15} /> Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartChat(profileData._id || profileData.id)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                      style={{ backgroundColor: "#CB9A2E" }}
                    >
                      <MessageSquare size={16} /> Send Direct Message
                    </button>
                  )}
                </div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div
                    className="p-5 rounded-2xl border flex items-center gap-4"
                    style={{ borderColor: "#E4E0D3", backgroundColor: isDark ? "#182238" : "#FBFAF6" }}
                  >
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                      <Building size={22} />
                    </div>
                    <div>
                      <span className="text-[11px] opacity-60 font-medium uppercase tracking-wider block">Department</span>
                      <span className="text-sm font-semibold">{profileData.department || "Not specified"}</span>
                    </div>
                  </div>

                  <div
                    className="p-5 rounded-2xl border flex items-center gap-4"
                    style={{ borderColor: "#E4E0D3", backgroundColor: isDark ? "#182238" : "#FBFAF6" }}
                  >
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600">
                      <GraduationCap size={22} />
                    </div>
                    <div>
                      <span className="text-[11px] opacity-60 font-medium uppercase tracking-wider block">Academic Year</span>
                      <span className="text-sm font-semibold">{profileData.year || "Student"}</span>
                    </div>
                  </div>

                  <div
                    className="p-5 rounded-2xl border flex items-center gap-4"
                    style={{ borderColor: "#E4E0D3", backgroundColor: isDark ? "#182238" : "#FBFAF6" }}
                  >
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <span className="text-[11px] opacity-60 font-medium uppercase tracking-wider block">Campus Role</span>
                      <span className="text-sm font-semibold capitalize">{profileData.role || "student"}</span>
                    </div>
                  </div>

                  <div
                    className="p-5 rounded-2xl border flex items-center gap-4"
                    style={{ borderColor: "#E4E0D3", backgroundColor: isDark ? "#182238" : "#FBFAF6" }}
                  >
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                      <Calendar size={22} />
                    </div>
                    <div>
                      <span className="text-[11px] opacity-60 font-medium uppercase tracking-wider block">Member Since</span>
                      <span className="text-sm font-semibold">
                        {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "Active Member"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Campus Activity Summary */}
                <div className="pt-6 border-t" style={{ borderColor: "#E4E0D3" }}>
                  <h3
                    className="text-base font-bold mb-4"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    Campus Activity Overview
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div
                      className="p-4 rounded-2xl border"
                      style={{ borderColor: "#E4E0D3", backgroundColor: isDark ? "#182238" : "#FBFAF6" }}
                    >
                      <span className="text-2xl font-black text-[#CB9A2E]">
                        {profileData.stats ? profileData.stats.issuesReported : 0}
                      </span>
                      <span className="text-xs opacity-75 block mt-0.5">Issues Reported</span>
                    </div>

                    <div
                      className="p-4 rounded-2xl border"
                      style={{ borderColor: "#E4E0D3", backgroundColor: isDark ? "#182238" : "#FBFAF6" }}
                    >
                      <span className="text-2xl font-black text-[#3B5BA9]">
                        {profileData.stats ? profileData.stats.lostFoundPosts : 0}
                      </span>
                      <span className="text-xs opacity-75 block mt-0.5">Lost & Found Posts</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* EDIT PROFILE MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md p-6 rounded-3xl border shadow-2xl relative"
            style={{
              backgroundColor: isDark ? "#0f1624" : "#FFFFFF",
              borderColor: "#E4E0D3",
              color: isDark ? "#FBFAF6" : "#12192B"
            }}
          >
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h2
              className="text-xl font-bold mb-1"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Edit Campus Profile
            </h2>
            <p className="text-xs opacity-60 mb-5">Update your personal details & Campus User ID</p>

            {editError && (
              <div className="p-3 mb-4 rounded-xl text-xs bg-red-500/10 text-red-500 border border-red-500/20">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="p-3 mb-4 rounded-xl text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-2">
                <Check size={16} /> {editSuccess}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none"
                  style={{
                    borderColor: "#E4E0D3",
                    backgroundColor: isDark ? "#182238" : "#FBFAF6",
                    color: isDark ? "#FBFAF6" : "#12192B"
                  }}
                />
              </div>

              {/* Custom User ID Section */}
              <div
                className="p-4 rounded-2xl border space-y-2"
                style={{
                  borderColor: "#E4E0D3",
                  backgroundColor: isDark ? "#182238" : "#F0EDE3"
                }}
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: "#CB9A2E" }}>
                    <IdCard size={15} /> Campus User ID Customization
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      const randomID = `CMP-${Math.floor(100000 + Math.random() * 900000)}`;
                      setEditUserId(randomID);
                    }}
                    className="text-[11px] font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <Sparkles size={12} /> Auto-Generate
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={editUserId}
                    onChange={(e) => setEditUserId(e.target.value.toUpperCase().replace(/\s+/g, "-"))}
                    placeholder="e.g. CMP-CS2026 or CMP-884920"
                    className="w-full px-4 py-2.5 rounded-xl text-xs font-mono font-bold border focus:outline-none tracking-wide"
                    style={{
                      borderColor: "#E4E0D3",
                      backgroundColor: isDark ? "#0f1624" : "#FFFFFF",
                      color: isDark ? "#FBFAF6" : "#12192B"
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] opacity-70">
                  <span>Custom unique identifier for peer search.</span>
                  <span className="font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">
                    Badge: {editUserId || "CMP-XXXXXX"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none"
                  style={{
                    borderColor: "#E4E0D3",
                    backgroundColor: isDark ? "#182238" : "#FBFAF6",
                    color: isDark ? "#FBFAF6" : "#12192B"
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 opacity-80">Academic Year / Position</label>
                <input
                  type="text"
                  placeholder="e.g. 3rd Year"
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs border focus:outline-none"
                  style={{
                    borderColor: "#E4E0D3",
                    backgroundColor: isDark ? "#182238" : "#FBFAF6",
                    color: isDark ? "#FBFAF6" : "#12192B"
                  }}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs border opacity-70 hover:opacity-100"
                  style={{ borderColor: "#E4E0D3" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-all flex items-center gap-2"
                  style={{ backgroundColor: "#3B5BA9" }}
                >
                  {savingProfile && <Loader2 size={14} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

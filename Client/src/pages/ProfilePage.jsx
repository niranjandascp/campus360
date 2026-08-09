import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search, User as UserIcon, Edit3, MessageSquare,
  Loader2, X, Camera, CheckCircle2
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getCurrentUserProfile, getUserProfile,
  updateUserProfile, searchUsers,
  createConversation, uploadAvatar, API_URL
} from "@/services/api";

const SERVER_BASE = API_URL.replace("/api", "");

const DEMO_DIRECTORY = [
  { _id: "dir-1", name: "System Administrator", email: "admin@campus360.edu", department: "Administration", year: "Faculty", role: "admin", userId: "CMP-888888" },
  { _id: "dir-2", name: "Sarah Jenkins", email: "sarah.j@student.campus.edu", department: "Computer Science", year: "3rd Year", role: "student", userId: "CMP-104928" },
  { _id: "dir-3", name: "Prof. Alan Vance", email: "alan.vance@campus360.edu", department: "Electronics", year: "Senior Faculty", role: "faculty", userId: "FAC-90123" },
  { _id: "dir-4", name: "David Chen", email: "david.c@student.campus.edu", department: "Information Tech", year: "2nd Year", role: "student", userId: "CMP-772910" }
];

function AvatarDisplay({ src, name, size = 80, onClick, showCamera = false }) {
  const initials = name ? name.charAt(0).toUpperCase() : "U";

  return (
    <div
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: 20, position: "relative",
        flexShrink: 0, cursor: onClick ? "pointer" : "default",
        overflow: "visible"
      }}
    >
      {src ? (
        <img
          src={src.startsWith("http") ? src : `${SERVER_BASE}${src}`}
          alt={name}
          style={{
            width: size, height: size, borderRadius: 20,
            objectFit: "cover", display: "block",
            border: "3px solid rgba(101,70,219,0.4)"
          }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: 20,
          background: "linear-gradient(135deg,#6546DB,#8E5AEF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, color: "#fff", fontSize: size * 0.36,
          boxShadow: "0 4px 20px rgba(101,70,219,0.35)"
        }}>
          {initials}
        </div>
      )}

      {showCamera && (
        <div style={{
          position: "absolute", bottom: -4, right: -4,
          width: 28, height: 28, borderRadius: "50%",
          background: "#6546DB", border: "2px solid var(--surface-card)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(101,70,219,0.4)"
        }}>
          <Camera size={13} color="#fff" />
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState("");

  const [activeTab, setActiveTab] = useState("my-profile");
  const [searchQuery, setSearchQuery] = useState("");
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editUserId, setEditUserId] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !stored) { navigate("/signin"); return; }

    try { setCurrentUser(JSON.parse(stored)); }
    catch (e) { navigate("/signin"); return; }

    fetchProfile();
    fetchDirectory();
  }, [identifier]);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = !identifier || identifier === "me"
        ? await getCurrentUserProfile()
        : await getUserProfile(identifier);

      if (data && (data._id || data.id)) {
        setProfileData(data);
        setEditName(data.name || "");
        setEditDept(data.department || "");
        setEditYear(data.year || "");
        setEditUserId(data.userId || "");
      } else {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfileData(parsed);
          setEditName(parsed.name || "");
          setEditDept(parsed.department || "");
          setEditYear(parsed.year || "");
          setEditUserId(parsed.userId || `CMP-${Math.floor(100000 + Math.random() * 900000)}`);
        }
      }
    } catch (err) {
      const stored = localStorage.getItem("user");
      if (stored) setProfileData(JSON.parse(stored));
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchDirectory = async (query = searchQuery) => {
    setLoadingDirectory(true);
    try {
      const data = await searchUsers(query);
      setDirectoryUsers(Array.isArray(data) && data.length > 0 ? data : DEMO_DIRECTORY);
    } catch (err) {
      setDirectoryUsers(DEMO_DIRECTORY);
    } finally {
      setLoadingDirectory(false);
    }
  };

  // ── AVATAR UPLOAD ──
  const handleAvatarClick = () => {
    if (!identifier || identifier === "me") {
      avatarInputRef.current?.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    setAvatarSuccess("");
    try {
      const res = await uploadAvatar(file);
      if (res.avatar) {
        const merged = { ...(profileData || currentUser), avatar: res.avatar };
        setProfileData(merged);
        setCurrentUser(merged);
        localStorage.setItem("user", JSON.stringify(merged));
        setAvatarSuccess("Profile picture updated!");
        setTimeout(() => setAvatarSuccess(""), 3000);
      }
    } catch (err) {
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleStartChat = async (targetUserId) => {
    try { await createConversation(targetUserId); } catch (err) {}
    navigate("/messages");
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setEditError("");
    setEditSuccess("");
    try {
      const updated = { name: editName, department: editDept, year: editYear, userId: editUserId };
      await updateUserProfile(updated);
      const merged = { ...(profileData || currentUser), ...updated };
      setProfileData(merged);
      setCurrentUser(merged);
      localStorage.setItem("user", JSON.stringify(merged));
      setEditSuccess("Profile updated successfully!");
      setTimeout(() => { setIsEditOpen(false); setEditSuccess(""); }, 1200);
    } catch (err) {
      setEditError("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const displayUser = profileData || currentUser || { name: "Campus Student", email: "" };
  const isOwnProfile = !identifier || identifier === "me";

  return (
    <DashboardLayout user={currentUser} onLogout={() => { localStorage.clear(); navigate("/signin"); }} activeNav="profile">

      {/* Avatar upload success toast */}
      {avatarSuccess && (
        <div style={{
          position: "fixed", top: 80, right: 24, zIndex: 50,
          padding: "10px 16px", borderRadius: 12, fontSize: 12,
          backgroundColor: "#20B486", color: "#fff", fontWeight: 700,
          display: "flex", alignItems: "center", gap: 6,
          boxShadow: "0 4px 20px rgba(32,180,134,0.4)"
        }}>
          <CheckCircle2 size={15} /> {avatarSuccess}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleAvatarChange}
        style={{ display: "none" }}
      />

      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6546DB] uppercase tracking-wider">
            <UserIcon className="w-4 h-4 text-[#6546DB]" />
            <span>Campus Directory & Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">Student & Faculty Hub</h1>
        </div>

        <div className="flex p-1 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab("my-profile")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === "my-profile" ? "bg-[#6546DB] text-white shadow-xs" : "text-[var(--text-secondary)]"}`}
          >
            My Profile
          </button>
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === "directory" ? "bg-[#6546DB] text-white shadow-xs" : "text-[var(--text-secondary)]"}`}
          >
            Campus Directory ({directoryUsers.length})
          </button>
        </div>
      </div>

      {/* ===== MY PROFILE TAB ===== */}
      {activeTab === "my-profile" && (
        <div className="max-w-3xl space-y-5">
          {loadingProfile ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-[#6546DB]" size={32} />
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#6546DB]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* AVATAR */}
                <div style={{ position: "relative" }}>
                  {uploadingAvatar ? (
                    <div style={{
                      width: 88, height: 88, borderRadius: 20,
                      background: "linear-gradient(135deg,#6546DB,#8E5AEF)",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <Loader2 className="animate-spin" color="#fff" size={24} />
                    </div>
                  ) : (
                    <AvatarDisplay
                      src={displayUser.avatar}
                      name={displayUser.name}
                      size={88}
                      onClick={isOwnProfile ? handleAvatarClick : undefined}
                      showCamera={isOwnProfile}
                    />
                  )}
                  {isOwnProfile && (
                    <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6, textAlign: "center" }}>
                      Click to change
                    </p>
                  )}
                </div>

                {/* DETAILS */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-[var(--text-primary)]">{displayUser.name}</h2>
                      <p className="text-xs text-[var(--text-secondary)]">{displayUser.email}</p>
                    </div>
                    {isOwnProfile && (
                      <button
                        onClick={() => setIsEditOpen(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-all"
                      >
                        <Edit3 size={14} /> Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-[var(--border-color)] text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Department</span>
                      <span className="font-semibold text-[var(--text-primary)]">{displayUser.department || "Computer Science"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Academic Year</span>
                      <span className="font-semibold text-[var(--text-primary)]">{displayUser.year || "Student"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Campus ID</span>
                      <span className="font-mono font-semibold text-[#6546DB]">{displayUser.userId || "CMP-000000"}</span>
                    </div>
                  </div>

                  {displayUser.stats && (
                    <div className="flex gap-4 mt-4 pt-4 border-t border-[var(--border-color)]">
                      <div className="text-center">
                        <div className="font-bold text-lg text-[#6546DB]">{displayUser.stats.issuesReported || 0}</div>
                        <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Issues Reported</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-[#20B486]">{displayUser.stats.lostFoundPosts || 0}</div>
                        <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">L&F Posts</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== DIRECTORY TAB ===== */}
      {activeTab === "directory" && (
        <div className="space-y-5">
          <form onSubmit={(e) => { e.preventDefault(); fetchDirectory(searchQuery); }}
            className="p-4 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search by name, email or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
              />
            </div>
            <button type="submit" className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#6546DB] text-white hover:opacity-90">
              Search
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {directoryUsers.map((u) => (
              <div key={u._id} className="p-4 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AvatarDisplay src={u.avatar} name={u.name} size={44} />
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs text-[var(--text-primary)] truncate">{u.name}</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate">{u.department || "Campus Member"}</p>
                    <span className="text-[10px] font-mono text-[#6546DB] font-semibold">{u.userId || "CMP-USER"}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartChat(u._id)}
                  className="p-2 rounded-xl bg-[#6546DB]/10 border border-[#6546DB]/20 text-[#6546DB] hover:bg-[#6546DB] hover:text-white transition-all shrink-0"
                  title="Send Message"
                >
                  <MessageSquare size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== EDIT PROFILE MODAL ===== */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-2xl relative">
            <button onClick={() => setIsEditOpen(false)} className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-1">Edit Profile</h2>
            <p className="text-xs text-[var(--text-secondary)] mb-5">Update your details across the campus platform</p>

            {editSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-[#20B486]/10 border border-[#20B486]/20 text-[#20B486] text-xs font-semibold">
                {editSuccess}
              </div>
            )}
            {editError && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Avatar change inside modal */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <div style={{ position: "relative", cursor: "pointer" }} onClick={handleAvatarClick}>
                  <AvatarDisplay src={displayUser.avatar} name={displayUser.name} size={52} showCamera />
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Profile Picture</p>
                  <button type="button" onClick={handleAvatarClick}
                    className="text-[#6546DB] font-semibold hover:underline mt-0.5 text-[11px]">
                    {uploadingAvatar ? "Uploading..." : "Click avatar or here to change"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Full Name</label>
                <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none" />
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Department</label>
                <input type="text" value={editDept} onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none" />
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Academic Year</label>
                <input type="text" placeholder="e.g. 3rd Year / Computer Engineering" value={editYear} onChange={(e) => setEditYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none" />
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Campus ID Number</label>
                <input type="text" value={editUserId} onChange={(e) => setEditUserId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none" />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold border border-[var(--border-color)] text-[var(--text-secondary)]">Cancel</button>
                <button type="submit" disabled={savingProfile}
                  className="px-5 py-2 rounded-xl font-semibold bg-[#6546DB] text-white hover:opacity-90">
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Wrench, Calendar, Package, MessageSquare,
  User, LogOut, Menu, X, Sun, Moon, Sparkles, Camera, MapPin
} from "lucide-react";
import { uploadAvatar } from "@/services/api";

export default function DashboardLayout({ children, user, onLogout, activeNav }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Apply theme to document root on mount and when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.backgroundColor = theme === "dark" ? "#0A0B1C" : "#F1F5F9";
    root.style.color = theme === "dark" ? "#FFFFFF" : "#0F172A";
    document.body.style.backgroundColor = theme === "dark" ? "#0A0B1C" : "#F1F5F9";
    document.body.style.color = theme === "dark" ? "#FFFFFF" : "#0F172A";
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const handleSidebarAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadAvatar(file);
      if (res.avatar) {
        const updatedUser = { ...user, avatar: res.avatar };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("storage")); // Dispatch event to update other components if needed
        window.location.reload(); // Quickest way to sync avatar globally across the app
      }
    } catch (err) {
      console.error("Avatar upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "issues", label: "Issue Tracker", icon: Wrench, path: "/issues" },
    { id: "events", label: "Event Hub", icon: Calendar, path: "/events" },
    { id: "rooms", label: "Room Finder", icon: MapPin, path: "/rooms" },
    { id: "marketplace", label: "Lost & Found", icon: Package, path: "/lost-found" },
    { id: "messages", label: "Messages", icon: MessageSquare, path: "/messages" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  const activePath = location.pathname;

  return (
    <div
      className="min-h-screen font-sans flex flex-col md:flex-row antialiased"
      style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* SIDEBAR - DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 border-r p-5 shrink-0 z-30 justify-between"
        style={{ backgroundColor: "#11132A", borderColor: "#252744" }}>
        <div>
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 mb-8 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6546DB] to-[#8E5AEF] flex items-center justify-center text-white shadow-lg shadow-[#6546DB]/30">
              <Sparkles size={20} />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight block leading-none">
                Campus360
              </span>
              <span className="text-[10px] text-[#B7B8C9] uppercase tracking-wider font-semibold">
                SaaS Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id || activePath === item.path;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#6546DB] to-[#8E5AEF] text-white shadow-md shadow-[#6546DB]/20"
                      : "text-[#B7B8C9] hover:bg-[#181A35] hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Theme Toggle */}
        <div className="pt-4 border-t space-y-3" style={{ borderColor: "#252744" }}>
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-semibold text-[#B7B8C9]">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-colors"
              style={{ backgroundColor: "#181A35", color: "#B7B8C9" }}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {user && (
            <div className="flex items-center justify-between p-2 rounded-xl border" style={{ backgroundColor: "#181A35", borderColor: "#252744" }}>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleSidebarAvatarUpload} 
                accept="image/jpeg,image/png,image/webp" 
                style={{ display: "none" }} 
              />

              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div 
                  className="relative shrink-0 cursor-pointer group"
                  style={{ width: 32, height: 32 }}
                  onClick={() => fileInputRef.current?.click()}
                  title="Change Profile Picture"
                >
                  <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#6546DB] to-[#8E5AEF] flex items-center justify-center font-bold text-white text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  
                  {user.avatar && (
                    <img
                      src={user.avatar.startsWith("http") ? user.avatar : `http://localhost:3000${user.avatar}`}
                      alt={user.name}
                      className="absolute inset-0 w-full h-full rounded-lg object-cover"
                      style={{ border: "2px solid rgba(101,70,219,0.4)" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploading ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Camera size={14} color="#fff" />
                    )}
                  </div>
                </div>

                <Link to="/profile" className="min-w-0 flex-1 hover:opacity-80 transition-opacity block">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-[#B7B8C9] truncate capitalize">{user.role || "Student"}</p>
                </Link>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}

          {!user && (
            <div className="flex flex-col gap-2 pt-2">
              <Link 
                to="/signin" 
                className="w-full py-2 text-center text-xs font-bold text-white rounded-xl bg-gradient-to-r from-[#6546DB] to-[#8E5AEF] hover:opacity-90 transition-opacity shadow-md shadow-[#6546DB]/20"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="w-full py-2 text-center text-xs font-bold text-[#B7B8C9] rounded-xl border border-[#252744] bg-[#181A35] hover:bg-[#252744] hover:text-white transition-all"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-40"
        style={{ backgroundColor: "#11132A", borderColor: "#252744" }}>
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6546DB] to-[#8E5AEF] flex items-center justify-center text-white shadow-md">
            <Sparkles size={16} />
          </div>
          <span className="font-extrabold text-base text-white tracking-tight">Campus360</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[#B7B8C9]"
            style={{ backgroundColor: "#181A35" }}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#B7B8C9]"
            style={{ backgroundColor: "#181A35" }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}>
          <div className="w-4/5 max-w-xs h-full border-r p-5 flex flex-col justify-between"
            style={{ backgroundColor: "#11132A", borderColor: "#252744" }}
            onClick={e => e.stopPropagation()}>
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-white text-sm">Navigation</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-[#B7B8C9]">
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNav === item.id || activePath === item.path;

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold ${
                        isActive
                          ? "bg-gradient-to-r from-[#6546DB] to-[#8E5AEF] text-white"
                          : "text-[#B7B8C9] hover:bg-[#181A35]"
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {user && (
              <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: "#252744" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#6546DB] flex items-center justify-center text-white font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[10px] text-[#B7B8C9]">{user.email}</p>
                  </div>
                </div>

                <button onClick={onLogout} className="text-red-400 p-2">
                  <LogOut size={16} />
                </button>
              </div>
            )}

            {!user && (
              <div className="pt-4 border-t flex flex-col gap-2" style={{ borderColor: "#252744" }}>
                <Link 
                  to="/signin" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold text-white rounded-xl bg-gradient-to-r from-[#6546DB] to-[#8E5AEF]"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-bold text-[#B7B8C9] rounded-xl border border-[#252744] bg-[#181A35]"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto"
        style={{ backgroundColor: "var(--bg-primary)" }}>
        {children}
      </main>
    </div>
  );
}

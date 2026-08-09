import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Edit3,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon
} from "lucide-react";
import { Tabs } from "@/components/ui/vercel-tabs";

const NAV_TABS = [
  { id: "home", label: "Home" },
  { id: "issues", label: "Issues" },
  { id: "lost-found", label: "Lost & Found" },
  { id: "event-hub", label: "Event Hub" },
  { id: "messages", label: "Messages" }
];

export function Navbar({ user, onLogout, onEditProfile, activeTab = "home", theme = "light", onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const isDark = theme === "dark";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTabChange = (tabId) => {
    if (tabId === "home") navigate("/");
    else if (tabId === "issues") navigate("/issues");
    else if (tabId === "lost-found") navigate("/lost-found");
    else if (tabId === "event-hub") navigate("/event-hub");
    else if (tabId === "messages") navigate("/messages");
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-7xl transition-all duration-300">
      <div
        className={`w-full transition-all duration-300 border backdrop-blur-xl ${
          mobileMenuOpen ? "rounded-3xl shadow-2xl" : "rounded-full shadow-lg hover:shadow-xl"
        }`}
        style={{
          background: isDark
            ? scrolled ? "rgba(15, 23, 42, 0.94)" : "rgba(22, 30, 46, 0.88)"
            : scrolled ? "rgba(251, 250, 246, 0.94)" : "rgba(255, 255, 255, 0.88)",
          borderColor: isDark ? "rgba(45, 55, 72, 0.9)" : "rgba(228, 224, 211, 0.9)",
          boxShadow: scrolled
            ? isDark ? "0 20px 30px -10px rgba(0,0,0,0.5)" : "0 20px 30px -10px rgba(18, 25, 43, 0.12)"
            : isDark ? "0 10px 25px -5px rgba(0,0,0,0.4)" : "0 10px 25px -5px rgba(18, 25, 43, 0.08)",
        }}
      >
        <div className="px-4 sm:px-6 py-2.5 flex justify-between items-center">
          {/* Brand / Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: isDark ? "#EAB308" : "var(--ink, #12192B)" }}>
              <span style={{ color: isDark ? "#0F172A" : "var(--gold, #CB9A2E)", fontFamily: "var(--font-display, serif)", fontWeight: 700 }}>C</span>
            </div>
            <span className="text-base sm:text-lg font-semibold tracking-tight" style={{ fontFamily: "var(--font-display, serif)", color: isDark ? "#F8FAFC" : "var(--ink, #12192B)" }}>
              Campus Connect
            </span>
          </Link>

          {/* Center: Vercel Animated Floating Nav Tabs */}
          <nav className={`hidden md:flex items-center px-2 py-0.5 rounded-full border shadow-xs ${isDark ? "bg-slate-900/80 border-slate-700/80" : "bg-white/70 border-amber-100/80"}`}>
            <Tabs tabs={NAV_TABS} activeTab={activeTab} onTabChange={handleTabChange} />
          </nav>

          {/* Right Actions: Theme Toggle & Auth / Profile */}
          <div className="flex items-center gap-2 sm:gap-3 relative">
            {/* Theme Switching Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-full border transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95 focus:outline-none ${
                isDark 
                  ? "bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700 shadow-inner" 
                  : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 shadow-sm"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun size={18} className="animate-in spin-in-180 duration-300" />
              ) : (
                <Moon size={18} className="animate-in spin-in-180 duration-300" />
              )}
            </button>

            {/* Auth / Profile Actions */}
            <div className="hidden md:flex items-center gap-3 relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all shadow-sm focus:outline-none ${
                      isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-750 text-white" : "bg-white border-amber-200 hover:bg-gray-50 text-slate-900"
                    }`}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-inner" style={{ background: isDark ? "#EAB308" : "var(--ink, #12192B)", color: isDark ? "#0F172A" : "var(--gold, #CB9A2E)" }}>
                        {user.name ? user.name.charAt(0) : "U"}
                      </div>
                    )}
                    <span className="text-sm font-semibold max-w-[120px] truncate">
                      {user.name || "Profile"}
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${profileDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div
                      className={`absolute right-0 mt-3 w-64 rounded-2xl border shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
                        isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-amber-200 text-slate-900"
                      }`}
                    >
                      <div className={`p-3 border-b mb-1 flex items-center gap-3 ${isDark ? "border-slate-800" : "border-gray-100"}`}>
                        {user.avatar ? (
                          <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm uppercase shadow-inner flex-shrink-0" style={{ background: isDark ? "#EAB308" : "var(--ink, #12192B)", color: isDark ? "#0F172A" : "var(--gold, #CB9A2E)" }}>
                            {user.name ? user.name.charAt(0) : "U"}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-bold text-sm truncate">{user.name}</p>
                          <p className={`text-xs truncate ${isDark ? "text-slate-400" : "text-gray-500"}`}>{user.email}</p>
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                            <ShieldCheck size={11} /> Verified Student
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onEditProfile?.();
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                          isDark ? "text-slate-200 hover:bg-slate-800 hover:text-white" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-900"
                        }`}
                      >
                        <Edit3 size={16} className={isDark ? "text-indigo-400" : "text-indigo-600"} />
                        Edit Profile & Avatar
                      </button>

                      <button
                        onClick={() => {
                          onLogout?.();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-500 rounded-xl hover:bg-red-500/10 transition-colors mt-1"
                      >
                        <LogOut size={16} />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/signin"
                    className={`px-4 py-1.5 rounded-full font-semibold text-sm hover:opacity-80 transition-opacity ${
                      isDark ? "text-slate-200" : "text-slate-900"
                    }`}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className={`px-5 py-2 rounded-full font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${
                      isDark ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-900 text-amber-50"
                    }`}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl transition-colors focus:outline-none flex items-center gap-2 ${
                isDark ? "text-slate-200 hover:bg-slate-800" : "text-gray-700 hover:bg-black/5"
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {user && (
                user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase" style={{ background: isDark ? "#EAB308" : "var(--ink, #12192B)", color: isDark ? "#0F172A" : "var(--gold, #CB9A2E)" }}>
                    {user.name ? user.name.charAt(0) : "U"}
                  </div>
                )
              )}
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className={`md:hidden px-5 pb-6 pt-2 flex flex-col gap-3 animate-in slide-in-from-top duration-300 border-t ${
            isDark ? "border-slate-800 text-slate-200" : "border-amber-100 text-slate-900"
          }`}>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold py-2 border-b border-opacity-20"
            >
              Home
            </Link>
            <Link
              to="/issues"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold py-2 border-b border-opacity-20"
            >
              Issues Tracker
            </Link>
            <Link
              to="/lost-found"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold py-2 border-b border-opacity-20"
            >
              Lost & Found
            </Link>
            <Link
              to="/event-hub"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold py-2 border-b border-opacity-20"
            >
              Event Hub
            </Link>
            <Link
              to="/messages"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold py-2 border-b border-opacity-20"
            >
              Messages
            </Link>

            {user ? (
              <div className="pt-2 flex flex-col gap-3">
                <div className={`p-3 rounded-2xl border flex items-center gap-3 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-amber-200"}`}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm uppercase shadow-inner" style={{ background: isDark ? "#EAB308" : "var(--ink, #12192B)", color: isDark ? "#0F172A" : "var(--gold, #CB9A2E)" }}>
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm">{user.name}</p>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onEditProfile?.();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-center py-2.5 rounded-full font-semibold text-sm border flex items-center justify-center gap-2 ${
                    isDark ? "border-slate-700 text-slate-200 hover:bg-slate-800" : "border-slate-900 text-slate-900"
                  }`}
                >
                  <Edit3 size={16} /> Edit Profile & Image
                </button>
                <button
                  onClick={() => {
                    onLogout?.();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 rounded-full font-semibold text-sm bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 mt-1">
                <Link
                  to="/signin"
                  className={`w-full text-center py-2.5 rounded-full font-semibold text-sm border ${
                    isDark ? "border-slate-700 text-slate-200" : "border-slate-900 text-slate-900"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className={`w-full text-center py-2.5 rounded-full font-semibold text-sm shadow-md ${
                    isDark ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-900 text-amber-50"
                  }`}
                >
                  Sign Up Now
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;

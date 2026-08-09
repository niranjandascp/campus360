import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck, KeyRound } from "lucide-react";
import { adminLoginUser } from "@/services/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await adminLoginUser(email, password);

      if (res.token && res.user) {
        if (res.user.role !== "admin") {
          setError("Access Denied: Admin privileges required. Normal student accounts cannot log in here.");
          setLoading(false);
          return;
        }

        // Store credentials
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));

        // Navigate to Admin Dashboard
        navigate("/admin");
      } else {
        setError(res.message || "Invalid admin credentials.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Server error. Please verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden"
      style={{
        backgroundColor: "#12192B",
        color: "#FBFAF6",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Background Decorative Ambient Gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Main Glass Card */}
      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold opacity-70 hover:opacity-100 hover:-translate-x-1 transition-all"
          >
            <ArrowLeft size={16} /> Return to Campus Connect
          </Link>
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Admin Access Only
          </span>
        </div>

        {/* Header Branding */}
        <div
          className="p-8 sm:p-10 rounded-3xl border shadow-2xl space-y-6 backdrop-blur-xl relative overflow-hidden"
          style={{
            borderColor: "#E4E0D3",
            backgroundColor: "#0F1624"
          }}
        >
          <div className="text-center space-y-3">
            <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg">
              <Shield size={36} />
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Admin Portal Login
            </h1>
            <p className="text-xs opacity-75 max-w-xs mx-auto leading-relaxed">
              Authorized System Administrators & Campus Moderation Command Panel
            </p>
          </div>

          {/* Alert Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 text-amber-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@campus360.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  style={{
                    borderColor: "#E4E0D3",
                    backgroundColor: "#182238",
                    color: "#FBFAF6"
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                Admin Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50 text-amber-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-2xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  style={{
                    borderColor: "#E4E0D3",
                    backgroundColor: "#182238",
                    color: "#FBFAF6"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                backgroundColor: "#CB9A2E",
                color: "#FFFFFF"
              }}
            >
              {loading ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  <ShieldCheck size={18} /> Authenticate Admin Access
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1.5">
            <p className="text-[11px] font-bold text-amber-400">Default Admin Credentials</p>
            <p className="text-[10px] opacity-75 font-mono">admin@campus360.edu • admin123</p>
            <button
              type="button"
              onClick={() => {
                setEmail("admin@campus360.edu");
                setPassword("admin123");
              }}
              className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white hover:bg-amber-400 transition-colors shadow-sm"
            >
              Auto-Fill Credentials
            </button>
          </div>

          {/* Security Notice */}
          <div className="pt-4 border-t text-center space-y-2" style={{ borderColor: "#E4E0D3" }}>
            <div className="flex items-center justify-center gap-1.5 text-[11px] opacity-60">
              <KeyRound size={13} className="text-amber-400" /> Protected by Campus360 Role Guard Middleware
            </div>
            <p className="text-[10px] opacity-40">
              Normal student users will be rejected automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

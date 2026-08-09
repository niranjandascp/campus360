import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Shield, Lock, Mail, Eye, EyeOff, AlertCircle,
  ArrowLeft, ShieldCheck, Sparkles, KeyRound, Zap
} from "lucide-react";
import { adminLoginUser } from "@/services/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminLoginUser(email, password);
      if (res.token && res.user) {
        if (res.user.role !== "admin") {
          setError("Access Denied: Admin privileges required for this portal.");
          setLoading(false);
          return;
        }
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        navigate("/admin");
      } else {
        setError(res.message || "Invalid admin credentials. Please try again.");
      }
    } catch (err) {
      setError("Server connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: "#060813" }}>

      {/* Animated background blobs */}
      <div style={{
        position: "absolute", top: "15%", left: "10%",
        width: 420, height: 420,
        background: "radial-gradient(circle, rgba(101,70,219,0.18) 0%, transparent 70%)",
        borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "8%",
        width: 360, height: 360,
        background: "radial-gradient(circle, rgba(142,90,239,0.15) 0%, transparent 70%)",
        borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", top: "50%", right: "25%",
        width: 200, height: 200,
        background: "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)",
        borderRadius: "50%", filter: "blur(30px)", pointerEvents: "none"
      }} />

      <div className="relative z-10 w-full max-w-md space-y-4">

        {/* Back link */}
        <Link to="/signin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
          style={{ color: "#94A3B8" }}
          onMouseOver={e => e.currentTarget.style.color = "#fff"}
          onMouseOut={e => e.currentTarget.style.color = "#94A3B8"}
        >
          <ArrowLeft size={14} /> Back to Student Login
        </Link>

        {/* CARD */}
        <div style={{
          backgroundColor: "#0E1028",
          border: "1px solid rgba(101,70,219,0.25)",
          borderRadius: 28,
          padding: "32px 28px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(101,70,219,0.1)"
        }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              display: "inline-flex", padding: 14, borderRadius: 20, marginBottom: 16,
              background: "linear-gradient(135deg, rgba(101,70,219,0.2), rgba(142,90,239,0.15))",
              border: "1px solid rgba(101,70,219,0.3)",
              boxShadow: "0 0 30px rgba(101,70,219,0.2)"
            }}>
              <Shield size={32} color="#8E5AEF" />
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "3px 10px", borderRadius: 20, marginBottom: 12,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)"
            }}>
              <Zap size={10} color="#ef4444" />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Restricted Access
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              Admin Control Center
            </h1>
            <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>
              Campus360 System Administration Portal
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: 12, marginBottom: 16,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
              display: "flex", alignItems: "center", gap: 8,
              color: "#f87171", fontSize: 12, fontWeight: 600
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                Admin Email Address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
                <input
                  type="email"
                  required
                  placeholder="admin@campus360.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%", paddingLeft: 38, paddingRight: 14, paddingTop: 11, paddingBottom: 11,
                    borderRadius: 12, fontSize: 12, backgroundColor: "#070918",
                    border: "1px solid rgba(101,70,219,0.25)", color: "#fff",
                    outline: "none", boxSizing: "border-box"
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(101,70,219,0.6)"}
                  onBlur={e => e.target.style.borderColor = "rgba(101,70,219,0.25)"}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                Admin Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#475569" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%", paddingLeft: 38, paddingRight: 44, paddingTop: 11, paddingBottom: 11,
                    borderRadius: 12, fontSize: 12, backgroundColor: "#070918",
                    border: "1px solid rgba(101,70,219,0.25)", color: "#fff",
                    outline: "none", boxSizing: "border-box"
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(101,70,219,0.6)"}
                  onBlur={e => e.target.style.borderColor = "rgba(101,70,219,0.25)"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 2
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 14, fontSize: 12,
                fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer",
                background: loading ? "#334155" : "linear-gradient(135deg, #6546DB, #8E5AEF)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: loading ? "none" : "0 4px 20px rgba(101,70,219,0.4)",
                transition: "all 0.2s", marginTop: 4
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite",
                    display: "inline-block"
                  }} />
                  Authenticating...
                </>
              ) : (
                <><ShieldCheck size={16} /> Authenticate & Access Admin</>
              )}
            </button>
          </form>

          {/* Demo credentials box */}
          <div style={{
            marginTop: 20, padding: "14px 16px", borderRadius: 16,
            background: "linear-gradient(135deg, rgba(101,70,219,0.08), rgba(142,90,239,0.05))",
            border: "1px solid rgba(101,70,219,0.2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <KeyRound size={12} color="#8E5AEF" />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#8E5AEF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Demo Credentials
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace", margin: "0 0 10px" }}>
              admin@campus360.edu &nbsp;/&nbsp; admin123
            </p>
            <button
              type="button"
              onClick={() => { setEmail("admin@campus360.edu"); setPassword("admin123"); }}
              style={{
                padding: "6px 14px", borderRadius: 10, fontSize: 10, fontWeight: 700,
                backgroundColor: "#6546DB", color: "#fff", border: "none", cursor: "pointer"
              }}
            >
              Auto-Fill Credentials
            </button>
          </div>

          {/* Divider + student portal link */}
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <p style={{ fontSize: 11, color: "#475569" }}>
              Not an admin?{" "}
              <Link to="/signin" style={{ color: "#8E5AEF", fontWeight: 700, textDecoration: "none" }}>
                Student Portal →
              </Link>
            </p>
          </div>
        </div>

        {/* Footer badge */}
        <div style={{ textAlign: "center" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 10, color: "#334155", fontWeight: 600
          }}>
            <Sparkles size={11} color="#6546DB" />
            Campus360 · Secured Administration Gateway
          </span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

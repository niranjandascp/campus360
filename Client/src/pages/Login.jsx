import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { Sparkles, ArrowLeft, Mail, Lock, LogIn, AlertCircle } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await loginUser(email, password);
      if (data.token) {
        localStorage.setItem("token", data.token);
        const userData = data.user || { name: email.split("@")[0], email };
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/");
      } else {
        setError(data.message || "Invalid login credentials");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-[#080A18] text-white overflow-hidden">
      {/* BACKGROUND BLUR DECORATIONS */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-[#6546DB]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-[#4D7CFE]/15 rounded-full blur-[90px] pointer-events-none" />

      {/* COMPACT MEDIUM CARD CONTAINER (MAX-W-MD) */}
      <div className="relative z-10 w-full max-w-md bg-[#11132A]/90 backdrop-blur-xl border border-[#252744] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        {/* HEADER & TOP BAR */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B7B8C9] hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <span className="px-2.5 py-0.5 rounded-full bg-[#6546DB]/20 text-[#8E5AEF] text-[10px] font-bold uppercase tracking-wider border border-[#6546DB]/30 flex items-center gap-1">
            <Sparkles size={11} /> Campus360
          </span>
        </div>

        {/* TITLE */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-xs text-[#B7B8C9] mt-1">Sign in to your student campus portal</p>
        </div>

        {/* ERROR MSG */}
        {error && (
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl text-xs font-semibold border border-red-500/20 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#B7B8C9] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77798F]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-[#080A18] border border-[#252744] text-white placeholder-[#77798F] focus:outline-none focus:ring-2 focus:ring-[#6546DB]/50 transition-all"
                placeholder="student@campus.edu"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#B7B8C9] uppercase tracking-wider">
                Password
              </label>
              <a href="#" className="text-[11px] text-[#8E5AEF] font-semibold hover:underline">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77798F]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-[#080A18] border border-[#252744] text-white placeholder-[#77798F] focus:outline-none focus:ring-2 focus:ring-[#6546DB]/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#6546DB] to-[#8E5AEF] hover:opacity-95 shadow-md shadow-[#6546DB]/25 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={15} /> Sign In to Portal
              </>
            )}
          </button>
        </form>

        {/* SOCIAL SIGN IN */}
        <div className="pt-2">
          <div className="relative flex items-center justify-center mb-3">
            <div className="border-t border-[#252744] w-full" />
            <span className="bg-[#11132A] px-3 text-[10px] text-[#77798F] font-semibold uppercase absolute">
              Or Sign In With
            </span>
          </div>


        </div>

        {/* FOOTER LINK */}
        <p className="text-center text-xs text-[#77798F] pt-1">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#8E5AEF] hover:underline">
            Create Account
          </Link>
        </p>

        <div className="pt-3 border-t border-[#252744]/70 text-center">
          <p className="text-[10px] text-[#475569] mb-2 font-semibold uppercase tracking-wider">System Administration</p>
          <Link
            to="/admin-login"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold transition-all border border-[#6546DB]/30 text-[#8E5AEF] hover:bg-[#6546DB]/10 hover:border-[#6546DB]/60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Access Admin Control Center
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

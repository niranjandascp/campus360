import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import { Sparkles, ArrowLeft, User, Mail, Lock, UserPlus, AlertCircle } from "lucide-react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await registerUser(name, email, password);
      if (data.token || data.user || data.message === "User registered successfully" || !data.error) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        navigate("/signin");
      } else {
        setError(data.message || "Failed to register. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-[#080A18] text-white overflow-hidden">
      {/* BACKGROUND BLUR DECORATIONS */}
      <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-[#6546DB]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-[#20B486]/15 rounded-full blur-[90px] pointer-events-none" />

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
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Student Account</h2>
          <p className="text-xs text-[#B7B8C9] mt-1">Join thousands of students on Campus360</p>
        </div>

        {/* ERROR MSG */}
        {error && (
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl text-xs font-semibold border border-red-500/20 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#B7B8C9] uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77798F]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-[#080A18] border border-[#252744] text-white placeholder-[#77798F] focus:outline-none focus:ring-2 focus:ring-[#6546DB]/50 transition-all"
                placeholder="Alex Student"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#B7B8C9] uppercase tracking-wider mb-1">
              Campus Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77798F]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs bg-[#080A18] border border-[#252744] text-white placeholder-[#77798F] focus:outline-none focus:ring-2 focus:ring-[#6546DB]/50 transition-all"
                placeholder="alex@campus.edu"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#B7B8C9] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#77798F]" />
              <input
                type="password"
                required
                minLength={6}
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
            className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#6546DB] to-[#8E5AEF] hover:opacity-95 shadow-md shadow-[#6546DB]/25 transition-all flex items-center justify-center gap-2 mt-3"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={15} /> Create Account
              </>
            )}
          </button>
        </form>

        {/* SOCIAL SIGN UP */}
        <div className="pt-1">
          <div className="relative flex items-center justify-center mb-3">
            <div className="border-t border-[#252744] w-full" />
            <span className="bg-[#11132A] px-3 text-[10px] text-[#77798F] font-semibold uppercase absolute">
              Or Register With
            </span>
          </div>

        </div>

        {/* FOOTER LINK */}
        <p className="text-center text-xs text-[#77798F] pt-1">
          Already have an account?{' '}
          <Link to="/signin" className="font-bold text-[#8E5AEF] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

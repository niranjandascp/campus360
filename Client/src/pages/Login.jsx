import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";

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
    <div className="min-h-screen w-full relative flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden bg-slate-900">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-slate-900 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Background Image Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80')] bg-cover bg-center"></div>

      {/* Main Container - Glassmorphism */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left Side: Branding / Intro (Hidden on very small screens, visible on md+) */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-between p-10 lg:p-14 bg-gradient-to-br from-indigo-900 to-purple-900 relative overflow-hidden border-r border-white/10 group">
          
          {/* Animated Interactive Image Grid */}
          <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay flex gap-4 p-4 transform rotate-[-12deg] scale-[1.3] pointer-events-none group-hover:opacity-70 transition-opacity duration-700">
             {/* Column 1 */}
             <div className="flex flex-col gap-4 animate-[slideUp_20s_linear_infinite] group-hover:[animation-play-state:paused]">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80" className="w-48 h-64 object-cover rounded-2xl shadow-xl" alt="" />
                <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&q=80" className="w-48 h-48 object-cover rounded-2xl shadow-xl" alt="" />
                <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80" className="w-48 h-72 object-cover rounded-2xl shadow-xl" alt="" />
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80" className="w-48 h-64 object-cover rounded-2xl shadow-xl" alt="" />
             </div>
             {/* Column 2 */}
             <div className="flex flex-col gap-4 animate-[slideDown_25s_linear_infinite] mt-[-150px] group-hover:[animation-play-state:paused]">
                <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80" className="w-48 h-72 object-cover rounded-2xl shadow-xl" alt="" />
                <img src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&q=80" className="w-48 h-48 object-cover rounded-2xl shadow-xl" alt="" />
                <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&q=80" className="w-48 h-64 object-cover rounded-2xl shadow-xl" alt="" />
                <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80" className="w-48 h-72 object-cover rounded-2xl shadow-xl" alt="" />
             </div>
             {/* Column 3 */}
             <div className="flex flex-col gap-4 animate-[slideUp_22s_linear_infinite] group-hover:[animation-play-state:paused]">
                <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=80" className="w-48 h-48 object-cover rounded-2xl shadow-xl" alt="" />
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&q=80" className="w-48 h-72 object-cover rounded-2xl shadow-xl" alt="" />
                <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&q=80" className="w-48 h-64 object-cover rounded-2xl shadow-xl" alt="" />
                <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=80" className="w-48 h-48 object-cover rounded-2xl shadow-xl" alt="" />
             </div>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900 via-indigo-900/60 to-transparent z-0"></div>

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 mb-10 group cursor-pointer">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-105">🎓</div>
              <span className="text-2xl font-extrabold text-white tracking-tight">Campus Connect</span>
            </Link>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Welcome back to your campus.
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed">
              Log in to manage your bookings, discover exclusive events, and stay connected with your university life.
            </p>
          </div>
          
          <div className="mt-12">
            <div className="flex -space-x-3 mb-4">
              <img className="w-10 h-10 rounded-full border-2 border-indigo-300" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" alt="student" />
              <img className="w-10 h-10 rounded-full border-2 border-indigo-300" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" alt="student" />
              <img className="w-10 h-10 rounded-full border-2 border-indigo-300" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" alt="student" />
              <div className="w-10 h-10 rounded-full border-2 border-indigo-300 bg-white flex items-center justify-center text-xs font-bold text-indigo-900">+2k</div>
            </div>
            <p className="text-sm text-indigo-100">Join thousands of students already online.</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 lg:p-16 flex flex-col justify-center bg-white relative">
          {/* Top Home Link */}
          <Link to="/" className="absolute top-6 right-6 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 transition-colors bg-gray-100 hover:bg-indigo-50 px-3 py-1.5 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Home
          </Link>

          <div className="max-w-md w-full mx-auto">
            {/* Mobile Branding (Only shows on mobile) */}
            <Link to="/" className="md:hidden flex items-center gap-3 mb-8 justify-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-xl text-white shadow-lg">🎓</div>
              <span className="text-2xl font-bold text-gray-900">Campus Connect</span>
            </Link>

            <div className="text-center md:text-left mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-500">Access your student dashboard</p>
            </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900"
                  placeholder="Enter your campus email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <a href="#" className="text-sm text-indigo-600 font-semibold hover:text-indigo-700">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all bg-gray-50 focus:bg-white text-gray-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input id="remember-me" type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                Remember me for 30 days
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Sign In"}
            </button>
          </form>

          <div className="mt-8 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-gray-200 after:mt-0.5 after:flex-1 after:border-t after:border-gray-200">
            <p className="mx-4 mb-0 text-center text-sm font-semibold text-gray-500">
              Or continue with
            </p>
          </div>

          <div className="mt-6 flex flex-row gap-3">
            <button
              type="button"
              className="flex-1 inline-flex justify-center items-center py-3 px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex-1 inline-flex justify-center items-center py-3 px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              <svg className="h-5 w-5 mr-2 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </button>
          </div>

            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

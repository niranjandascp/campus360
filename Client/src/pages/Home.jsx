import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Wrench,
  CalendarDays,
  ShoppingBag,
  NotebookText,
  Car,
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  User,
  LogOut,
  Settings,
  Edit3,
  ChevronDown,
  Save,
  ShieldCheck,
  Camera,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Tabs } from '@/components/ui/vercel-tabs';

const NAV_TABS = [
  { id: 'home', label: 'Home' },
  { id: 'modules', label: 'Modules' },
  { id: 'how-it-works', label: 'How it Works' },
  { id: 'stats', label: 'Impact' },
];

const MODULES = [
  { icon: MapPin, tag: 'MOD.01', name: 'Lost & Found', copy: 'Post it, tag the spot, get it back. Most items are claimed within a day.', highlight: '94% Recovery Rate' },
  { icon: Wrench, tag: 'MOD.02', name: 'Issue Tracker', copy: 'Report a broken tap or a dead light. Watch it move from filed to fixed.', highlight: '< 24hr Avg Response' },
  { icon: CalendarDays, tag: 'MOD.03', name: 'Event Hub', copy: "Every club, every fest, one calendar. RSVP and get reminded on time.", highlight: '120+ Active Events' },
  { icon: ShoppingBag, tag: 'MOD.04', name: 'Marketplace', copy: "Sell what you're done with. Buy what a senior no longer needs.", highlight: 'Verified Students' },
  { icon: NotebookText, tag: 'MOD.05', name: 'Notes Exchange', copy: 'Semester notes and past papers, organized by subject, not by chat scroll.', highlight: '500+ Course Packs' },
  { icon: Car, tag: 'MOD.06', name: 'Ride Share', copy: "Same route, same time, split the ride. Find who's already heading your way.", highlight: 'Eco & Safe Commute' },
];

const STATS = [
  { value: 2400, suffix: '+', label: 'Active Students' },
  { value: 640, suffix: '+', label: 'Items Reclaimed' },
  { value: 180, suffix: '', label: 'Issues Resolved' },
  { value: 45, suffix: '+', label: 'Campus Clubs' },
];

const STEPS = [
  { n: '01', title: 'Sign in with Campus Email', copy: 'One account, instantly verified against your university directory.' },
  { n: '02', title: 'Choose Your Portal', copy: 'Report issues, trade textbooks, or discover events from one unified dashboard.' },
  { n: '03', title: 'Connect & Resolve', copy: 'Track status updates live, get notified, and close the loop seamlessly.' },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80',
];

function useCountUp(target, active) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf;
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);
  return value;
}

function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, [options]);
  return [ref, inView];
}

function Stat({ value, suffix, label }) {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const count = useCountUp(value, inView);
  return (
    <div ref={ref} className="flex flex-col items-center sm:items-start gap-1 p-5 sm:p-6 lg:p-8">
      <span className="text-3xl sm:text-4xl lg:text-5xl font-semibold tabular-nums" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-xs sm:text-sm tracking-wide uppercase font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--paper-dim)' }}>
        {label}
      </span>
    </div>
  );
}

function IdCard({ label, icon: Icon, rotate, offsetX, z, activeCard, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`absolute left-1/2 top-1/2 w-40 sm:w-48 md:w-52 rounded-2xl border p-4 sm:p-5 cursor-pointer transition-all duration-500 ease-out hover:scale-105 ${
        activeCard === label ? 'ring-2 ring-[var(--gold)] shadow-2xl' : ''
      }`}
      style={{
        transform: `translate(-50%, -50%) translateX(${offsetX}px) rotate(${rotate}deg)`,
        zIndex: activeCard === label ? 30 : z,
        background: 'var(--paper)',
        borderColor: activeCard === label ? 'var(--gold)' : 'var(--line)',
        boxShadow: '0 18px 34px -14px rgba(18,25,43,0.35)',
      }}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: 'var(--line)' }}>
        <span className="text-[9px] sm:text-[10px] tracking-[0.18em] uppercase" style={{ fontFamily: 'var(--font-mono)', color: 'var(--slate)' }}>
          Campus Connect
        </span>
        <span className={`w-2 h-2 rounded-full ${activeCard === label ? 'animate-ping' : ''}`} style={{ background: 'var(--gold)' }} />
      </div>
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--ink)' }}>
        <Icon size={18} color="var(--gold)" />
      </div>
      <p className="text-xs sm:text-sm font-semibold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
        {label}
      </p>
      <p className="text-[10px] sm:text-[11px] mt-1 flex items-center gap-1 font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--slate)' }}>
        ACCESS · GRANTED
      </p>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const [fanned, setFanned] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCard, setActiveCard] = useState('Issue Tracker');
  const [selectedModule, setSelectedModule] = useState(null);

  // Auth & Profile state
  const [user, setUser] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Profile edit form
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDept, setEditDept] = useState('Computer Science');
  const [editBio, setEditBio] = useState('Campus Connect Student Member');
  const [editAvatar, setEditAvatar] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setFanned(true), 400);
    
    // Check authentication status
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token) {
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          setEditName(parsed.name || '');
          setEditEmail(parsed.email || '');
          setEditDept(parsed.department || 'Computer Science');
          setEditBio(parsed.bio || 'Campus Connect Student Member');
          setEditAvatar(parsed.avatar || '');
        } catch {
          setUser({ name: 'Student', email: 'student@campus.edu' });
        }
      } else {
        setUser({ name: 'Student', email: 'student@campus.edu' });
      }
    }
    return () => clearTimeout(t);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleTabChange = (tabId) => {
    if (tabId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(tabId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      name: editName,
      email: editEmail,
      department: editDept,
      bio: editBio,
      avatar: editAvatar
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsEditingProfile(false);
  };

  return (
    <div
      style={{
        '--ink': '#12192B',
        '--paper': '#FBFAF6',
        '--paper-dim': '#C7CADA',
        '--gold': '#CB9A2E',
        '--slate': '#3B5BA9',
        '--line': '#E4E0D3',
        '--font-display': "'Fraunces', 'Georgia', serif",
        '--font-body': "'Inter', system-ui, sans-serif",
        '--font-mono': "'IBM Plex Mono', 'Menlo', monospace",
        background: 'var(--paper)',
        fontFamily: 'var(--font-body)',
        color: 'var(--ink)',
      }}
      className="min-h-screen w-full relative overflow-x-hidden"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        html { scroll-behavior: smooth; }
        .cc-underline {
          background-image: linear-gradient(transparent 65%, var(--gold) 65%);
          background-repeat: no-repeat;
          background-size: 0% 100%;
          transition: background-size 0.4s ease;
        }
        .cc-underline:hover { background-size: 100% 100% }
        .cc-card { transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease; }
        .cc-card:hover { transform: translateY(-6px); box-shadow: 0 20px 30px -10px rgba(18,25,43,0.1); }
        .cc-pin {
          position: absolute; top: -6px; left: 50%; transform: translateX(-50%);
          width: 10px; height: 10px; border-radius: 50%;
          box-shadow: 0 3px 6px rgba(0,0,0,0.25);
        }
        @media (prefers-reduced-motion: reduce) {
          * { transition: none !important; animation: none !important; }
        }
      `}</style>

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-all duration-300" style={{ background: 'rgba(251,250,246,0.92)', borderColor: 'var(--line)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: 'var(--ink)' }}>
              <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>C</span>
            </div>
            <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              Campus Connect
            </span>
          </Link>

          {/* Desktop Navigation Links - Vercel Animated Tabs */}
          <nav className="hidden md:flex items-center">
            <Tabs tabs={NAV_TABS} onTabChange={handleTabChange} />
          </nav>

          {/* Auth Actions / User Profile */}
          <div className="hidden md:flex items-center gap-3 relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50 transition-all shadow-sm focus:outline-none"
                  style={{ borderColor: 'var(--line)' }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-inner" style={{ background: 'var(--ink)', color: 'var(--gold)' }}>
                      {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                  )}
                  <span className="text-sm font-semibold max-w-[120px] truncate" style={{ color: 'var(--ink)' }}>
                    {user.name || 'Profile'}
                  </span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--ink)' }} />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl border bg-white shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    {/* User Header */}
                    <div className="p-3 border-b mb-1 flex items-center gap-3" style={{ borderColor: 'var(--line)' }}>
                      {user.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm uppercase shadow-inner flex-shrink-0" style={{ background: 'var(--ink)', color: 'var(--gold)' }}>
                          {user.name ? user.name.charAt(0) : 'U'}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                          <ShieldCheck size={11} /> Verified Student
                        </span>
                      </div>
                    </div>

                    {/* Menu Options */}
                    <button
                      onClick={() => {
                        setIsEditingProfile(true);
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-indigo-50 hover:text-indigo-900 transition-colors"
                    >
                      <Edit3 size={16} className="text-indigo-600" />
                      Edit Profile & Avatar
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors mt-1"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-5 py-2.5 rounded-full font-semibold text-sm hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--ink)' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-full font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                  style={{ background: 'var(--ink)', color: 'var(--paper)' }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-black/5 transition-colors focus:outline-none flex items-center gap-2"
            aria-label="Toggle Navigation Menu"
          >
            {user && (
              user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase" style={{ background: 'var(--ink)', color: 'var(--gold)' }}>
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
              )
            )}
            {mobileMenuOpen ? <X size={24} color="var(--ink)" /> : <Menu size={24} color="var(--ink)" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b px-5 py-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold py-2 border-b"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              Home
            </Link>
            <a
              href="#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold py-2 border-b"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              Explore Modules
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold py-2 border-b"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              How it Works
            </a>
            <a
              href="#stats"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-semibold py-2 border-b"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              Our Impact
            </a>
            
            {user ? (
              <div className="pt-2 flex flex-col gap-3">
                <div className="p-3 rounded-2xl bg-white border flex items-center gap-3" style={{ borderColor: 'var(--line)' }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm uppercase shadow-inner" style={{ background: 'var(--ink)', color: 'var(--gold)' }}>
                      {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsEditingProfile(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3 rounded-full font-semibold text-sm border flex items-center justify-center gap-2"
                  style={{ borderColor: 'var(--ink)', color: 'var(--ink)' }}
                >
                  <Edit3 size={16} /> Edit Profile & Image
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-3 rounded-full font-semibold text-sm bg-red-50 text-red-600 border border-red-200 flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                <Link
                  to="/signin"
                  className="w-full text-center py-3 rounded-full font-semibold text-sm border"
                  style={{ borderColor: 'var(--ink)', color: 'var(--ink)' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="w-full text-center py-3 rounded-full font-semibold text-sm shadow-md"
                  style={{ background: 'var(--ink)', color: 'var(--paper)' }}
                >
                  Sign Up Now
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative my-8">
            <button
              onClick={() => setIsEditingProfile(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-md" style={{ background: 'var(--ink)', color: 'var(--gold)' }}>
                <User size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-display)' }}>Edit Profile</h3>
                <p className="text-xs text-gray-500">Update your image and student details</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Profile Image Preview & Upload Option */}
              <div className="flex flex-col items-center justify-center pb-2">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {editAvatar ? (
                    <img src={editAvatar} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover border-4 border-[var(--gold)] shadow-md group-hover:opacity-80 transition-opacity" />
                  ) : (
                    <div className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-2xl uppercase border-4 border-[var(--gold)] shadow-md" style={{ background: 'var(--ink)', color: 'var(--gold)' }}>
                      {editName ? editName.charAt(0) : 'U'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                    <Camera size={22} />
                    <span className="text-[10px] font-semibold mt-1">Change</span>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 text-xs font-semibold px-4 py-1.5 rounded-full border border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                >
                  <Upload size={13} /> Upload Photo from Computer
                </button>

                {/* Preset Avatar Selection */}
                <div className="mt-4 w-full">
                  <p className="text-[11px] font-semibold text-gray-500 text-center mb-2 uppercase tracking-wider">Or Select Student Avatar</p>
                  <div className="flex items-center justify-center gap-2">
                    {PRESET_AVATARS.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Preset ${idx}`}
                        onClick={() => setEditAvatar(url)}
                        className={`w-9 h-9 rounded-full object-cover cursor-pointer border-2 transition-all hover:scale-110 ${
                          editAvatar === url ? 'border-[var(--gold)] ring-2 ring-[var(--gold)] scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Direct Image URL input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-gray-50 focus:bg-white transition-all text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Campus Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Department</label>
                <input
                  type="text"
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all text-gray-900"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Bio / Status</label>
                <textarea
                  rows="2"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-gray-50 focus:bg-white transition-all text-gray-900 resize-none"
                  placeholder="Tell your peers a bit about yourself"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save size={16} /> Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 lg:pt-28 pb-16 lg:pb-24 grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="text-center md:text-left flex flex-col items-center md:items-start">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-6 text-xs font-medium border"
            style={{ background: 'var(--ink)', color: 'var(--gold)', borderColor: 'rgba(203,154,46,0.3)', fontFamily: 'var(--font-mono)' }}
          >
            <Sparkles size={13} color="var(--gold)" />
            <span>CAMPUS DIGITAL PLATFORM 2.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl leading-[1.1] font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            One login. <br className="hidden sm:inline" />
            Every campus problem, <span style={{ color: 'var(--slate)' }}>sorted.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg max-w-lg leading-relaxed" style={{ color: '#4B5163' }}>
            Lost items, maintenance issues, upcoming events, and peer trading — Campus Connect brings your entire university experience under one intelligent dashboard.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {user ? (
              <a
                href="#modules"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                style={{ background: 'var(--slate)', color: 'var(--paper)' }}
              >
                Go to Campus Board
                <ArrowRight size={16} />
              </a>
            ) : (
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                style={{ background: 'var(--slate)', color: 'var(--paper)' }}
              >
                Get Your Campus Pass
                <ArrowRight size={16} />
              </Link>
            )}
            <a
              href="#modules"
              className="inline-flex items-center gap-2 text-sm font-semibold cc-underline py-2"
              style={{ color: 'var(--ink)' }}
            >
              Explore All Modules
              <ArrowUpRight size={15} />
            </a>
          </div>

          <div className="mt-10 flex items-center gap-4 text-xs font-medium" style={{ color: '#5A5F70' }}>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-600" /> Instant Email Verification</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-600" /> 100% Student Verified</span>
          </div>
        </div>

        {/* Signature Interactive Stacked Cards */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full flex items-center justify-center select-none overflow-visible">
          <p className="absolute -top-6 text-center text-xs font-mono tracking-wider uppercase opacity-60" style={{ color: 'var(--slate)' }}>
            Tap cards to inspect
          </p>
          <IdCard
            label="Lost & Found"
            icon={MapPin}
            rotate={fanned ? -12 : -4}
            offsetX={fanned ? (window.innerWidth < 640 ? -45 : -70) : -14}
            z={10}
            activeCard={activeCard}
            onClick={() => setActiveCard('Lost & Found')}
          />
          <IdCard
            label="Issue Tracker"
            icon={Wrench}
            rotate={0}
            offsetX={0}
            z={20}
            activeCard={activeCard}
            onClick={() => setActiveCard('Issue Tracker')}
          />
          <IdCard
            label="Event Hub"
            icon={CalendarDays}
            rotate={fanned ? 12 : 4}
            offsetX={fanned ? (window.innerWidth < 640 ? 45 : 70) : 14}
            z={10}
            activeCard={activeCard}
            onClick={() => setActiveCard('Event Hub')}
          />
        </div>
      </section>

      {/* STATS STRIP */}
      <section id="stats" className="border-t border-b" style={{ background: 'var(--ink)', borderColor: 'var(--ink)' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <Stat {...s} />
            </div>
          ))}
        </div>
      </section>

      {/* MODULES GRID */}
      <section id="modules" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-2xl mb-12 text-center sm:text-left">
          <span className="text-xs tracking-[0.2em] uppercase font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--slate)' }}>
            POWERFUL MODULES
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2" style={{ fontFamily: 'var(--font-display)' }}>
            Six Core Services. One Unified Board.
          </h2>
          <p className="mt-3 text-base leading-relaxed" style={{ color: '#4B5163' }}>
            No more buried messaging threads or unorganized group chats. Everything is indexed, tracked, and accessible in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {MODULES.map((m) => (
            <div
              key={m.name}
              onClick={() => setSelectedModule(selectedModule === m.name ? null : m.name)}
              className={`cc-card relative rounded-2xl border p-6 sm:p-7 cursor-pointer transition-all ${
                selectedModule === m.name ? 'ring-2 ring-[var(--gold)] border-transparent bg-white shadow-xl' : ''
              }`}
              style={{ borderColor: 'var(--line)', background: selectedModule === m.name ? '#FFFFFF' : 'var(--paper)' }}
            >
              <span className="cc-pin" style={{ background: 'var(--gold)' }} />
              
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner" style={{ background: 'var(--ink)' }}>
                  <m.icon size={22} color="var(--gold)" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md" style={{ fontFamily: 'var(--font-mono)', background: 'rgba(59,91,169,0.1)', color: 'var(--slate)' }}>
                  {m.tag}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-2 flex items-center justify-between" style={{ fontFamily: 'var(--font-display)' }}>
                {m.name}
                <ChevronRight size={18} className={`transition-transform ${selectedModule === m.name ? 'rotate-90 text-[var(--gold)]' : 'text-gray-400'}`} />
              </h3>

              <p className="text-sm leading-relaxed" style={{ color: '#5A5F70' }}>
                {m.copy}
              </p>

              <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs font-semibold" style={{ borderColor: 'var(--line)' }}>
                <span style={{ color: 'var(--slate)', fontFamily: 'var(--font-mono)' }}>{m.highlight}</span>
                <span className="text-xs font-bold underline" style={{ color: 'var(--ink)' }}>
                  {selectedModule === m.name ? 'Close' : 'Quick Details'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-16 sm:py-24 border-t" style={{ borderColor: 'var(--line)', background: '#F5F2E9' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center sm:text-left mb-12">
            <span className="text-xs tracking-[0.2em] uppercase font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--slate)' }}>
              SIMPLE WORKFLOW
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2" style={{ fontFamily: 'var(--font-display)' }}>
              Get Started in Three Minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-white/60 backdrop-blur-sm rounded-2xl p-7 border relative flex flex-col justify-between" style={{ borderColor: 'var(--line)' }}>
                <div>
                  <span className="text-5xl font-bold block mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', opacity: 0.7 }}>
                    {s.n}
                  </span>
                  <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#5A5F70' }}>
                    {s.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div
          className="max-w-7xl mx-auto rounded-3xl p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden"
          style={{ background: 'var(--ink)' }}
        >
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--gold)]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-4xl font-bold text-white max-w-lg leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Ready to Upgrade Your Campus Life?
            </h2>
            <p className="mt-3 text-sm sm:text-base max-w-md" style={{ color: 'var(--paper-dim)' }}>
              Join thousands of students managing campus issues, events, and trading with ease.
            </p>
          </div>
          
          {user ? (
            <a
              href="#modules"
              className="w-full md:w-auto text-center inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold shadow-lg hover:scale-105 transition-all"
              style={{ background: 'var(--gold)', color: 'var(--ink)' }}
            >
              Explore Campus Board
              <ArrowRight size={18} />
            </a>
          ) : (
            <Link
              to="/signup"
              className="w-full md:w-auto text-center inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold shadow-lg hover:scale-105 transition-all"
              style={{ background: 'var(--gold)', color: 'var(--ink)' }}
            >
              Create Free Account
              <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-10 px-4 sm:px-6 lg:px-8" style={{ borderColor: 'var(--line)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-center sm:text-left" style={{ color: '#8A8E9E' }}>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            © {new Date().getFullYear()} Campus Connect — Full-Stack Student Platform
          </span>
          <div className="flex gap-6 font-medium">
            <a href="#modules" className="cc-underline" style={{ color: '#8A8E9E' }}>Modules</a>
            <a href="#how-it-works" className="cc-underline" style={{ color: '#8A8E9E' }}>Workflow</a>
            {!user && <Link to="/signin" className="cc-underline" style={{ color: '#8A8E9E' }}>Sign In</Link>}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
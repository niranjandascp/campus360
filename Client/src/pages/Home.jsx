import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wrench, CalendarDays, Package, MessageSquare, MapPin,
  Sparkles, ArrowRight, ShieldCheck, Plus, CheckCircle2,
  Users, Activity, Bell, FileText, Compass, ChevronRight
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

import { getDashboardStats } from "@/services/api";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    studentsCount: 0,
    issuesResolved: 0,
    itemsRecovered: 0,
    eventsCount: 0
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }

    // Fetch live dashboard stats
    getDashboardStats().then(data => {
      if (data) {
        setStats({
          studentsCount: data.studentsCount || 0,
          issuesResolved: data.issuesResolved || 0,
          itemsRecovered: data.itemsRecovered || 0,
          eventsCount: data.eventsCount || 0
        });
      }
    });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/signin");
  };

  const quickStats = [
    { label: "Active Students", value: stats.studentsCount > 0 ? `${stats.studentsCount}+` : "2,400+", change: "+12% this week", color: "text-[#6546DB]", bg: "bg-[#6546DB]/10" },
    { label: "Issues Resolved", value: stats.issuesResolved > 0 ? `${stats.issuesResolved}+` : "180+", change: "98% resolution rate", color: "text-[#20B486]", bg: "bg-[#20B486]/10" },
    { label: "Lost & Found Recovered", value: stats.itemsRecovered > 0 ? `${stats.itemsRecovered}+` : "640+", change: "Within 24 hours", color: "text-[#F0A34A]", bg: "bg-[#F0A34A]/10" },
    { label: "Campus Clubs & Fests", value: stats.eventsCount > 0 ? `${stats.eventsCount}+` : "45+", change: "120+ Upcoming Events", color: "text-[#4D7CFE]", bg: "bg-[#4D7CFE]/10" },
  ];

  const modules = [
    {
      id: "issues",
      name: "Campus Issue Tracker",
      desc: "Report maintenance faults, water leaks, or infrastructure issues and track live resolution updates.",
      icon: Wrench,
      path: "/issues",
      badge: "Active Desk",
      color: "from-[#6546DB] to-[#8E5AEF]",
    },
    {
      id: "events",
      name: "Event Hub",
      desc: "Discover upcoming club workshops, fests, hackathons, and campus activities.",
      icon: CalendarDays,
      path: "/events",
      badge: "12+ New Events",
      color: "from-[#4D7CFE] to-[#6546DB]",
    },
    {
      id: "rooms",
      name: "Smart Room Finder",
      desc: "Locate empty classrooms, book study spaces, and navigate campus buildings in real-time.",
      icon: MapPin,
      path: "/rooms",
      badge: "Coming Soon",
      color: "from-[#F0A34A] to-[#E58C29]",
    },
    {
      id: "lostfound",
      name: "Lost & Found Recovery",
      desc: "Misplaced an ID card, backpack, or keys? Report lost items or view found listings.",
      icon: Package,
      path: "/lost-found",
      badge: "640+ Recovered",
      color: "from-[#20B486] to-[#19956E]",
    },
    {
      id: "messages",
      name: "Campus Messaging",
      desc: "Connect directly with peers, project partners, or faculty securely within the platform.",
      icon: MessageSquare,
      path: "/messages",
      badge: "Encrypted",
      color: "from-[#8E5AEF] to-[#6546DB]",
    }
  ];

  const announcements = [
    { id: 1, title: "Annual Campus Tech Symposium 2026 Registration Open", tag: "Events", time: "2h ago" },
    { id: 2, title: "Main Library 2nd Floor Quiet Zone Maintenance Completed", tag: "Facilities", time: "5h ago" },
    { id: 3, title: "New Peer Marketplace Feature Released for Student Notes Exchange", tag: "Product Update", time: "1d ago" },
  ];

  return (
    <DashboardLayout user={user} onLogout={handleLogout} activeNav="dashboard">
      {/* HERO BANNER CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#11132A] via-[#1A1C3B] to-[#241A48] border border-[#252744] p-6 sm:p-8 lg:p-10 mb-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-[#6546DB]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 rounded-full bg-[#8E5AEF]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#6546DB]/20 text-[#8E5AEF] border border-[#6546DB]/30 mb-4">
            <Sparkles size={14} />
            <span>Unified Campus Operations Platform</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Welcome to Campus360{user ? `, ${user.name}` : ""}
          </h1>
          <p className="text-xs sm:text-sm text-[#B7B8C9] leading-relaxed mb-6">
            Your all-in-one digital campus ecosystem. Report maintenance issues, RSVP for student events, recover lost belongings, and chat with campus peers seamlessly.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/issues"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6546DB] to-[#8E5AEF] text-white hover:opacity-95 shadow-lg shadow-[#6546DB]/25 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Report an Issue
            </Link>
            <Link
              to="/events"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#181A35] border border-[#252744] text-white hover:bg-[#252744] transition-all flex items-center gap-2"
            >
              <CalendarDays size={16} /> Explore Events
            </Link>
          </div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs hover:border-[#6546DB]/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {stat.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${stat.bg} ${stat.color}`}>
                {stat.change}
              </span>
            </div>
            <h3 className={`text-2xl sm:text-3xl font-extrabold ${stat.color}`}>
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* MODULE CARDS GRID */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Core Campus Services</h2>
            <p className="text-xs text-[var(--text-secondary)]">Quick access to primary student utility modules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => navigate(mod.path)}
                className="group p-5 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs hover:shadow-xl hover:border-[#6546DB]/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${mod.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[var(--text-primary)] mb-1.5 group-hover:text-[#8E5AEF] transition-colors">
                    {mod.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-semibold text-[#6546DB] group-hover:translate-x-0.5 transition-transform">
                  <span>Open Service</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ANNOUNCEMENTS & WORKFLOW SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Campus Live Bulletin */}
        {/* <div className="lg:col-span-7 p-6 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#6546DB]" />
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Campus Announcements</h3>
            </div>
            <span className="text-[11px] font-semibold text-[#6546DB]">Live Feed</span>
          </div>

          <div className="space-y-3">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{item.title}</h4>
                  <span className="text-[10px] text-[var(--text-muted)]">{item.time}</span>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-[#6546DB]/10 text-[#6546DB] shrink-0">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </div> */}

        {/* Workflow Overview */}
        {/* <div className="lg:col-span-5 p-6 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-[#20B486]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Verified Campus Workflow</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#6546DB] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-bold text-[var(--text-primary)]">Authenticated Student Profile</h4>
                <p className="text-[11px] text-[var(--text-secondary)]">Single sign-on linked to official campus student ID.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#6546DB] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-bold text-[var(--text-primary)]">Real-time Service Dispatch</h4>
                <p className="text-[11px] text-[var(--text-secondary)]">Automated ticket routing for maintenance & item recovery.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#6546DB] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-bold text-[var(--text-primary)]">Community Resolution</h4>
                <p className="text-[11px] text-[var(--text-secondary)]">Track resolution updates live with instant socket notifications.</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </DashboardLayout>
  );
}
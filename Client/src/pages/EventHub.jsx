import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Plus, Search, CheckCircle2, ArrowLeft, Users, MapPin } from "lucide-react";
import { Navbar } from "@/components/ui/mini-navbar";

export default function EventHub() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [searchTerm, setSearchTerm] = useState("");
  const [rsvps, setRsvps] = useState({});

  const isDark = theme === "dark";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const eventsList = [
    {
      id: "EV-101",
      title: "Annual Campus Hackathon 2026",
      category: "Tech Fest",
      date: "OCT 14 - 16",
      location: "Main Auditorium",
      host: "Computer Science Dept",
      count: 142
    },
    {
      id: "EV-102",
      title: "Inter-College Music & Dance Night",
      category: "Cultural",
      date: "OCT 22",
      location: "Open Air Amphitheatre",
      host: "Cultural Committee",
      count: 320
    },
    {
      id: "EV-103",
      title: "AI & Robotics Hands-on Masterclass",
      category: "Workshop",
      date: "NOV 04",
      location: "Seminar Hall B",
      host: "IEEE Student Branch",
      count: 85
    },
    {
      id: "EV-104",
      title: "Inter-Department Football Championship",
      category: "Sports",
      date: "NOV 12",
      location: "University Sports Ground",
      host: "Sports Council",
      count: 210
    }
  ];

  const toggleRsvp = (eventId) => {
    setRsvps((prev) => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const filteredEvents = eventsList.filter((event) => {
    return event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-[#FBFAF6] text-slate-900"
      }`}
    >
      {/* Floating Navbar */}
      <Navbar
        activeTab="event-hub"
        user={user}
        onLogout={handleLogout}
        onEditProfile={() => {}}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Back navigation & Page Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-purple-500 hover:text-purple-600 mb-4 transition-colors">
            <ArrowLeft size={14} /> Back to Campus Overview
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono tracking-widest uppercase font-bold text-purple-500">
                CAMPUS EVENTS & FESTS
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold mt-1 tracking-tight" style={{ fontFamily: "serif" }}>
                Event Hub Portal
              </h1>
              <p className={`mt-2 text-sm sm:text-base max-w-2xl ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                Never miss university hackathons, cultural festivals, club activities, or sports tournaments.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`p-4 rounded-2xl border mb-8 flex items-center justify-between shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-amber-100"
        }`}>
          <div className="relative w-full max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events, workshops, fests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-full text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-400" : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isRsvped = !!rsvps[event.id];
            return (
              <div
                key={event.id}
                className={`p-6 rounded-2xl border transition-all hover:shadow-xl flex flex-col justify-between ${
                  isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-amber-100 hover:border-amber-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 font-semibold border border-purple-500/20">
                      {event.category}
                    </span>
                    <span className="text-xs font-mono text-purple-600 font-bold">{event.date}</span>
                  </div>

                  <h3 className="font-bold text-xl mb-2 leading-snug">{event.title}</h3>
                  <p className={`text-xs mb-1 flex items-center gap-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    <MapPin size={13} className="text-purple-500" /> {event.location}
                  </p>
                  <p className={`text-xs mb-4 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    Host: <span className="font-semibold text-purple-400">{event.host}</span>
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3 font-mono">
                    <span className="flex items-center gap-1"><Users size={13} /> {event.count + (isRsvped ? 1 : 0)} Registered</span>
                  </div>

                  <button
                    onClick={() => toggleRsvp(event.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                      isRsvped
                        ? "bg-emerald-600 text-white"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {isRsvped ? (
                      <>
                        <CheckCircle2 size={15} /> RSVP Confirmed
                      </>
                    ) : (
                      "RSVP Now"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

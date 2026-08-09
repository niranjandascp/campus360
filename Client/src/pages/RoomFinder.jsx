import React, { useState, useEffect } from "react";
import { MapPin, Search, Clock, ShieldCheck, Zap, Construction } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useNavigate } from "react-router-dom";

export default function RoomFinder() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !stored) {
      navigate("/signin");
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch (e) {
      navigate("/signin");
    }
  }, [navigate]);

  return (
    <DashboardLayout user={user} onLogout={() => { localStorage.clear(); navigate("/signin"); }} activeNav="rooms">
      <div className="flex flex-col h-full items-center justify-center text-center p-6 min-h-[75vh]">
        
        {/* Animated Icon Container */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#6546DB]/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#181A35] to-[#11132A] border border-[#252744] shadow-2xl flex items-center justify-center">
            <Construction size={40} className="text-[#8E5AEF]" />
          </div>
          
          {/* Decorative badges */}
          <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-gradient-to-br from-[#F0A34A] to-[#E58C29] flex items-center justify-center shadow-lg transform rotate-12">
            <MapPin size={20} color="#fff" />
          </div>
          <div className="absolute -bottom-2 -left-3 w-8 h-8 rounded-xl bg-gradient-to-br from-[#20B486] to-[#19956E] flex items-center justify-center shadow-lg transform -rotate-12">
            <Clock size={16} color="#fff" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mb-3">
          Smart Room Finder
        </h1>
        <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8 text-sm leading-relaxed">
          The ultimate campus navigation and classroom booking system is currently under development. Soon you'll be able to locate empty classrooms, book study spaces, and navigate campus buildings in real-time.
        </p>

        {/* Feature Preview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full text-left">
          <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-color)]">
            <div className="w-8 h-8 rounded-lg bg-[#6546DB]/10 flex items-center justify-center mb-3">
              <Search size={16} className="text-[#6546DB]" />
            </div>
            <h3 className="font-bold text-[var(--text-primary)] text-sm mb-1">Live Availability</h3>
            <p className="text-xs text-[var(--text-muted)]">Check which classrooms and labs are currently empty for self-study.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--border-color)]">
            <div className="w-8 h-8 rounded-lg bg-[#20B486]/10 flex items-center justify-center mb-3">
              <ShieldCheck size={16} className="text-[#20B486]" />
            </div>
            <h3 className="font-bold text-[var(--text-primary)] text-sm mb-1">Instant Booking</h3>
            <p className="text-xs text-[var(--text-muted)]">Reserve meeting rooms or seminar halls for your club directly from your phone.</p>
          </div>
        </div>

        <div className="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6546DB]/10 border border-[#6546DB]/30 text-[#8E5AEF] text-xs font-bold uppercase tracking-widest">
          <Zap size={14} />
          Coming Soon in v2.0
        </div>
      </div>
    </DashboardLayout>
  );
}

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Plus, Search, CheckCircle2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Navbar } from "@/components/ui/mini-navbar";

export default function LostFound() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Item Form State
  const [newTitle, setNewTitle] = useState("");
  const [newLoc, setNewLoc] = useState("");
  const [newImage, setNewImage] = useState("");

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

  const initialItems = [
    {
      id: "LF-901",
      title: "Black North Face Backpack",
      location: "Central Library 2nd Floor",
      time: "2 days ago",
      status: "claimed",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80"
    },
    {
      id: "LF-902",
      title: "Brass Key Ring & Lanyard",
      location: "Student Canteen Bench",
      time: "Yesterday",
      status: "unclaimed",
      image: "https://images.unsplash.com/photo-1582142839970-2b9322b7a976?w=500&q=80"
    },
    {
      id: "LF-903",
      title: "Wireless Earbuds Charging Case",
      location: "Auditorium Main Hall",
      time: "5 hours ago",
      status: "unclaimed",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80"
    }
  ];

  const [itemsList, setItemsList] = useState(initialItems);

  const handleCreateItem = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newItem = {
      id: `LF-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle,
      location: newLoc || "Campus Premises",
      time: "Just now",
      status: "unclaimed",
      image: newImage || "https://images.unsplash.com/photo-1582142839970-2b9322b7a976?w=500&q=80"
    };
    setItemsList([newItem, ...itemsList]);
    setNewTitle("");
    setNewLoc("");
    setNewImage("");
    setIsModalOpen(false);
  };

  const filteredItems = itemsList.filter((item) => {
    const matchesFilter = filter === "all" || item.status === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-[#FBFAF6] text-slate-900"
      }`}
    >
      {/* Floating Navbar */}
      <Navbar
        activeTab="lost-found"
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
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-emerald-500 hover:text-emerald-600 mb-4 transition-colors">
            <ArrowLeft size={14} /> Back to Campus Overview
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono tracking-widest uppercase font-bold text-emerald-500">
                CAMPUS RECOVERY BOARD
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold mt-1 tracking-tight" style={{ fontFamily: "serif" }}>
                Lost & Found Portal
              </h1>
              <p className={`mt-2 text-sm sm:text-base max-w-2xl ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                Misplaced your student ID, backpack, or keys? Search reported items or submit a claim instantly.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold shadow-lg bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <Plus size={18} /> Report Found Item
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className={`p-4 rounded-2xl border mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-amber-100"
        }`}>
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search lost items or spot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-full text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-400" : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["all", "unclaimed", "claimed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === tab
                    ? "bg-emerald-600 text-white shadow-sm"
                    : isDark ? "text-slate-400 hover:bg-slate-800" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab === "all" ? "All Items" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-2xl border transition-all hover:shadow-xl flex flex-col justify-between overflow-hidden ${
                isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-amber-100 hover:border-amber-200"
              }`}
            >
              <div>
                <div className="w-full h-44 rounded-xl bg-gray-100 dark:bg-gray-800 mb-4 overflow-hidden relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  <span className={`absolute top-3 right-3 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${
                    item.status === "claimed" ? "bg-black/70 text-white" : "bg-amber-500 text-slate-950"
                  }`}>
                    {item.status === "claimed" ? "Claimed" : "Unclaimed"}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-1 leading-snug">{item.title}</h3>
                <p className={`text-xs mb-4 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                  Spot: <span className="font-semibold text-emerald-500">{item.location}</span>
                </p>
              </div>

              {item.status === "claimed" ? (
                <span className="text-xs font-mono font-medium text-emerald-600 flex items-center gap-1 pt-2">
                  <CheckCircle2 size={13} /> Returned to Student
                </span>
              ) : (
                <button className="w-full py-2.5 rounded-xl text-xs font-semibold border border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors">
                  Claim This Item
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* CREATE LOST ITEM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-amber-200 text-slate-900"
          }`}>
            <h2 className="text-2xl font-bold mb-1">Post Found Item</h2>
            <p className="text-xs text-gray-500 mb-6">List an item you found so its owner can reclaim it.</p>

            <form onSubmit={handleCreateItem} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue Hydroflask Water Bottle"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Found Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Block 1st Floor Hallway"
                  value={newLoc}
                  onChange={(e) => setNewLoc(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold border hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                >
                  Post Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

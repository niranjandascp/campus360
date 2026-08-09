import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Plus,
  Search,
  CheckCircle2,
  ArrowLeft,
  Users,
  MapPin,
  Clock,
  Trash2,
  Edit3,
  X,
  Upload,
  Loader2,
  Sparkles,
  Filter,
  User,
  MessageSquare,
  ExternalLink
} from "lucide-react";
import { Navbar } from "@/components/ui/mini-navbar";
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventRsvp
} from "@/services/api";

const CATEGORIES = ["All", "Tech Fest", "Cultural", "Workshop", "Sports", "Academic", "Seminar", "Other"];

export default function EventHub() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingAttendeesEvent, setViewingAttendeesEvent] = useState(null);
  const [attendeeSearchTerm, setAttendeeSearchTerm] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tech Fest");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00 AM");
  const [location, setLocation] = useState("");
  const [host, setHost] = useState("");
  const [imageFile, setImageFile] = useState(null);

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
    fetchEventsData();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const fetchEventsData = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      const list = Array.isArray(data) ? data : data?.events || [];

      if (list.length === 0) {
        // Fallback default sample events if db is empty
        const defaultSamples = [
          {
            _id: "demo-1",
            title: "Annual Campus Hackathon 2026",
            category: "Tech Fest",
            date: "OCT 14 - 16, 2026",
            time: "09:00 AM",
            location: "Main Tech Auditorium",
            host: "Computer Science Dept",
            description: "48-hour continuous coding hackathon with $5,000 in cash prizes and recruiter meetups.",
            organizer: {
              _id: "admin-1",
              name: "System Administrator",
              email: "admin@campus360.edu",
              userId: "CMP-888888",
              department: "Administration"
            },
            rsvps: [
              {
                _id: "user-101",
                name: "Aarav Sharma",
                email: "aarav@campus360.edu",
                userId: "CMP-104921",
                department: "Computer Science",
                year: "3rd Year"
              },
              {
                _id: "user-102",
                name: "Ananya Roy",
                email: "ananya@campus360.edu",
                userId: "CMP-592014",
                department: "Electronics & Comm",
                year: "2nd Year"
              }
            ]
          },
          {
            _id: "demo-2",
            title: "Inter-College Music & Cultural Night",
            category: "Cultural",
            date: "OCT 22, 2026",
            time: "06:00 PM",
            location: "Open Air Amphitheatre",
            host: "Campus Cultural Club",
            description: "Live band performances, dance competitions, and food stalls from across the country.",
            organizer: {
              _id: "user-[#103]",
              name: "Priya Nair",
              email: "priya@campus360.edu",
              userId: "CMP-774029",
              department: "Arts & Humanities"
            },
            rsvps: [
              {
                _id: "user-104",
                name: "Vikram Malhotra",
                email: "vikram@campus360.edu",
                userId: "CMP-302910",
                department: "Mechanical Engg",
                year: "4th Year"
              }
            ]
          },
          {
            _id: "demo-3",
            title: "AI & Neural Networks Hands-on Workshop",
            category: "Workshop",
            date: "NOV 04, 2026",
            time: "11:00 AM",
            location: "Seminar Hall B",
            host: "IEEE Student Chapter",
            description: "Learn how to build and fine-tune Deep Learning models with PyTorch & Python.",
            organizer: {
              _id: "user-[#105]",
              name: "Rahul Verma",
              email: "rahul@campus360.edu",
              userId: "CMP-918234",
              department: "Information Tech"
            },
            rsvps: []
          }
        ];
        setEventsList(defaultSamples);
      } else {
        setEventsList(list);
      }
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to post new campus events.");
      navigate("/signin");
      return;
    }
    setEditingEvent(null);
    setTitle("");
    setDescription("");
    setCategory("Tech Fest");
    setDate("");
    setTime("10:00 AM");
    setLocation("");
    setHost(user?.department ? `${user.department} Dept` : "Campus Council");
    setImageFile(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || "");
    setCategory(event.category || "Tech Fest");
    setDate(event.date || "");
    setTime(event.time || "10:00 AM");
    setLocation(event.location || "");
    setHost(event.host || "");
    setImageFile(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("date", date);
      formData.append("time", time);
      formData.append("location", location);
      formData.append("host", host);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingEvent && !editingEvent._id.startsWith("demo")) {
        const res = await updateEvent(editingEvent._id, formData);
        if (res.event) {
          setEventsList((prev) => prev.map((ev) => (ev._id === editingEvent._id ? res.event : ev)));
          showToast("Event updated successfully!");
        }
      } else {
        const res = await createEvent(formData);
        if (res.event) {
          setEventsList((prev) => [res.event, ...prev]);
          showToast("New Event published!");
        } else {
          // Fallback optimistic update
          const newEv = {
            _id: `temp-${Date.now()}`,
            title,
            description,
            category,
            date,
            time,
            location,
            host,
            rsvps: []
          };
          setEventsList((prev) => [newEv, ...prev]);
          showToast("Event posted!");
        }
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Error submitting event:", err);
      setErrorMsg("Failed to save event. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    setEventsList((prev) => prev.filter((ev) => ev._id !== eventId));
    showToast("Event deleted");

    if (String(eventId).startsWith("demo") || String(eventId).startsWith("temp")) return;

    try {
      await deleteEvent(eventId);
    } catch (err) {
      console.warn("Delete event API warning:", err);
    }
  };

  const handleRsvpToggle = async (event) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to RSVP for events.");
      navigate("/signin");
      return;
    }

    const currentUserId = user?._id || user?.id || "temp-user";
    const currentRsvps = event.rsvps || [];
    const isRsvped = currentRsvps.some((r) => String(r._id || r) === String(currentUserId));

    // Optimistic UI update
    setEventsList((prev) =>
      prev.map((ev) => {
        if (ev._id === event._id) {
          const newRsvps = isRsvped
            ? ev.rsvps.filter((r) => String(r._id || r) !== String(currentUserId))
            : [...(ev.rsvps || []), currentUserId];
          return { ...ev, rsvps: newRsvps };
        }
        return ev;
      })
    );

    showToast(isRsvped ? "RSVP Cancelled" : "RSVP Confirmed!");

    if (String(event._id).startsWith("demo") || String(event._id).startsWith("temp")) return;

    try {
      await toggleEventRsvp(event._id);
    } catch (err) {
      console.warn("RSVP API warning:", err);
    }
  };

  const filteredEvents = eventsList.filter((event) => {
    const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.host || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className="min-h-screen w-full transition-colors duration-300 pb-16"
      style={{
        backgroundColor: isDark ? "#12192B" : "#FBFAF6",
        color: isDark ? "#FBFAF6" : "#12192B",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <Navbar
        activeTab="event-hub"
        user={user}
        onLogout={() => {
          localStorage.clear();
          setUser(null);
          navigate("/signin");
        }}
        onEditProfile={() => {}}
        theme={theme}
        onToggleTheme={() => {
          const next = theme === "light" ? "dark" : "light";
          setTheme(next);
          localStorage.setItem("theme", next);
        }}
      />

      {/* Notification Toast */}
      {toastMsg && (
        <div className="fixed top-24 right-6 z-50 px-4 py-3 rounded-2xl bg-[#CB9A2E] text-white shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={16} /> {toastMsg}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold opacity-70 hover:opacity-100 hover:-translate-x-1 transition-all mb-2"
            >
              <ArrowLeft size={16} /> Back to Overview
            </Link>
            <div className="flex items-center gap-3">
              <h1
                className="text-3xl sm:text-5xl font-black tracking-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Campus Event Hub
              </h1>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/10 text-purple-500 border border-purple-500/20 shadow-sm">
                Fests & Workshops
              </span>
            </div>
            <p className="text-xs sm:text-sm opacity-75 mt-1 max-w-xl">
              Discover university hackathons, cultural festivals, tech workshops, sports tournaments & department events.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider text-white shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0"
            style={{ backgroundColor: "#CB9A2E" }}
          >
            <Plus size={18} /> Post New Event
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div
          className="p-4 sm:p-5 rounded-3xl border shadow-xl flex flex-col md:flex-row items-center justify-between gap-4"
          style={{
            borderColor: "#E4E0D3",
            backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
          }}
        >
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? "bg-[#CB9A2E] text-white border-[#CB9A2E] shadow-md"
                    : "opacity-70 border-[#E4E0D3] hover:opacity-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              placeholder="Search by title, location or host..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full text-xs border focus:outline-none"
              style={{
                borderColor: "#E4E0D3",
                backgroundColor: isDark ? "#182238" : "#FBFAF6",
                color: isDark ? "#FBFAF6" : "#12192B"
              }}
            />
          </div>
        </div>

        {/* Events Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-purple-500" size={36} />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div
            className="text-center py-20 rounded-3xl border opacity-60 text-xs space-y-2"
            style={{ borderColor: "#E4E0D3" }}
          >
            <CalendarDays size={40} className="mx-auto opacity-40 mb-2" />
            <p className="font-bold text-sm">No events found matching your filter.</p>
            <p>Click <strong>"Post New Event"</strong> to organize the first campus fest!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredEvents.map((event) => {
              const currentUserId = user?._id || user?.id || "temp-user";
              const isRsvped = (event.rsvps || []).some(
                (r) => String(r._id || r) === String(currentUserId)
              );
              const isOwnerOrAdmin =
                user &&
                (user.role === "admin" ||
                  String(event.organizer?._id || event.organizer) === String(user._id || user.id));

              return (
                <div
                  key={event._id}
                  className="p-4 rounded-2xl border shadow-lg flex flex-col justify-between space-y-3.5 transition-all hover:shadow-xl hover:-translate-y-0.5"
                  style={{
                    borderColor: "#E4E0D3",
                    backgroundColor: isDark ? "#0f1624" : "#FFFFFF"
                  }}
                >
                  <div className="space-y-3">
                    {/* Header Image if available */}
                    {event.imageUrl && (
                      <div className="w-full h-32 rounded-xl overflow-hidden border" style={{ borderColor: "#E4E0D3" }}>
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Category & Date Row */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border shadow-xs"
                        style={{
                          borderColor: "#E4E0D3",
                          backgroundColor: "#3B5BA9",
                          color: "#FFFFFF"
                        }}
                      >
                        {event.category}
                      </span>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 shrink-0">
                        <Clock size={13} /> {event.date}
                      </div>
                    </div>

                    {/* Title & Short Description */}
                    <div>
                      <h3 className="font-bold text-base sm:text-base leading-snug truncate-2-lines">{event.title}</h3>
                      <p className="text-[11px] opacity-75 mt-1 leading-relaxed line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    {/* Location & Host info */}
                    <div className="space-y-1 text-[11px] opacity-80 pt-2 border-t" style={{ borderColor: "#E4E0D3" }}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <MapPin size={13} className="text-amber-500 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Users size={13} className="text-blue-500 shrink-0" />
                        <span className="truncate">Hosted by: <strong>{event.host}</strong></span>
                      </div>
                    </div>

                    {/* Creator / Organizer Box (Profile Pic & Name Only) */}
                    <div className="p-2 rounded-xl bg-amber-500/5 border flex items-center gap-2 min-w-0" style={{ borderColor: "#E4E0D3" }}>
                      {event.organizer?.avatar ? (
                        <img src={event.organizer.avatar} alt="Creator" className="w-6 h-6 rounded-full object-cover shrink-0 border" style={{ borderColor: "#E4E0D3" }} />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] uppercase shrink-0 shadow-xs">
                          {event.organizer?.name ? event.organizer.name.charAt(0) : "U"}
                        </div>
                      )}
                      <p className="text-[11px] font-bold truncate">
                        {event.organizer?.name || event.host || "Campus Organizer"}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Footer Actions */}
                  <div className="pt-2.5 border-t space-y-2" style={{ borderColor: "#E4E0D3" }}>
                    {/* View Attendees Trigger */}
                    <div className="flex items-center justify-between gap-1">
                      <button
                        onClick={() => setViewingAttendeesEvent(event)}
                        className="py-1 px-2.5 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 hover:bg-amber-500/10 transition-colors"
                        style={{ borderColor: "#E4E0D3" }}
                      >
                        <Users size={12} className="text-amber-500" />
                        <span>Attendees ({event.rsvps?.length || 0})</span>
                        <span className="text-amber-500 font-bold">&rarr;</span>
                      </button>

                      {isOwnerOrAdmin && (
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={() => handleOpenEditModal(event)}
                            className="p-1 rounded bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-500 transition-colors"
                            title="Edit Event"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event._id)}
                            className="p-1 rounded bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleRsvpToggle(event)}
                      className={`w-full py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                        isRsvped
                          ? "bg-emerald-600 text-white"
                          : "bg-purple-600 text-white hover:bg-purple-700 active:scale-95"
                      }`}
                    >
                      {isRsvped ? (
                        <>
                          <CheckCircle2 size={14} /> RSVP Confirmed
                        </>
                      ) : (
                        "RSVP / Register"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CREATE / EDIT EVENT MODAL DIALOG */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="max-w-lg w-full rounded-3xl border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              style={{
                borderColor: "#E4E0D3",
                backgroundColor: isDark ? "#0f1624" : "#FFFFFF",
                color: isDark ? "#FBFAF6" : "#12192B"
              }}
            >
              {/* Modal Header */}
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "#E4E0D3" }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={20} />
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                    {editingEvent ? "Edit Campus Event" : "Post New Event"}
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-amber-500/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmitEvent} className="p-6 overflow-y-auto space-y-4 flex-1">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Campus Hackathon 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl text-xs border focus:outline-none"
                    style={{
                      borderColor: "#E4E0D3",
                      backgroundColor: isDark ? "#182238" : "#FBFAF6",
                      color: isDark ? "#FBFAF6" : "#12192B"
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-2xl text-xs border focus:outline-none"
                      style={{
                        borderColor: "#E4E0D3",
                        backgroundColor: isDark ? "#182238" : "#FBFAF6",
                        color: isDark ? "#FBFAF6" : "#12192B"
                      }}
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                      Host / Organizer *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Computer Science Dept"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl text-xs border focus:outline-none"
                      style={{
                        borderColor: "#E4E0D3",
                        backgroundColor: isDark ? "#182238" : "#FBFAF6",
                        color: isDark ? "#FBFAF6" : "#12192B"
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                      Date *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OCT 24, 2026"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl text-xs border focus:outline-none"
                      style={{
                        borderColor: "#E4E0D3",
                        backgroundColor: isDark ? "#182238" : "#FBFAF6",
                        color: isDark ? "#FBFAF6" : "#12192B"
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                      Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10:00 AM - 04:00 PM"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl text-xs border focus:outline-none"
                      style={{
                        borderColor: "#E4E0D3",
                        backgroundColor: isDark ? "#182238" : "#FBFAF6",
                        color: isDark ? "#FBFAF6" : "#12192B"
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                    Location / Venue *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Auditorium / Seminar Hall B"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl text-xs border focus:outline-none"
                    style={{
                      borderColor: "#E4E0D3",
                      backgroundColor: isDark ? "#182238" : "#FBFAF6",
                      color: isDark ? "#FBFAF6" : "#12192B"
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                    Event Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide details about registration process, schedule, speakers, and prerequisites..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl text-xs border focus:outline-none"
                    style={{
                      borderColor: "#E4E0D3",
                      backgroundColor: isDark ? "#182238" : "#FBFAF6",
                      color: isDark ? "#FBFAF6" : "#12192B"
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                    Event Poster Image (Optional)
                  </label>
                  <div className="relative border border-dashed rounded-2xl p-4 text-center cursor-pointer hover:bg-amber-500/5 transition-colors" style={{ borderColor: "#E4E0D3" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-center gap-2 text-xs opacity-75">
                      <Upload size={16} className="text-amber-500" />
                      <span>{imageFile ? imageFile.name : "Click to select event image / poster"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider text-white shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#CB9A2E" }}
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> {editingEvent ? "Update Event" : "Publish Event"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW REGISTERED ATTENDEES MODAL DIALOG */}
        {viewingAttendeesEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="max-w-md w-full rounded-3xl border shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
              style={{
                borderColor: "#E4E0D3",
                backgroundColor: isDark ? "#0f1624" : "#FFFFFF",
                color: isDark ? "#FBFAF6" : "#12192B"
              }}
            >
              {/* Modal Header */}
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: "#E4E0D3" }}>
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="text-amber-500" size={20} />
                    <h2 className="text-lg font-bold truncate max-w-[220px]" style={{ fontFamily: "'Fraunces', serif" }}>
                      Registered Attendees
                    </h2>
                  </div>
                  <p className="text-[11px] opacity-70 mt-0.5 truncate max-w-[250px]">
                    {viewingAttendeesEvent.title}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setViewingAttendeesEvent(null);
                    setAttendeeSearchTerm("");
                  }}
                  className="p-2 rounded-full hover:bg-amber-500/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Attendees */}
              <div className="p-4 border-b" style={{ borderColor: "#E4E0D3" }}>
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
                  <input
                    type="text"
                    placeholder="Search registered students..."
                    value={attendeeSearchTerm}
                    onChange={(e) => setAttendeeSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-full text-xs border focus:outline-none"
                    style={{
                      borderColor: "#E4E0D3",
                      backgroundColor: isDark ? "#182238" : "#FBFAF6",
                      color: isDark ? "#FBFAF6" : "#12192B"
                    }}
                  />
                </div>
              </div>

              {/* Attendees List */}
              <div className="p-4 overflow-y-auto space-y-2 flex-1">
                {(!viewingAttendeesEvent.rsvps || viewingAttendeesEvent.rsvps.length === 0) ? (
                  <div className="text-center py-10 opacity-60 text-xs">
                    <Users size={32} className="mx-auto mb-2 opacity-40 text-amber-500" />
                    No registered attendees yet for this event.
                  </div>
                ) : (
                  viewingAttendeesEvent.rsvps
                    .filter((attendee) => {
                      const name = attendee.name || "";
                      const email = attendee.email || "";
                      const uid = attendee.userId || "";
                      return (
                        name.toLowerCase().includes(attendeeSearchTerm.toLowerCase()) ||
                        email.toLowerCase().includes(attendeeSearchTerm.toLowerCase()) ||
                        uid.toLowerCase().includes(attendeeSearchTerm.toLowerCase())
                      );
                    })
                    .map((attendee) => (
                      <div
                        key={attendee._id || attendee.userId || attendee.email}
                        className="p-3 rounded-2xl border flex items-center justify-between gap-3 hover:border-amber-500/30 transition-all"
                        style={{ borderColor: "#E4E0D3", backgroundColor: isDark ? "#182238" : "#FBFAF6" }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-sm">
                            {attendee.name ? attendee.name.charAt(0) : "S"}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold truncate">{attendee.name || "Student"}</h4>
                              {attendee.userId && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold shrink-0">
                                  {attendee.userId}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] opacity-70 truncate">{attendee.email}</p>
                            {(attendee.department || attendee.year) && (
                              <p className="text-[9px] opacity-60 font-mono">
                                {attendee.department} • {attendee.year}
                              </p>
                            )}
                          </div>
                        </div>

                        <Link
                          to={`/profile/${attendee.userId || attendee._id}`}
                          onClick={() => setViewingAttendeesEvent(null)}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-bold border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors shrink-0 flex items-center gap-1"
                        >
                          <User size={11} /> Profile
                        </Link>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

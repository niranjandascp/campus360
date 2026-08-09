import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays, Plus, Search, CheckCircle2, ArrowLeft, Users,
  MapPin, Clock, Trash2, Edit3, X, Upload, Loader2, Sparkles, User
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getEvents, createEvent, updateEvent, deleteEvent, toggleEventRsvp, API_URL
} from "@/services/api";

const SERVER_BASE = API_URL.replace("/api", "");

const CATEGORIES = ["All", "Tech Fest", "Cultural", "Workshop", "Sports", "Academic", "Seminar"];

export default function EventHub() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingAttendeesEvent, setViewingAttendeesEvent] = useState(null);
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
  const [imagePreview, setImagePreview] = useState(null);

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
            rsvps: ["user1", "user2", "user3"]
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
            rsvps: ["user1"]
          },
          {
            _id: "demo-3",
            title: "AI & Neural Networks Workshop",
            category: "Workshop",
            date: "NOV 04, 2026",
            time: "11:00 AM",
            location: "Seminar Hall B",
            host: "IEEE Student Chapter",
            description: "Learn how to build and fine-tune Deep Learning models with PyTorch & Python.",
            rsvps: ["user1", "user2"]
          }
        ];
        setEventsList(defaultSamples);
      } else {
        setEventsList(list);
      }
    } catch (err) {
      setEventsList([]);
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
    setImagePreview(null);
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
    let existingPreview = null;
    if (event.imageUrl) {
      existingPreview = event.imageUrl.startsWith("http")
        ? event.imageUrl
        : `${SERVER_BASE}${event.imageUrl}`;
    }
    setImagePreview(existingPreview);
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
          const newEv = {
            _id: `temp-${Date.now()}`,
            title, description, category, date, time, location, host, rsvps: [], imageUrl: imagePreview
          };
          setEventsList((prev) => [newEv, ...prev]);
          showToast("Event posted!");
        }
      }

      setIsModalOpen(false);
    } catch (err) {
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
    } catch (err) {}
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
    } catch (err) {}
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
    <DashboardLayout user={user} onLogout={() => { localStorage.clear(); navigate("/signin"); }} activeNav="events">
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#20B486] text-white shadow-lg text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={16} /> {toastMsg}
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#20B486] uppercase tracking-wider">
            <CalendarDays className="w-4 h-4 text-[#20B486]" />
            <span>Campus Activities & Gatherings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
            Campus Events Hub
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 max-w-2xl">
            Discover hackathons, cultural festivals, tech workshops, sports tournaments & department events.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md bg-gradient-to-r from-[#6546DB] to-[#8E5AEF] text-white hover:opacity-95 transition-all shrink-0"
        >
          <Plus size={16} /> Post New Event
        </button>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="p-4 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[#20B486] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by title, location or host..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#6546DB]/50"
          />
        </div>
      </div>

      {/* EVENTS GRID */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#20B486]" size={36} />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] text-[var(--text-muted)] text-xs space-y-2">
          <CalendarDays size={36} className="mx-auto text-[var(--text-muted)] mb-1" />
          <p className="font-bold text-sm text-[var(--text-primary)]">No events found matching your filter.</p>
          <p>Click <strong>"Post New Event"</strong> to organize the first campus fest!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => {
            const currentUserId = user?._id || user?.id || "temp-user";
            const isRsvped = (event.rsvps || []).some(
              (r) => String(r._id || r) === String(currentUserId)
            );
            
            const imgSrc = event.imageUrl
              ? event.imageUrl.startsWith("http")
                ? event.imageUrl
                : `${SERVER_BASE}${event.imageUrl}`
              : null;

            return (
              <div
                key={event._id}
                className="p-5 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs hover:shadow-xl hover:border-[#20B486]/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {imgSrc && (
                    <div className="w-full h-40 rounded-2xl bg-[var(--bg-primary)] mb-3 overflow-hidden relative border border-[var(--border-color)]">
                      <img src={imgSrc} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#20B486]/10 text-[#20B486] border border-[#20B486]/20">
                      {event.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#F0A34A]">
                      <Clock size={13} /> {event.date}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[var(--text-primary)] mb-1.5 leading-snug truncate">{event.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-[var(--text-secondary)] pt-3 border-t border-[var(--border-color)] mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#4D7CFE]" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-[#6546DB]" />
                      <span className="truncate">Hosted by <strong>{event.host}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--text-muted)] font-medium">
                    {event.rsvps?.length || 0} Attending
                  </span>

                  <button
                    onClick={() => handleRsvpToggle(event)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                      isRsvped
                        ? "bg-[#20B486] text-white"
                        : "bg-gradient-to-r from-[#6546DB] to-[#8E5AEF] text-white hover:opacity-95"
                    }`}
                  >
                    {isRsvped ? (
                      <>
                        <CheckCircle2 size={14} /> Attending
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
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-1">
              {editingEvent ? "Edit Event" : "Post Campus Event"}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Publish upcoming workshops, hackathons, or fests for all students.
            </p>

            <form onSubmit={handleSubmitEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Hackathon 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#6546DB]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Host / Dept *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS Dept"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Date *</label>
                  <input
                    type="text"
                    required
                    placeholder="OCT 24, 2026"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Location / Venue *</label>
                <input
                  type="text"
                  required
                  placeholder="Main Tech Auditorium"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Event details, schedule, prizes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Event Cover Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    } else {
                      setImageFile(null);
                      setImagePreview(null);
                    }
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-[#6546DB]/20 file:text-[#6546DB] hover:file:bg-[#6546DB]/30"
                />
                {imagePreview && (
                  <div className="mt-3 relative w-full h-32 rounded-xl overflow-hidden border border-[var(--border-color)]">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 p-1 rounded-md bg-black/50 text-white hover:bg-black/70"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#6546DB] to-[#8E5AEF] text-white hover:opacity-95 shadow-md flex items-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingEvent ? "Update Event" : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

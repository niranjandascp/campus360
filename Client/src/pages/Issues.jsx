import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wrench, Plus, Search, CheckCircle2, Clock, AlertTriangle, ArrowLeft, ThumbsUp, MapPin, Loader2, Edit3, Trash2, X, Upload, Image as ImageIcon } from "lucide-react";
import { Navbar } from "@/components/ui/mini-navbar";
import { getIssues, createIssue, updateIssue, deleteIssue, upvoteIssue, API_URL } from "@/services/api";

const SERVER_BASE = API_URL.replace("/api", "");

export default function Issues() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null); // null if creating, issue object if editing
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("maintenance");
  const [formBuilding, setFormBuilding] = useState("Main Block");
  const [formRoom, setFormRoom] = useState("");
  const [formPriority, setFormPriority] = useState("medium");
  const [formStatus, setFormStatus] = useState("reported");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [issuesList, setIssuesList] = useState([]);
  const navigate = useNavigate();

  const isDark = theme === "dark";

  // Fallback demo data if DB is empty
  const demoIssues = [
    {
      _id: "demo-1",
      title: "Library 3rd Floor AC Malfunction",
      description: "Air conditioning in study hall 3 is blowing warm air.",
      category: "maintenance",
      priority: "high",
      status: "in-progress",
      imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80",
      location: { building: "Central Library", room: "3rd Floor" },
      reportedBy: { name: "Computer Science Dept" },
      upvotes: ["user1", "user2"],
      createdAt: new Date().toISOString()
    },
    {
      _id: "demo-2",
      title: "Block C Lab Projector Defect",
      description: "Projector bulb flickers intermittently during lectures.",
      category: "equipment",
      priority: "medium",
      status: "resolved",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80",
      location: { building: "CS Block C", room: "Lab 2" },
      reportedBy: { name: "IT Maintenance" },
      upvotes: ["user1"],
      createdAt: new Date().toISOString()
    },
    {
      _id: "demo-3",
      title: "Hostel Block A Water Supply Leak",
      description: "Minor pipe leak reported in 2nd floor restroom.",
      category: "plumbing",
      priority: "high",
      status: "reported",
      imageUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&q=80",
      location: { building: "Boys Hostel A", room: "Floor 2" },
      reportedBy: { name: "Hostel Resident" },
      upvotes: ["user1", "user2", "user3"],
      createdAt: new Date().toISOString()
    }
  ];

  const fetchIssuesData = async () => {
    setLoading(true);
    try {
      const res = await getIssues({ status: filter, search: searchTerm });
      if (res && res.issues) {
        setIssuesList(res.issues.length > 0 ? res.issues : demoIssues);
      } else {
        setIssuesList(demoIssues);
      }
    } catch (err) {
      console.warn("Backend issues API unavailable, displaying local state.", err);
      setIssuesList(demoIssues);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
    fetchIssuesData();
  }, [filter]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const openCreateModal = () => {
    setEditingIssue(null);
    setFormTitle("");
    setFormDesc("");
    setFormCategory("maintenance");
    setFormBuilding("Main Block");
    setFormRoom("");
    setFormPriority("medium");
    setFormStatus("reported");
    setImageFile(null);
    setImagePreview(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (issue) => {
    setEditingIssue(issue);
    setFormTitle(issue.title || "");
    setFormDesc(issue.description || "");
    setFormCategory(issue.category || "maintenance");
    setFormBuilding(issue.location?.building || "Main Block");
    setFormRoom(issue.location?.room || "");
    setFormPriority(issue.priority || "medium");
    setFormStatus(issue.status || "reported");
    setImageFile(null);

    let existingPreview = null;
    if (issue.imageUrl) {
      existingPreview = issue.imageUrl.startsWith("http")
        ? issue.imageUrl
        : `${SERVER_BASE}${issue.imageUrl}`;
    }
    setImagePreview(existingPreview);

    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMsg("You must be logged in to modify an issue.");
      setTimeout(() => navigate("/signin"), 1500);
      return;
    }

    setSubmitting(true);
    try {
      // Build FormData for image upload
      const formData = new FormData();
      formData.append("title", formTitle);
      formData.append("description", formDesc || "No description provided.");
      formData.append("category", formCategory);
      formData.append("building", formBuilding);
      formData.append("room", formRoom);
      formData.append("priority", formPriority);
      formData.append("status", formStatus);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingIssue) {
        // UPDATE EXISTING ISSUE
        const res = await updateIssue(editingIssue._id, formData);
        if (res && res.issue) {
          setIssuesList((prev) =>
            prev.map((item) => (item._id === editingIssue._id ? res.issue : item))
          );
        } else {
          // Optimistic update fallback
          setIssuesList((prev) =>
            prev.map((item) =>
              item._id === editingIssue._id
                ? {
                    ...item,
                    title: formTitle,
                    description: formDesc,
                    category: formCategory,
                    priority: formPriority,
                    status: formStatus,
                    location: { building: formBuilding, room: formRoom },
                    imageUrl: imagePreview || item.imageUrl
                  }
                : item
            )
          );
        }
      } else {
        // CREATE NEW ISSUE
        const res = await createIssue(formData);
        if (res && res.issue) {
          setIssuesList([res.issue, ...issuesList]);
        } else if (res && res.message && !res.issue) {
          setErrorMsg(res.message);
          setSubmitting(false);
          return;
        } else {
          // Fallback local append
          const fallbackIssue = {
            _id: `issue-${Date.now()}`,
            title: formTitle,
            description: formDesc,
            category: formCategory,
            priority: formPriority,
            status: formStatus,
            imageUrl: imagePreview,
            location: { building: formBuilding, room: formRoom },
            reportedBy: { name: user ? user.name : "Student" },
            upvotes: [],
            createdAt: new Date().toISOString()
          };
          setIssuesList([fallbackIssue, ...issuesList]);
        }
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Issue form submit error:", err);
      setErrorMsg("Failed to upload image & save issue ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue ticket?")) return;

    setIssuesList((prev) => prev.filter((item) => item._id !== issueId));

    try {
      await deleteIssue(issueId);
    } catch (err) {
      console.warn("Delete API sync failed, removed locally.", err);
    }
  };

  const handleUpvote = async (issueId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to upvote issues.");
      navigate("/signin");
      return;
    }

    setIssuesList((prev) =>
      prev.map((item) => {
        if (item._id === issueId) {
          const currentUpvotes = item.upvotes || [];
          const userId = user ? user._id : "temp-user";
          const alreadyUpvoted = currentUpvotes.includes(userId);
          const newUpvotes = alreadyUpvoted
            ? currentUpvotes.filter((id) => id !== userId)
            : [...currentUpvotes, userId];
          return { ...item, upvotes: newUpvotes };
        }
        return item;
      })
    );

    try {
      await upvoteIssue(issueId);
    } catch (err) {
      console.warn("Upvote API sync failed.", err);
    }
  };

  const filteredIssues = issuesList.filter((issue) => {
    const matchesFilter = filter === "all" || issue.status === filter;
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.location?.building || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.category || "").toLowerCase().includes(searchTerm.toLowerCase());
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
        activeTab="issues"
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
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-indigo-500 hover:text-indigo-600 mb-4 transition-colors">
            <ArrowLeft size={14} /> Back to Campus Overview
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono tracking-widest uppercase font-bold text-indigo-500">
                IMAGE UPLOAD & BACKEND INTEGRATED
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold mt-1 tracking-tight" style={{ fontFamily: "serif" }}>
                Campus Issue Tracker
              </h1>
              <p className={`mt-2 text-sm sm:text-base max-w-2xl ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                Report malfunctioning facilities with photo proof, edit ticket status, or track real-time repairs.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold shadow-lg bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <Plus size={18} /> Report New Issue
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
              placeholder="Search issues, building, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-full text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-400" : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["all", "reported", "in-progress", "resolved"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  filter === tab
                    ? "bg-indigo-600 text-white shadow-sm"
                    : isDark ? "text-slate-400 hover:bg-slate-800" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab === "all" ? "All Issues" : tab.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={36} />
          </div>
        ) : (
          /* Issues Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => {
              const upvoteCount = issue.upvotes ? issue.upvotes.length : 0;
              const imgSrc = issue.imageUrl
                ? issue.imageUrl.startsWith("http")
                  ? issue.imageUrl
                  : `${SERVER_BASE}${issue.imageUrl}`
                : null;

              return (
                <div
                  key={issue._id}
                  className={`p-6 rounded-2xl border transition-all hover:shadow-xl flex flex-col justify-between overflow-hidden ${
                    isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-amber-100 hover:border-amber-200"
                  }`}
                >
                  <div>
                    {/* Optional Image Preview Thumbnail */}
                    {imgSrc && (
                      <div className="w-full h-44 rounded-xl bg-gray-100 dark:bg-gray-800 mb-4 overflow-hidden relative">
                        <img src={imgSrc} alt={issue.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full uppercase border ${
                        issue.status === "resolved"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : issue.status === "in-progress"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                      }`}>
                        {issue.status || "reported"}
                      </span>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(issue)}
                          className="p-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all"
                          title="Edit / Update Issue"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteIssue(issue._id)}
                          className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          title="Delete Issue Ticket"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg mb-2 leading-snug">{issue.title}</h3>
                    <p className={`text-xs mb-3 line-clamp-2 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                      {issue.description}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-indigo-500 font-semibold mb-4">
                      <MapPin size={14} />
                      <span>
                        {issue.location?.building} {issue.location?.room ? `· Room ${issue.location.room}` : ""}
                      </span>
                    </div>
                  </div>

                  <div className={`pt-4 border-t flex items-center justify-between text-xs ${isDark ? "border-slate-800" : "border-gray-100"}`}>
                    <span className="text-gray-400 truncate max-w-[130px]">
                      By {issue.reportedBy?.name || "Student"}
                    </span>

                    <button
                      onClick={() => handleUpvote(issue._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold border transition-all hover:scale-105 active:scale-95 bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/20"
                    >
                      <ThumbsUp size={13} />
                      <span>{upvoteCount} Upvotes</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CREATE OR EDIT ISSUE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl relative max-h-[90vh] overflow-y-auto ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-amber-200 text-slate-900"
          }`}>
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-1">
              {editingIssue ? "Edit Issue Ticket" : "Report Campus Issue"}
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Upload photos of broken equipment or maintenance issues.
            </p>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold border border-red-500/20">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
              {/* IMAGE UPLOAD FIELD */}
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Attach Photo Proof</label>
                {imagePreview ? (
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden border mb-2 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors"
                      title="Remove Image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    isDark ? "border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-400" : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-500"
                  }`}>
                    <Upload size={24} className="mb-2 text-indigo-500" />
                    <span className="text-xs font-semibold">Click to upload photo</span>
                    <span className="text-[10px] opacity-70">JPG, PNG, WEBP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken AC in Central Library"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the malfunction or issue..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="equipment">Lab Equipment</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Building / Block *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Block C"
                    value={formBuilding}
                    onChange={(e) => setFormBuilding(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Room / Floor</label>
                  <input
                    type="text"
                    placeholder="e.g. Lab 302"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>
              </div>

              {editingIssue && (
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Issue Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none ${
                      isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <option value="reported">Reported</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              )}

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
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md flex items-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingIssue ? "Save & Update Ticket" : "Submit Issue Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

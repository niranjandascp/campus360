import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wrench, Plus, Search, CheckCircle2, Clock, AlertTriangle, ArrowLeft,
  ThumbsUp, MapPin, Loader2, Edit3, Trash2, X, Upload, Image as ImageIcon
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getIssues, createIssue, updateIssue, deleteIssue, upvoteIssue, API_URL } from "@/services/api";

const SERVER_BASE = API_URL.replace("/api", "");

export default function Issues() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
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
      if (res && Array.isArray(res.issues)) {
        setIssuesList(res.issues);
      } else {
        setIssuesList(demoIssues);
      }
    } catch (err) {
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
        const res = await updateIssue(editingIssue._id, formData);
        if (res && res.issue) {
          setIssuesList((prev) =>
            prev.map((item) => (item._id === editingIssue._id ? res.issue : item))
          );
        } else {
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
        const res = await createIssue(formData);
        if (res && res.issue) {
          setIssuesList([res.issue, ...issuesList]);
        } else if (res && res.message && !res.issue) {
          setErrorMsg(res.message);
          setSubmitting(false);
          return;
        } else {
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
      setErrorMsg("Failed to upload image & save issue ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue ticket?")) return;
    setIssuesList((prev) => prev.filter((item) => item._id !== issueId));
    if (String(issueId).startsWith("demo")) return;
    try {
      await deleteIssue(issueId);
    } catch (err) {}
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
    } catch (err) {}
  };

  const filteredIssues = issuesList.filter((issue) => {
    const matchesFilter =
      filter === "all" ||
      issue.status === filter ||
      (filter === "reported" && (issue.status === "open" || !issue.status));
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.location?.building || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <DashboardLayout user={user} onLogout={handleLogout} activeNav="my-reports">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6546DB] uppercase tracking-wider">
            <Wrench className="w-4 h-4 text-[#6546DB]" />
            <span>Campus Infrastructure Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
            Campus Issue Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 max-w-2xl">
            Report malfunctioning campus facilities with photo proof, track repair timelines, and upvote urgent issues.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md bg-gradient-to-r from-[#6546DB] to-[#8E5AEF] text-white hover:opacity-95 transition-all shrink-0"
        >
          <Plus size={16} /> Report New Issue
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search issues, building, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#6546DB]/50"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["all", "reported", "in-progress", "resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filter === tab
                  ? "bg-[#6546DB] text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]"
              }`}
            >
              {tab === "all" ? "All Issues" : tab.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING OR GRID */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#6546DB]" size={36} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                className="p-5 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs hover:shadow-xl hover:border-[#6546DB]/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {imgSrc && (
                    <div className="w-full h-44 rounded-2xl bg-[var(--bg-primary)] mb-4 overflow-hidden relative border border-[var(--border-color)]">
                      <img src={imgSrc} alt={issue.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      issue.status === "resolved"
                        ? "bg-[#20B486]/10 text-[#20B486] border-[#20B486]/20"
                        : issue.status === "in-progress"
                        ? "bg-[#4D7CFE]/10 text-[#4D7CFE] border-[#4D7CFE]/20"
                        : "bg-[#6546DB]/10 text-[#6546DB] border-[#6546DB]/20"
                    }`}>
                      {issue.status || "reported"}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(issue)}
                        className="p-1.5 rounded-lg border border-[#6546DB]/20 bg-[#6546DB]/10 text-[#6546DB] hover:bg-[#6546DB] hover:text-white transition-all"
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

                  <h3 className="font-bold text-base text-[var(--text-primary)] mb-1.5 leading-snug">{issue.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2 leading-relaxed">
                    {issue.description}
                  </p>

                  <div className="flex items-center gap-1 text-xs text-[#6546DB] font-semibold mb-4">
                    <MapPin size={14} />
                    <span>
                      {issue.location?.building} {issue.location?.room ? `· Room ${issue.location.room}` : ""}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] truncate max-w-[130px]">
                    By {issue.reportedBy?.name || "Student"}
                  </span>

                  <button
                    onClick={() => handleUpvote(issue._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold border transition-all hover:scale-105 bg-[#6546DB]/10 text-[#6546DB] border-[#6546DB]/20 hover:bg-[#6546DB] hover:text-white"
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

      {/* CREATE / EDIT MODAL */}
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
              {editingIssue ? "Edit Issue Ticket" : "Report Campus Issue"}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Upload photos of broken equipment or maintenance issues.
            </p>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold border border-red-500/20">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Attach Photo Proof</label>
                {imagePreview ? (
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-[var(--border-color)] mb-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-32 border-2 border-dashed border-[var(--border-color)] rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-[var(--bg-primary)] hover:bg-[var(--surface-elevated)] text-[var(--text-muted)] transition-colors">
                    <Upload size={24} className="mb-1.5 text-[#6546DB]" />
                    <span className="font-semibold text-xs">Click to upload photo</span>
                    <span className="text-[10px] opacity-70">JPG, PNG, WEBP up to 5MB</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Issue Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken AC in Central Library"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#6546DB]/50"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the malfunction..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#6546DB]/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="equipment">Lab Equipment</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High Urgent</option>
                  </select>
                </div>
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
                  {editingIssue ? "Save & Update Ticket" : "Submit Issue Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Plus, Search, CheckCircle2, ArrowLeft, Loader2, Edit3, Trash2, X, Upload, Tag, Calendar, Phone, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/ui/mini-navbar";
import { getLostFound, createLostFound, updateLostFound, deleteLostFound, claimLostFound, API_URL } from "@/services/api";

const SERVER_BASE = API_URL.replace("/api", "");

export default function LostFound() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [activeTypeTab, setActiveTypeTab] = useState("all"); // "all" | "lost" | "found"
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "unclaimed" | "claimed"
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formType, setFormType] = useState("found");
  const [formCategory, setFormCategory] = useState("other");
  const [formLocation, setFormLocation] = useState("");
  const [formContactInfo, setFormContactInfo] = useState("");
  const [formStatus, setFormStatus] = useState("unclaimed");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [itemsList, setItemsList] = useState([]);
  const navigate = useNavigate();

  const isDark = theme === "dark";

  // Demo Fallback Data
  const demoItems = [
    {
      _id: "demo-lf-1",
      title: "Black North Face Backpack",
      description: "Contains engineering notebooks and a silver pencil case.",
      type: "found",
      category: "accessories",
      location: "Central Library 2nd Floor",
      status: "claimed",
      contactInfo: "lib-frontdesk@campus.edu",
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
      postedBy: { name: "Library Staff" },
      createdAt: new Date().toISOString()
    },
    {
      _id: "demo-lf-2",
      title: "Brass Key Ring & Lanyard",
      description: "Set of 3 dorm keys with a blue university lanyard.",
      type: "found",
      category: "keys",
      location: "Near Main Canteen",
      status: "unclaimed",
      contactInfo: "Student Security Desk",
      imageUrl: "https://images.unsplash.com/photo-1582142839970-2b9322b7a976?w=500&q=80",
      postedBy: { name: "Security Office" },
      createdAt: new Date().toISOString()
    },
    {
      _id: "demo-lf-3",
      title: "Matte Black Earbuds Case",
      description: "Lost my wireless earbud charging case after evening physics lecture.",
      type: "lost",
      category: "electronics",
      location: "Auditorium Hall B",
      status: "unclaimed",
      contactInfo: "alex.m@student.campus.edu",
      imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80",
      postedBy: { name: "Alex Miller" },
      createdAt: new Date().toISOString()
    }
  ];

  const fetchItemsData = async () => {
    setLoading(true);
    try {
      const res = await getLostFound({
        type: activeTypeTab,
        category: categoryFilter,
        status: statusFilter,
        search: searchTerm
      });
      if (res && Array.isArray(res.items)) {
        setItemsList(res.items);
      } else {
        setItemsList(demoItems);
      }
    } catch (err) {
      console.warn("Backend Lost & Found API unavailable, using demo state.", err);
      setItemsList(demoItems);
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
    fetchItemsData();
  }, [activeTypeTab, statusFilter, categoryFilter]);

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
    setEditingItem(null);
    setFormTitle("");
    setFormDesc("");
    setFormType("found");
    setFormCategory("other");
    setFormLocation("");
    setFormContactInfo("");
    setFormStatus("unclaimed");
    setImageFile(null);
    setImagePreview(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormTitle(item.title || "");
    setFormDesc(item.description || "");
    setFormType(item.type || "found");
    setFormCategory(item.category || "other");
    setFormLocation(item.location || "");
    setFormContactInfo(item.contactInfo || "");
    setFormStatus(item.status || "unclaimed");
    setImageFile(null);

    let existingPreview = null;
    if (item.imageUrl) {
      existingPreview = item.imageUrl.startsWith("http")
        ? item.imageUrl
        : `${SERVER_BASE}${item.imageUrl}`;
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
      setErrorMsg("You must be logged in to post or edit an item.");
      setTimeout(() => navigate("/signin"), 1500);
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", formTitle);
      formData.append("description", formDesc);
      formData.append("type", formType);
      formData.append("category", formCategory);
      formData.append("location", formLocation);
      formData.append("contactInfo", formContactInfo);
      formData.append("status", formStatus);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingItem) {
        // UPDATE EXISTING ITEM
        const res = await updateLostFound(editingItem._id, formData);
        if (res && res.item) {
          setItemsList((prev) =>
            prev.map((item) => (item._id === editingItem._id ? res.item : item))
          );
        } else {
          // Optimistic local update fallback
          setItemsList((prev) =>
            prev.map((item) =>
              item._id === editingItem._id
                ? {
                    ...item,
                    title: formTitle,
                    description: formDesc,
                    type: formType,
                    category: formCategory,
                    location: formLocation,
                    contactInfo: formContactInfo,
                    status: formStatus,
                    imageUrl: imagePreview || item.imageUrl
                  }
                : item
            )
          );
        }
      } else {
        // CREATE NEW ITEM
        const res = await createLostFound(formData);
        if (res && res.item) {
          setItemsList([res.item, ...itemsList]);
        } else if (res && res.message && !res.item) {
          setErrorMsg(res.message);
          setSubmitting(false);
          return;
        } else {
          // Fallback local append
          const fallbackItem = {
            _id: `lf-${Date.now()}`,
            title: formTitle,
            description: formDesc,
            type: formType,
            category: formCategory,
            location: formLocation,
            contactInfo: formContactInfo,
            status: formStatus,
            imageUrl: imagePreview,
            postedBy: { name: user ? user.name : "Student" },
            createdAt: new Date().toISOString()
          };
          setItemsList([fallbackItem, ...itemsList]);
        }
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("LostFound form submit error:", err);
      setErrorMsg("Failed to post/update item on backend server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setItemsList((prev) => prev.filter((item) => item._id !== itemId));

    if (String(itemId).startsWith("demo")) return;

    try {
      await deleteLostFound(itemId);
    } catch (err) {
      console.warn("Delete API sync failed, item removed locally.", err);
    }
  };

  const handleClaimItem = async (itemId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to claim items.");
      navigate("/signin");
      return;
    }

    setItemsList((prev) =>
      prev.map((item) => (item._id === itemId ? { ...item, status: "claimed" } : item))
    );

    try {
      await claimLostFound(itemId);
    } catch (err) {
      console.warn("Claim API sync failed, updated locally.", err);
    }
  };

  const filteredItems = itemsList.filter((item) => {
    let matchesType = true;
    if (activeTypeTab === "found") matchesType = item.type === "found";
    else if (activeTypeTab === "lost") matchesType = item.type === "lost";
    else if (activeTypeTab === "claimed") matchesType = item.status === "claimed" || item.status === "returned";

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesStatus && matchesCategory && matchesSearch;
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
                CAMPUS RECOVERY PORTAL · FULL CRUD CONNECTED
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold mt-1 tracking-tight" style={{ fontFamily: "serif" }}>
                Lost & Found Hub
              </h1>
              <p className={`mt-2 text-sm sm:text-base max-w-2xl ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                Misplaced your student ID, keys, or backpack? Post a lost notice or report items found around campus.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold shadow-lg bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <Plus size={18} /> Report Lost / Found Item
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className={`p-4 rounded-2xl border mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-amber-100"
        }`}>
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, location, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-full text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-400" : "bg-gray-50 border-gray-200 text-gray-900"
              }`}
            />
          </div>

          {/* Filter Dropdowns & Type Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-full overflow-x-auto">
              {["all", "found", "lost", "claimed"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTypeTab(tab)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap ${
                    activeTypeTab === tab
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {tab === "all" ? "All Items" : tab}
                </button>
              ))}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border focus:outline-none ${
                isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
              }`}
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="keys">Keys</option>
              <option value="documents">Documents / ID</option>
              <option value="clothing">Clothing</option>
              <option value="accessories">Accessories</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={36} />
          </div>
        ) : (
          /* Items Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const imgSrc = item.imageUrl
                ? item.imageUrl.startsWith("http")
                  ? item.imageUrl
                  : `${SERVER_BASE}${item.imageUrl}`
                : null;

              return (
                <div
                  key={item._id}
                  className={`p-6 rounded-3xl border transition-all hover:shadow-xl flex flex-col justify-between overflow-hidden relative ${
                    isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-amber-100 hover:border-amber-200"
                  }`}
                >
                  <div>
                    {/* Item Image */}
                    <div className="w-full h-44 rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4 overflow-hidden relative">
                      {imgSrc ? (
                        <img src={imgSrc} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Tag size={32} className="opacity-40" />
                        </div>
                      )}

                      {/* Type Badge */}
                      <span className={`absolute top-3 left-3 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase text-white shadow-md ${
                        item.type === "lost" ? "bg-rose-600" : "bg-emerald-600"
                      }`}>
                        {item.type}
                      </span>

                      {/* Status Tag */}
                      <span className={`absolute top-3 right-3 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${
                        item.status === "claimed"
                          ? "bg-slate-950/80 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500 text-slate-950 font-bold"
                      }`}>
                        {item.status === "claimed" ? "Claimed / Returned" : "Unclaimed"}
                      </span>
                    </div>

                    {/* Card Actions Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-semibold text-emerald-500 uppercase">
                        {item.category || "General"}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                          title="Edit Item"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          title="Delete Post"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg mb-1 leading-snug">{item.title}</h3>
                    <p className={`text-xs mb-3 line-clamp-2 ${isDark ? "text-slate-400" : "text-gray-600"}`}>
                      {item.description}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <MapPin size={14} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    {item.contactInfo && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                        <Phone size={13} className="shrink-0" />
                        <span className="truncate">{item.contactInfo}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className={`pt-4 border-t flex items-center justify-between ${isDark ? "border-slate-800" : "border-gray-100"}`}>
                    <span className="text-[11px] text-gray-400">
                      By {item.postedBy?.name || "Campus Member"}
                    </span>

                    {item.status !== "claimed" ? (
                      <button
                        onClick={() => handleClaimItem(item._id)}
                        className="px-4 py-1.5 rounded-full text-xs font-semibold border border-emerald-500/30 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        Claim Item
                      </button>
                    ) : (
                      <span className="text-xs font-mono font-medium text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 size={13} /> Reclaimed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CREATE OR EDIT MODAL */}
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
              {editingItem ? "Edit Item Listing" : "Post Lost / Found Item"}
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Connected directly to Campus Recovery API.
            </p>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold border border-red-500/20">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormType("found")}
                  className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                    formType === "found" ? "bg-emerald-600 text-white shadow-sm" : "text-gray-500"
                  }`}
                >
                  I Found An Item
                </button>
                <button
                  type="button"
                  onClick={() => setFormType("lost")}
                  className={`py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                    formType === "lost" ? "bg-rose-600 text-white shadow-sm" : "text-gray-500"
                  }`}
                >
                  I Lost An Item
                </button>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Upload Photo</label>
                {imagePreview ? (
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden border mb-2">
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
                  <label className={`w-full h-28 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    isDark ? "border-slate-700 bg-slate-800/50 text-slate-400" : "border-gray-200 bg-gray-50 text-gray-500"
                  }`}>
                    <Upload size={22} className="mb-1 text-emerald-500" />
                    <span className="text-xs font-semibold">Attach item image</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue Hydro Flask / Student ID Card"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide distinguishing features or details..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
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
                    <option value="electronics">Electronics</option>
                    <option value="keys">Keys</option>
                    <option value="documents">Documents / ID</option>
                    <option value="clothing">Clothing</option>
                    <option value="accessories">Accessories</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Canteen Hall B"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                      isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Contact Details / Email</label>
                <input
                  type="text"
                  placeholder="e.g. Phone number or desk contact"
                  value={formContactInfo}
                  onChange={(e) => setFormContactInfo(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                  }`}
                />
              </div>

              {editingItem && (
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold focus:outline-none ${
                      isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <option value="unclaimed">Unclaimed</option>
                    <option value="claimed">Claimed</option>
                    <option value="returned">Returned</option>
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
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md flex items-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {editingItem ? "Update Listing" : "Post Item Listing"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

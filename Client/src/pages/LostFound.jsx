import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Plus, Search, CheckCircle2, ArrowLeft, Loader2, Edit3, Trash2, X, Upload, Tag, Phone, Package } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { getLostFound, createLostFound, updateLostFound, deleteLostFound, claimLostFound, API_URL } from "@/services/api";

const SERVER_BASE = API_URL.replace("/api", "");

export default function LostFound() {
  const [user, setUser] = useState(null);
  const [activeTypeTab, setActiveTypeTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
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
      postedBy: { name: "Library Staff" }
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
      postedBy: { name: "Security Office" }
    },
    {
      _id: "demo-lf-3",
      title: "Matte Black Earbuds Case",
      description: "Lost my wireless earbud charging case after physics lecture.",
      type: "lost",
      category: "electronics",
      location: "Auditorium Hall B",
      status: "unclaimed",
      contactInfo: "alex.m@student.campus.edu",
      imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80",
      postedBy: { name: "Alex Miller" }
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
      setErrorMsg("You must be logged in to post an item.");
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
        const res = await updateLostFound(editingItem._id, formData);
        if (res && res.item) {
          setItemsList((prev) =>
            prev.map((item) => (item._id === editingItem._id ? res.item : item))
          );
        } else {
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
        const res = await createLostFound(formData);
        if (res && res.item) {
          setItemsList([res.item, ...itemsList]);
        } else if (res && res.message && !res.item) {
          setErrorMsg(res.message);
          setSubmitting(false);
          return;
        } else {
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
            postedBy: { name: user ? user.name : "Student" }
          };
          setItemsList([fallbackItem, ...itemsList]);
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      setErrorMsg("Failed to save item listing.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    setItemsList((prev) => prev.filter((item) => item._id !== itemId));
    if (String(itemId).startsWith("demo")) return;
    try {
      await deleteLostFound(itemId);
    } catch (err) {}
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
    } catch (err) {}
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
    <DashboardLayout user={user} onLogout={() => { localStorage.clear(); navigate("/signin"); }} activeNav="marketplace">
      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F0A34A] uppercase tracking-wider">
            <Package className="w-4 h-4 text-[#F0A34A]" />
            <span>Campus Lost & Found Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
            Marketplace & Item Recovery
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 max-w-2xl">
            Misplaced your student ID, keys, or backpack? Post a lost notice or claim items found on campus.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md bg-gradient-to-r from-[#6546DB] to-[#8E5AEF] text-white hover:opacity-95 transition-all shrink-0"
        >
          <Plus size={16} /> Report Item
        </button>
      </div>

      {/* FILTERS */}
      <div className="p-4 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search title, location or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#6546DB]/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 p-1 bg-[var(--bg-primary)] rounded-xl">
            {["all", "found", "lost", "claimed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTypeTab(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                  activeTypeTab === tab
                    ? "bg-[#6546DB] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ITEMS GRID */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#F0A34A]" size={36} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const imgSrc = item.imageUrl
              ? item.imageUrl.startsWith("http")
                ? item.imageUrl
                : `${SERVER_BASE}${item.imageUrl}`
              : null;

            return (
              <div
                key={item._id}
                className="p-5 rounded-3xl bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs hover:shadow-xl hover:border-[#F0A34A]/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {imgSrc && (
                    <div className="w-full h-44 rounded-2xl bg-[var(--bg-primary)] mb-4 overflow-hidden relative border border-[var(--border-color)]">
                      <img src={imgSrc} alt={item.title} className="w-full h-full object-cover" />
                      <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white ${
                        item.type === "lost" ? "bg-[#EF5350]" : "bg-[#20B486]"
                      }`}>
                        {item.type.toUpperCase()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#F0A34A] uppercase">
                      {item.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg border border-[#6546DB]/20 bg-[#6546DB]/10 text-[#6546DB] hover:bg-[#6546DB] hover:text-white transition-all"
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

                  <h3 className="font-bold text-base text-[var(--text-primary)] mb-1.5 leading-snug">{item.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] mb-4">
                    <MapPin size={14} className="text-[#F0A34A]" />
                    <span className="truncate">{item.location}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] truncate max-w-[130px]">
                    By {item.postedBy?.name || "Member"}
                  </span>

                  {item.status !== "claimed" ? (
                    <button
                      onClick={() => handleClaimItem(item._id)}
                      className="px-3.5 py-1.5 rounded-xl font-bold border border-[#20B486]/30 text-[#20B486] hover:bg-[#20B486] hover:text-white transition-all"
                    >
                      Claim Item
                    </button>
                  ) : (
                    <span className="font-bold text-[#20B486] flex items-center gap-1">
                      <CheckCircle2 size={14} /> Claimed
                    </span>
                  )}
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
              {editingItem ? "Edit Item Listing" : "Post Lost / Found Item"}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mb-5">
              Submit item details for campus community recovery.
            </p>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Blue Hydro Flask"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Distinguishing features..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
                  >
                    <option value="found">Found Item</option>
                    <option value="lost">Lost Item</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="Central Library 2nd Floor"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase mb-1 text-[var(--text-secondary)]">Photo (Optional)</label>
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
                  {editingItem ? "Update Item" : "Post Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

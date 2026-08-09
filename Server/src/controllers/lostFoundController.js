const LostFound = require("../models/LostFound");

// Get all lost & found items with search and filters
const getAllLostFound = async (req, res) => {
  try {
    const { type, category, status, search } = req.query;

    const filter = {};

    if (type && type !== "all") {
      filter.type = type;
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }

    const items = await LostFound.find(filter)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      count: items.length,
      items
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single item by ID
const getLostFoundById = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id).populate("postedBy", "name email");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new Lost & Found item
const createLostFound = async (req, res) => {
  try {
    const { title, description, type, category, location, contactInfo } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ message: "Title, description and location are required" });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const item = await LostFound.create({
      title,
      description,
      type: type || "found",
      category: category || "other",
      location,
      contactInfo: contactInfo || "",
      imageUrl,
      postedBy: req.user._id
    });

    const populatedItem = await LostFound.findById(item._id).populate("postedBy", "name email");

    res.status(201).json({
      message: "Item posted successfully",
      item: populatedItem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Lost & Found item
const updateLostFound = async (req, res) => {
  try {
    const { title, description, type, category, location, status, contactInfo } = req.body;
    const item = await LostFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (
      item.postedBy &&
      item.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to update this item" });
    }

    if (title) item.title = title;
    if (description) item.description = description;
    if (type) item.type = type;
    if (category) item.category = category;
    if (location) item.location = location;
    if (status) item.status = status;
    if (contactInfo !== undefined) item.contactInfo = contactInfo;

    if (req.file) {
      item.imageUrl = `/uploads/${req.file.filename}`;
    }

    await item.save();

    const updatedItem = await LostFound.findById(item._id).populate("postedBy", "name email");

    res.json({
      message: "Item updated successfully",
      item: updatedItem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Lost & Found item
const deleteLostFound = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (
      item.postedBy &&
      item.postedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }

    await LostFound.findByIdAndDelete(req.params.id);

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Claim item
const claimItem = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.status = "claimed";
    await item.save();

    res.json({
      message: "Item marked as claimed",
      item
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllLostFound,
  getLostFoundById,
  createLostFound,
  updateLostFound,
  deleteLostFound,
  claimItem
};

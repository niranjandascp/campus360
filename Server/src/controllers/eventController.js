const Event = require("../models/Event");

// @desc    Get all events (supports category & search filters)
// @route   GET /api/events
const getAllEvents = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { host: { $regex: search, $options: "i" } }
      ];
    }

    const events = await Event.find(filter)
      .populate("organizer", "name email userId department year role avatar")
      .populate("rsvps", "name email userId department year role avatar")
      .sort({ createdAt: -1 });

    res.json({
      count: events.length,
      events
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name email userId")
      .populate("rsvps", "name email department");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new event
// @route   POST /api/events
const createEvent = async (req, res) => {
  try {
    const { title, description, category, date, time, location, host } = req.body;

    if (!title || !description || !date || !location) {
      return res.status(400).json({ message: "Title, description, date, and location are required" });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const event = await Event.create({
      title,
      description,
      category: category || "Other",
      date,
      time: time || "10:00 AM",
      location,
      host: host || req.user.name,
      imageUrl,
      organizer: req.user._id,
      rsvps: []
    });

    const populatedEvent = await Event.findById(event._id)
      .populate("organizer", "name email userId department year role avatar")
      .populate("rsvps", "name email userId department year role avatar");

    res.status(201).json({
      message: "Event created successfully",
      event: populatedEvent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check authorization: organizer or admin
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this event" });
    }

    const { title, description, category, date, time, location, host } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (date) event.date = date;
    if (time) event.time = time;
    if (location) event.location = location;
    if (host) event.host = host;

    if (req.file) {
      event.imageUrl = `/uploads/${req.file.filename}`;
    }

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate("organizer", "name email userId department year role avatar")
      .populate("rsvps", "name email userId department year role avatar");

    res.json({
      message: "Event updated successfully",
      event: updatedEvent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this event" });
    }

    await event.deleteOne();

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle RSVP status for an event
// @route   POST /api/events/:id/rsvp
const toggleRsvp = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const userId = req.user._id;
    const rsvpIndex = event.rsvps.findIndex((id) => id.toString() === userId.toString());

    if (rsvpIndex > -1) {
      // Already RSVPed -> Remove RSVP
      event.rsvps.splice(rsvpIndex, 1);
    } else {
      // Not RSVPed -> Add RSVP
      event.rsvps.push(userId);
    }

    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate("organizer", "name email userId department year role avatar")
      .populate("rsvps", "name email userId department year role avatar");

    res.json({
      message: rsvpIndex > -1 ? "RSVP cancelled" : "RSVP confirmed",
      rsvped: rsvpIndex === -1,
      event: updatedEvent
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleRsvp
};

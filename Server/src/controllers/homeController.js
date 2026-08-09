const User = require("../models/User");
const Issue = require("../models/Issue");
const LostFound = require("../models/LostFound");
const Event = require("../models/Event");

const getHome = (req, res) => {
  res.json({
    message: "Campus360 API is running",
    status: "success"
  });
};

const getStats = async (req, res) => {
  try {
    const studentsCount = await User.countDocuments();
    const issuesResolved = await Issue.countDocuments({ status: "resolved" });
    const itemsRecovered = await LostFound.countDocuments({ status: "claimed" });
    const eventsCount = await Event.countDocuments();

    res.json({
      studentsCount,
      issuesResolved,
      itemsRecovered,
      eventsCount
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

module.exports = {
  getHome,
  getStats
};
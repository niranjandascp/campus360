const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ["Tech Fest", "Cultural", "Workshop", "Sports", "Academic", "Seminar", "Other"],
      default: "Other"
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      default: "10:00 AM"
    },
    location: {
      type: String,
      required: true
    },
    host: {
      type: String,
      default: "Campus Student Council"
    },
    imageUrl: {
      type: String,
      default: ""
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    rsvps: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Event", eventSchema);

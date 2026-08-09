const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true
    },
    description: {
      type: String,
      required: [true, "Description is required"]
    },
    type: {
      type: String,
      enum: ["lost", "found"],
      default: "found"
    },
    category: {
      type: String,
      enum: ["electronics", "keys", "documents", "clothing", "accessories", "other"],
      default: "other"
    },
    location: {
      type: String,
      required: [true, "Location is required"]
    },
    date: {
      type: Date,
      default: Date.now
    },
    imageUrl: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["unclaimed", "claimed", "returned"],
      default: "unclaimed"
    },
    contactInfo: {
      type: String,
      default: ""
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LostFound", lostFoundSchema);

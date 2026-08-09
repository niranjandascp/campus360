const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
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
      lowercase: true,
      trim: true,
      enum: [
        "wifi",
        "electricity font",
        "electricity",
        "electrical",
        "water",
        "plumbing",
        "maintenance",
        "cleanliness",
        "classroom",
        "laboratory",
        "equipment",
        "furniture",
        "security",
        "hostel",
        "academic",
        "other"
      ],
      required: true
    },

    location: {
      building: {
        type: String,
        required: true
      },

      room: {
        type: String,
        default: ""
      }
    },

    imageUrl: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      lowercase: true,
      enum: ["open", "reported", "in-progress", "resolved"],
      default: "open"
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },

        message: {
          type: String,
          required: true
        },

        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Issue", issueSchema);
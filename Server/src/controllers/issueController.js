const Issue = require("../models/Issue");

const getAllIssues = async (req, res) => {
  try {
    const {
      status,
      category,
      search
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i"
          }
        },
        {
          description: {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }

    const issues = await Issue.find(filter)
      .populate("reportedBy", "name email")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });

    res.json({
      count: issues.length,
      issues
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("reportedBy", "name email")
      .populate("comments.user", "name");

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found"
      });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const createIssue = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      building,
      room,
      priority
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !building
    ) {
      return res.status(400).json({
        message:
          "Title, description, category and building are required"
      });
    }

    let imageUrl = "";

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const issue = await Issue.create({
      title,
      description,
      category,
      priority: priority || "medium",
      imageUrl,
      location: {
        building,
        room: room || ""
      },
      reportedBy: req.user._id
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate("reportedBy", "name email");

    res.status(201).json({
      message: "Issue reported successfully",
      issue: populatedIssue
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "reported",
      "in-progress",
      "resolved"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found"
      });
    }

    res.json({
      message: "Issue status updated",
      issue
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const toggleUpvote = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found"
      });
    }

    const userId = req.user._id.toString();

    const alreadyUpvoted = issue.upvotes.some(
      (id) => id.toString() === userId
    );

    if (alreadyUpvoted) {
      issue.upvotes = issue.upvotes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      issue.upvotes.push(req.user._id);
    }

    await issue.save();

    res.json({
      message: alreadyUpvoted
        ? "Upvote removed"
        : "Issue upvoted",
      totalUpvotes: issue.upvotes.length
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Comment message is required"
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found"
      });
    }

    issue.comments.push({
      user: req.user._id,
      message
    });

    await issue.save();

    const updatedIssue = await issue.populate(
      "comments.user",
      "name"
    );

    res.status(201).json({
      message: "Comment added successfully",
      issue: updatedIssue
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const findSimilarIssues = async (req, res) => {
  try {
    const {
      building,
      room,
      category
    } = req.query;

    const filter = {
      status: {
        $ne: "resolved"
      }
    };

    if (building) {
      filter["location.building"] = building;
    }

    if (room) {
      filter["location.room"] = room;
    }

    if (category) {
      filter.category = category;
    }

    const issues = await Issue.find(filter)
      .populate("reportedBy", "name")
      .sort({ createdAt: -1 });

    res.json({
      count: issues.length,
      issues
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getIssueStats = async (req, res) => {
  try {
    const [
      total,
      reported,
      inProgress,
      resolved,
      highPriority
    ] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: "reported" }),
      Issue.countDocuments({ status: "in-progress" }),
      Issue.countDocuments({ status: "resolved" }),
      Issue.countDocuments({ priority: "high" })
    ]);

    res.json({
      total,
      reported,
      inProgress,
      resolved,
      highPriority
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const updateIssue = async (req, res) => {
  try {
    const { title, description, category, building, room, priority, status } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    if (issue.reportedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this issue" });
    }

    if (title) issue.title = title;
    if (description) issue.description = description;
    if (category) issue.category = category;
    if (building || room !== undefined) {
      issue.location = {
        building: building || issue.location?.building || "",
        room: room !== undefined ? room : issue.location?.room || ""
      };
    }
    if (priority) issue.priority = priority;
    if (status) issue.status = status;
    if (req.file) {
      issue.imageUrl = `/uploads/${req.file.filename}`;
    }

    await issue.save();

    const updatedIssue = await Issue.findById(issue._id)
      .populate("reportedBy", "name email");

    res.json({
      message: "Issue updated successfully",
      issue: updatedIssue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    if (issue.reportedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this issue" });
    }
    await Issue.findByIdAndDelete(req.params.id);
    res.json({ message: "Issue deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  updateIssueStatus,
  toggleUpvote,
  addComment,
  findSimilarIssues,
  getIssueStats
};
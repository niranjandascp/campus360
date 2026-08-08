const express = require("express");

const {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssueStatus,
  toggleUpvote,
  addComment
} = require("../controllers/issueController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getAllIssues);

router.get("/:id", getIssueById);

router.post(
  "/",
  protect,
  upload.single("image"),
  createIssue
);

router.patch(
  "/:id/status",
  protect,
  adminOnly,
  updateIssueStatus
);

router.post(
  "/:id/upvote",
  protect,
  toggleUpvote
);

router.post(
  "/:id/comments",
  protect,
  addComment
);

module.exports = router;
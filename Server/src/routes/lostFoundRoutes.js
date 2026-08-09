const express = require("express");
const {
  getAllLostFound,
  getLostFoundById,
  createLostFound,
  updateLostFound,
  deleteLostFound,
  claimItem
} = require("../controllers/lostFoundController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/", getAllLostFound);
router.get("/:id", getLostFoundById);

router.post("/", protect, upload.single("image"), createLostFound);
router.put("/:id", protect, upload.single("image"), updateLostFound);
router.delete("/:id", protect, deleteLostFound);
router.post("/:id/claim", protect, claimItem);

module.exports = router;

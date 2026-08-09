const express = require("express");
const { getHome, getStats } = require("../controllers/homeController");

const router = express.Router();

router.get("/", getHome);
router.get("/api/stats", getStats);

module.exports = router;
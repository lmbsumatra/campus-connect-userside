const express = require("express");
const router = express.Router();
const recentActivitycontroller = require("../controllers/RecentActivitiesController")

router.get("/", recentActivitycontroller.getAllRecentActivities);

module.exports = router;

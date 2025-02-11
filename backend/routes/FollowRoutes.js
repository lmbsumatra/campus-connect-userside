const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow/FollowController.js");

router.post("/follow-user", FollowController.followUser);

module.exports = router;

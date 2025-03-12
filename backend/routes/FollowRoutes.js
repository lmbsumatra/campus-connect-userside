const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow/FollowController.js");
const authenticateToken = require("../middlewares/StudentAuthMiddleware");

router.post("/follow-user", FollowController.followUser);
router.get("/followings", authenticateToken, FollowController.getFollowings);

module.exports = router;

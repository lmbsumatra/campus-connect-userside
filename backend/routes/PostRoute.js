const express = require("express");
const router = express.Router();
const PostContoller = require("../controllers/PostController");
const PostController2 = require("../controllers/post/PostController");
const checkUnavailableDate = require("../middlewares/CheckUnavailableDate");
const { upload_item } = require("../config/multer");
const updatePostStatus = require("../controllers/post/updatePostStatus");
const { authenticateToken } = require("../middlewares/AdminAuthMiddleware");

router.get("/:id/matched-items", PostController2.matchedItems);

/* * * * * * * * * displayed for all users :: available * * * * * * * * * * * * * */
// lahat ng available na post (approved, with available date and corresponding time)
router.get("/approved", PostController2.getAllAvailablePost);

// isang post na available (approved, with available date and corresponding time)
router.get("/available/:id", PostController2.getAvailablePostById);
// lahat ng  post na available per user kapag nagvisit sa profile nila (approved, with available date and corresponding time)
router.get("/user/:userId/available", PostController2.getAvailablePostsByUser); // get by query [item-for-sale/user?query=value]
router.get("/all/available/user", PostContoller.getAvailablePostsByUser); // get by query [item-for-sale/user?query=value]
router.get("/users/:userId", PostController2.getAllPostsByUser);

// displayed for all admins
router.get("/info", PostContoller.getAllPosts);

// crud for user
router.post(
  "/create",
  checkUnavailableDate,
  upload_item,
  PostController2.createPost
);
router.get("/:id", PostContoller.getPostById);
router.get(
  "/users/:userId/get/:postId",
  upload_item,
  PostController2.getPostById
);
router.patch(
  "/users/:userId/update/:postId",
  upload_item,
  PostController2.updatePostById
);
router.put("/:id", PostContoller.updatePost);
router.delete("/:id", PostContoller.deletePost);
router.patch("/:id", PostContoller.updateStatus);
// New route for updating post status and emitting notifications
router.patch("/:id/status", authenticateToken, updatePostStatus);

module.exports = router;

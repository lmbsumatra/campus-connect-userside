const express = require("express");
const router = express.Router();
const PostContoller = require("../controllers/PostController");

/* * * * * * * * * displayed for all users :: available * * * * * * * * * * * * * */
 // lahat ng available na post (approved, with available date and corresponding time)
router.get("/approved", PostContoller.getAllApprovedPost);
 // isang post na available (approved, with available date and corresponding time)
router.get('/available/:id', PostContoller.getAvailablePostById); 
 // lahat ng  post na available per user kapag nagvisit sa profile nila (approved, with available date and corresponding time)
router.get("/all/available/user", PostContoller.getAvailablePostsByUser); // get by query [item-for-sale/user?query=value]

// displayed for all admins
router.get("/info", PostContoller.getAllPosts);

// crud for user
router.post("/create", PostContoller.createPost);
router.get("/:id", PostContoller.getPostById);
router.put("/:id", PostContoller.updatePost);
router.delete("/:id", PostContoller.deletePost);
router.patch("/:id", PostContoller.updateStatus);


module.exports = router;

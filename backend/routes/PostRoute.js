const express = require('express');
const router = express.Router();
const PostContoller = require('../controllers/PostController')


router.post('/create', PostContoller.createPost);
router.get('/info', PostContoller.getAllPosts);
router.get('/:id', PostContoller.getPostById);
router.put('/:id', PostContoller.updatePost);
router.delete('/:id', PostContoller.deletePost);
router.patch('/:id', PostContoller.updateStatus);

module.exports = router;

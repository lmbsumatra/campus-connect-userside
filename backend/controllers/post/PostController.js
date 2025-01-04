const getAllAvailablePost = require("./getAllAvailablePost.js");
const getAvailablePostById = require("./getAvailablePostById.js");
const createPost = require("./createPost.js");

const PostController = {
  getAllAvailablePost,
  getAvailablePostById,
  createPost,
};

module.exports = PostController;

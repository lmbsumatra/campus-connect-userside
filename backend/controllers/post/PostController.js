const getAllAvailablePost = require("./getAllAvailablePost.js");
const getAvailablePostById = require("./getAvailablePostById.js");
const createPost = require("./createPost.js");
const getAvailablePostsByUser = require("./getAvailablePostsByUser.js");
const getAllAvailablePostUsingQuery = require("./getAllAvailablePostUsingQuery.js");
const getAllPostsByUser = require("./getAllPostsByUser");

const PostController = {
  getAllAvailablePost,
  getAvailablePostById,
  createPost,
  getAvailablePostsByUser,
  getAllAvailablePostUsingQuery,
  getAllPostsByUser,
};

module.exports = PostController;

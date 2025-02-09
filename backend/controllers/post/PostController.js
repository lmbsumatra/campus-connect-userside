const getAllAvailablePost = require("./getAllAvailablePost.js");
const getAvailablePostById = require("./getAvailablePostById.js");
const createPost = require("./createPost.js");
const getAvailablePostsByUser = require("./getAvailablePostsByUser.js");
const getAllAvailablePostUsingQuery = require("./getAllAvailablePostUsingQuery.js");

const PostController = {
  getAllAvailablePost,
  getAvailablePostById,
  createPost,
  getAvailablePostsByUser,
  getAllAvailablePostUsingQuery,
};

module.exports = PostController;

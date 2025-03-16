const getAllAvailablePost = require("./getAllAvailablePost.js");
const getAvailablePostById = require("./getAvailablePostById.js");
const createPost = require("./createPost.js");
const getAvailablePostsByUser = require("./getAvailablePostsByUser.js");
const getAllAvailablePostUsingQuery = require("./getAllAvailablePostUsingQuery.js");
const getAllPostsByUser = require("./getAllPostsByUser");
const matchedItems = require("./matchedItems.js");
const getPostById = require("./getPostById.js");
const updatePostById = require("./updatePostById.js");

const PostController = {
  getAllAvailablePost,
  getAvailablePostById,
  createPost,
  getAvailablePostsByUser,
  getAllAvailablePostUsingQuery,
  getAllPostsByUser,
  matchedItems,
  getPostById,
  updatePostById
};

module.exports = PostController;

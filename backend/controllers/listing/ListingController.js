const getAllAvailable = require("./getAllAvailable");
const getAvailableListingById = require("./getAvailableListingById");
const addListing = require("./addListing.js");
const getAllListingsByUser = require("./getAllListingsByUser");
const deleteListingById = require("./deleteListingById");
const getListingById = require("./getListingById");
const updateListingById = require("./updateListingById");
const getAvailableListingsByUser = require("./getAvailableListingsByUser")

const ListingController = {
  getAllAvailable,
  getAvailableListingById,
  addListing,
  getAllListingsByUser,
  deleteListingById,
  getListingById,
  updateListingById,
  getAvailableListingsByUser,
};

module.exports = ListingController;

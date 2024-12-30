const getAllAvailable = require("./getAllAvailable");
const getAvailableListingById = require("./getAvailableListingById");
const addListing = require("./addListing.js");
const getAllListingsByUser = require("./getAllListingsByUser");
const deleteListingById = require("./deleteListingById");
const getListingById = require("./getListingById");
const updateListingById = require("./updateListingById");

const ListingController = {
  getAllAvailable,
  getAvailableListingById,
  addListing,
  getAllListingsByUser,
  deleteListingById,
  getListingById,
  updateListingById,
};

module.exports = ListingController;

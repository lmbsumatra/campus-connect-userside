const getAllAvailable = require("./getAllAvailable");
const getAvailableListingById = require("./getAvailableListingById");
const addListing = require("./addListing.js");
const getAllListingsByUser = require("./getAllListingsByUser");
const deleteListingById = require("./deleteListingById");

const ListingController = {
  getAllAvailable,
  getAvailableListingById,
  addListing,
  getAllListingsByUser,
  deleteListingById
};

module.exports = ListingController;

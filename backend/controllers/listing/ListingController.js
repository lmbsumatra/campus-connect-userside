const getAllAvailable = require("./getAllAvailable");
const getAvailableListingById = require("./getAvailableListingById");
const addListing = require("./addListing.js");

const ListingController = {
  getAllAvailable,
  getAvailableListingById,
  addListing,
};

module.exports = ListingController;

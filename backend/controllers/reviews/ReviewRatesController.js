const createReview = require("./createReview.js");
const getReviewsByUser = require("./getReviewsByUser.js");
const ReviewRatesController = { createReview, getReviewsByUser };

module.exports = ReviewRatesController;

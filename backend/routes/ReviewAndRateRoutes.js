const express = require("express");
const router = express.Router();
const ReviewAndRateController = require("../controllers/reviews/ReviewRatesController.js");

router.post("/submit", ReviewAndRateController.createReview);
router.get("/get/user/:userId", ReviewAndRateController.getReviewsByUser);

module.exports = router;

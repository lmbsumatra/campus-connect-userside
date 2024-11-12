const express = require("express");
const router = express.Router();
const ReviewAndRateController = require("../controllers/ReviewAndRateController");

router.post("/submit", ReviewAndRateController.createReview);

module.exports = router;

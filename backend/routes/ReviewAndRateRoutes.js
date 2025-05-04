const express = require("express");
const ReviewAndRateController = require("../controllers/reviews/ReviewRatesController.js");

module.exports = function ({ emitNotification }) {
  const router = express.Router();

  router.use((req, res, next) => {
    req.emitNotification = emitNotification;
    next();
  });
  router.post("/submit", ReviewAndRateController.createReview);
  router.get("/get/user/:userId", ReviewAndRateController.getReviewsByUser);

  return router;
};

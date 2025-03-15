const express = require("express");
const router = express.Router();
const ListingController = require("../controllers/ListingController");
const ListingController2 = require("../controllers/listing/ListingController");
const { upload_item } = require("../config/multer");
const checkUnavailableDate = require("../middlewares/CheckUnavailableDate");
const updateListingStatus = require("../controllers/listing/updateListingStatus");
const { authenticateToken } = require("../middlewares/AdminAuthMiddleware");

/* * * * * * * * * displayed for all users :: available * * * * * * * * * * * * * */
// lahat ng available na listing (approved, with available date and corresponding time)
router.get("/available", ListingController2.getAllAvailable);
// isang listing na available (approved, with available date and corresponding time)
router.get("/available/:id", ListingController2.getAvailableListingById);
// lahat ng  listing available per user kapag nagvisit sa profile nila (approved, with available date and corresponding time)
router.get(
  "/user/:userId/available",
  ListingController2.getAvailableListingsByUser
); // get by query [item-for-sale/user?query=value]
router.get("/users/:userId", ListingController2.getAllListingsByUser); // get by query [item-for-sale/user?query=value]

// displayed for all admins
router.get("/info", ListingController.getAllListings);

// user crud
router.get("/users/:userId/get/:listingId", ListingController2.getListingById);
router.post(
  "/add",
  checkUnavailableDate,
  upload_item,
  ListingController2.addListing
);
// router.put("/:id", ListingController.updateListing);
router.patch(
  "/users/:userId/update/:listingId",
  upload_item,
  ListingController2.updateListingById
);
router.delete(
  "/users/:userId/delete/:listingId",
  ListingController2.deleteListingById
);
router.patch("/:id", ListingController.updateStatus);

// New route for updating listing status and emitting notifications
router.patch("/:id/status", authenticateToken, updateListingStatus);

module.exports = router;

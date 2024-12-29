const express = require("express");
const router = express.Router();
const ListingController = require("../controllers/ListingController");
const ListingController2 = require("../controllers/listing/ListingController");
const { upload_item } = require("../config/multer");

/* * * * * * * * * displayed for all users :: available * * * * * * * * * * * * * */
// lahat ng available na listing (approved, with available date and corresponding time)
router.get("/available", ListingController2.getAllAvailable);
// isang listing na available (approved, with available date and corresponding time)
router.get("/available/:id", ListingController2.getAvailableListingById);
// lahat ng  listing available per user kapag nagvisit sa profile nila (approved, with available date and corresponding time)
router.get("/users/:userId", ListingController2.getAllListingsByUser); // get by query [item-for-sale/user?query=value]

// displayed for all admins
router.get("/info", ListingController.getAllListings);

// user crud
router.get("/:id", ListingController.getListingById);
router.post("/add", upload_item, ListingController2.addListing);
router.put("/:id", ListingController.updateListing);
router.delete("/users/:userId/delete/:listingId", ListingController2.deleteListingById);
router.patch("/:id", ListingController.updateStatus);

module.exports = router;

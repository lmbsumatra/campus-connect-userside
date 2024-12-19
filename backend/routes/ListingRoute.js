const express = require("express");
const router = express.Router();
const ListingController = require("../controllers/ListingController");
const {
  ItemForRentContoller,
} = require("../controllers/item-for-rent/ItemForRentController");

/* * * * * * * * * displayed for all users :: available * * * * * * * * * * * * * */
// lahat ng available na listing (approved, with available date and corresponding time)
router.get("/available", ItemForRentContoller.getAllAvailable);
// isang listing na available (approved, with available date and corresponding time)
router.get("/available/:id", ListingController.getAvailableListingById);
// lahat ng  listing available per user kapag nagvisit sa profile nila (approved, with available date and corresponding time)
router.get("/all/available/user", ListingController.getAvailableListingsByUser); // get by query [item-for-sale/user?query=value]

// displayed for all admins
router.get("/info", ListingController.getAllListings);

// user crud
router.get("/:id", ListingController.getListingById);
router.post("/add", ListingController.createListing);
router.put("/:id", ListingController.updateListing);
router.delete("/:id", ListingController.deleteListing);
router.patch("/:id", ListingController.updateStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const ListingController = require('../controllers/ListingController')

router.post('/add', ListingController.createListing);
router.get('/', ListingController.getAllApprovedListing);
router.get('/info', ListingController.getAllListings);
router.get('/:id', ListingController.getListingById);
router.put('/:id', ListingController.updateListing);
router.delete('/:id', ListingController.deleteListing);
router.patch('/:id', ListingController.updateStatus);

// get by query [listing?query=value]
router.get('/approved/user', ListingController.getApprovedListingsByUser);

module.exports = router;

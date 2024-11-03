const express = require('express');
const router = express.Router();
const rentalTransactionController = require('../controllers/RentalTransactionController');


router.post('/add', rentalTransactionController.createRentalTransaction);
router.get('/', rentalTransactionController.getAllRentalTransactions);
router.get('/:id', rentalTransactionController.getRentalTransactionById);
router.put('/:id', rentalTransactionController.updateRentalTransaction);
router.delete('/:id', rentalTransactionController.deleteRentalTransaction);
router.get('/user/:userId', rentalTransactionController.getTransactionsByUserId)

router.post('/user/:id/accept', rentalTransactionController.acceptRentalTransaction);
router.post('/user/:id/hand-over', rentalTransactionController.handOverRentalTransaction);
router.post('/user/:id/return', rentalTransactionController.returnRentalTransaction);
router.post('/user/:id/completed', rentalTransactionController.completeRentalTransaction);
router.post('/user/:id/cancel', rentalTransactionController.cancelRentalTransaction);
router.post('/user/:id/decline', rentalTransactionController.declineRentalTransaction);


module.exports = router;

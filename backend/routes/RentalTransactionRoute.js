const express = require('express');
const router = express.Router();
const rentalTransactionController = require('../controllers/RentalTransactionController');


router.post('/add', rentalTransactionController.createRentalTransaction);
router.get('/', rentalTransactionController.getAllRentalTransactions);
router.get('/:id', rentalTransactionController.getRentalTransactionById);
router.put('/:id', rentalTransactionController.updateRentalTransaction);
router.delete('/:id', rentalTransactionController.deleteRentalTransaction);

module.exports = router;

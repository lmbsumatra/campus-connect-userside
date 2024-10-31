const express = require('express');
const router = express.Router();
const ItemForSaleController = require('../controllers/ItemForSaleController')


router.post('/add', ItemForSaleController.createItemForSale);
router.get('/', ItemForSaleController.getAllApprovedItemForSale);
router.get('/info', ItemForSaleController.getAllItemForSale);
router.get('/:id', ItemForSaleController.getItemForSaleById);
router.put('/:id', ItemForSaleController.updateItemForSale);
router.delete('/:id', ItemForSaleController.deleteItemForSale);

module.exports = router;

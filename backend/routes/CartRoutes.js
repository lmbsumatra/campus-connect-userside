const express = require('express');
const router = express.Router();
const AddCartItemController = require('../controllers/cart/AddCartItemController')
const GetCartItemsController = require('../controllers/cart/GetCartItemsController')

router.get('/get', GetCartItemsController.getCartItems)
router.post('/add', AddCartItemController.addCartItem)

module.exports = router;
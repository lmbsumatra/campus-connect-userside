const addCartItem = require("./addCartItem");
const removeCartItem = require("./removeCartItem");
const getCartItems = require("./getCartItems");
const updateCartQuantity = require("./updateCartQuantity");

const ItemForSaleContoller = {
  addCartItem,
  removeCartItem,
  getCartItems,
  updateCartQuantity
};

module.exports = ItemForSaleContoller;

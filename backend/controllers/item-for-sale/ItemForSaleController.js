const getAllAvailable = require("./getAllAvailable");
const getAvailableItemForSaleById = require("./getAvailableItemForSaleById");
const addItemForSale = require("./addItemForSale.js");
const getAllItemForSaleByUser = require("./getAllItemForSaleByUser.js");
const deleteItemForSaleById = require("./deleteItemForSaleById");
const updateItemForSaleById = require("./updateItemForSaleById");
const getItemForSaleById = require("./getItemForSaleById");
const getAvailableItemsForSaleByUser = require("./getAvailableItemsForSaleByUser.js");

const ItemForSaleContoller = {
  getAllAvailable,
  getAvailableItemForSaleById,
  addItemForSale,
  getAllItemForSaleByUser,
  deleteItemForSaleById,
  updateItemForSaleById,
  getItemForSaleById,
  getAvailableItemsForSaleByUser,
};

module.exports = ItemForSaleContoller;

const getAllAvailable = require("./getAllAvailable");
const getAvailableItemForSaleById = require("./getAvailableItemForSaleById");
const addItemForSale = require("./addItemForSale.js");
const getAllItemForSaleByUser = require("./getAllItemForSaleByUser.js");
const deleteItemForSaleById = require("./deleteItemForSaleById");
const updateItemForSaleById = require("./updateItemForSaleById");
const getItemForSaleById = require("./getItemForSaleById");
const getAvailableItemsForSaleByUser = require("./getAvailableItemsForSaleByUser.js");
const updateItemForSaleStatus = require("./updateItemForSaleStatus.js");

const ItemForSaleContoller = {
  getAllAvailable,
  getAvailableItemForSaleById,
  addItemForSale,
  getAllItemForSaleByUser,
  deleteItemForSaleById,
  updateItemForSaleById,
  getItemForSaleById,
  getAvailableItemsForSaleByUser,
  updateItemForSaleStatus,
};

module.exports = ItemForSaleContoller;

const getAllAvailable = require("./getAllAvailable");
const getAvailableItemForSaleById = require("./getAvailableItemForSaleById");
const addItemForSale = require("./addItemForSale.js");
const getAllItemForSaleByUser = require("./getAllItemForSaleByUser.js");
const deleteItemForSaleById = require("./deleteItemForSaleById");
const updateItemForSaleById = require("./updateItemForSaleById");
const getItemForSaleById = require("./getItemForSaleById");
const getAvailableItemsForSaleByUser = require("./getAvailableItemsForSaleByUser.js");
const updateItemForSaleStatus = require("./updateItemForSaleStatus.js");
const adminItemForSaleById = require("./adminItemForSaleById.js");
const adminPostById = require("../post/adminPostById.js");

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
  adminPostById,
  adminItemForSaleById,
};

module.exports = ItemForSaleContoller;

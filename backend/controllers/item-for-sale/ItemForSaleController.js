const getAllAvailable = require("./getAllAvailable");
const getAvailableItemForSaleById = require("./getAvailableItemForSaleById");
const addItemForSale = require("./addItemForSale.js");
const getAllItemForSaleByUser = require("./getAllItemForSaleByUser.js");
const deleteItemForSaleById = require("./deleteItemForSaleById");

const ItemForSaleContoller = {
  getAllAvailable,
  getAvailableItemForSaleById,
  addItemForSale,
  getAllItemForSaleByUser,
  deleteItemForSaleById
};

module.exports = ItemForSaleContoller;

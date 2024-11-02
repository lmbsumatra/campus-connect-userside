const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");

const Listing = require("./listing/ListingModel")(sequelize);
const Post = require("./post/PostModel")(sequelize);
const RentalDate = require("./common/RentalDatesModel")(sequelize);
const RentalDuration = require("./common/RentalDurationsModel")(sequelize);
const Student = require("./StudentModel"); 
const User = require("./UserModel");
const ItemForSale = require('./item-for-sale/ItemForSaleModel')(sequelize)
const RentalTransaction = require('./RentalTransactionModel')(sequelize)


const models = {
  Listing,
  Post,
  Student,
  User,
  RentalDate, 
  RentalDuration,
  ItemForSale,
  RentalTransaction
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = { sequelize, models };

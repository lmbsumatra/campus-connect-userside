const { Sequelize } = require("sequelize"); 
const sequelize = require("../config/database");

const Listing = require("./listing/ListingModel")(sequelize);
const Post = require("./post/PostModel")(sequelize);
const Cart = require("./CartModel")(sequelize);
const Date = require("./common/DatesModel")(sequelize);
const Duration = require("./common/DurationsModel")(sequelize);
const Student = require("./StudentModel"); 
const User = require("./UserModel");
const ItemForSale = require('./item-for-sale/ItemForSaleModel')(sequelize);
const RentalTransaction = require('./RentalTransactionModel')(sequelize);
const Conversation = require('./ConversationModel');
const Message = require('./MessageModel');
const ReviewAndRate = require("./ReviewAndRateModel")(sequelize);
const UnavailableDate = require("./UnavailableDateModel");
const Report = require("./ReportModel");


const models = {
  Listing,
  Post,
  Cart,
  Student,
  User,
  Date, 
  Duration,
  ItemForSale,
  RentalTransaction,
  Conversation,
  Message,
  UnavailableDate,  
  Report,
  ReviewAndRate
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = { sequelize, models };

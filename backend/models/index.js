const { Sequelize } = require("sequelize");
const sequelize = require("../config/database");

const Listing = require("./ListingModel")(sequelize);
const Post = require("./PostModel")(sequelize);
const Cart = require("./CartModel")(sequelize);
const Date = require("./common/DatesModel")(sequelize);
const Duration = require("./common/DurationsModel")(sequelize);
const Student = require("./StudentModel");
const User = require("./UserModel");
const ItemForSale = require("./ItemForSaleModel")(sequelize);
const RentalTransaction = require("./RentalTransactionModel")(sequelize);
const Conversation = require("./ConversationModel");
const Message = require("./MessageModel");
const ReviewAndRate = require("./ReviewAndRateModel")(sequelize);
const UnavailableDate = require("./UnavailableDateModel");
const Report = require("./ReportModel");
const BuyAndSellTransaction = require("./BuyAndSellTransactionModel")(
  sequelize
);
const Notification = require("./NotificationModel");
const MessageNotification = require("./MessageNotificationModel");
const StudentNotification = require("./StudentNotificationModel");
const Follow = require("./FollowModel");
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
  BuyAndSellTransaction,
  ReviewAndRate,
  Notification,
  MessageNotification,
  StudentNotification,
  Follow,
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = { sequelize, models };

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Student = require("./StudentModel");
const User = require("./UserModel");
const Listing = require("./ListingModel")(sequelize);
const Post = require("./PostModel")(sequelize);
const ItemForSale = require("./ItemForSaleModel")(sequelize);

const StudentNotification = sequelize.define(
  "StudentNotification",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rental_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    transaction_report_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Listing,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Post,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ItemForSale,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "student_notifications",
    timestamps: true,
  }
);

// Define association with Listing if needed
StudentNotification.belongsTo(Listing, {
  foreignKey: "listing_id",
  as: "listing",
});

// Define association with Post
StudentNotification.belongsTo(Post, {
  foreignKey: "post_id",
  as: "post",
});

// Define association with ItemForSale
StudentNotification.belongsTo(ItemForSale, {
  foreignKey: "item_id",
  as: "item",
});

StudentNotification.belongsTo(User, {
  foreignKey: "sender_id",
  as: "sender",
});

module.exports = StudentNotification;

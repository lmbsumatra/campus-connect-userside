const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Message extends Model {}

Message.init(
  {
    conversationId: {
      type: DataTypes.STRING,
      allowNull: false, // Optional: prevents this field from being null
    },
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT, // Use TEXT if message content might be long
      allowNull: true,
    },
    isProductCard: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Default is false (not a product card)
    },
    productDetails: {
      type: DataTypes.JSON, // Use JSON for storing product details
      allowNull: true, // Allow null for non-product card messages
    },
    images: {
      type: DataTypes.JSON, // Store array of image URLs as JSON
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: "Message",
    // tableName: "messages",
    timestamps: true,
  }
);

module.exports = Message;


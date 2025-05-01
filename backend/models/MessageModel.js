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
      get() {
        // Ensure we always return an array
        const rawValue = this.getDataValue('images');
        if (!rawValue) return [];
        // Handle if stored as string (happens in some environments)
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return [];
          }
        }
        return rawValue;
      },
      set(value) {
        // Ensure we always store a valid array or null
        if (!value) {
          this.setDataValue('images', []);
        } else if (Array.isArray(value)) {
          this.setDataValue('images', value);
        } else {
          try {
            // If string is passed, try to parse it
            this.setDataValue('images', JSON.parse(value));
          } catch (e) {
            // If parsing fails, store as empty array
            this.setDataValue('images', []);
          }
        }
      }
    },
    offerStatus: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      allowNull: true,
      defaultValue: 'pending', // Default is pending for offer messages
    },
  },
  {
    sequelize,
    modelName: "Message",
    tableName: "messages",
    timestamps: true,
  }
);

module.exports = Message;


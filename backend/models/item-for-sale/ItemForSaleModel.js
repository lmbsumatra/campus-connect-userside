const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ItemForSale extends Model {}

  ItemForSale.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      seller_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      item_for_sale_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      delivery_mode: {
        type: DataTypes.ENUM("pickup", "delivery"),
        defaultValue: "pickup",
      },
      specifications: {
        type: DataTypes.JSON,
      },
      description: {
        type: DataTypes.TEXT,
      },
      item_condition: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      tags: {
        type: DataTypes.JSON,
      },
      status: {
        type: DataTypes.ENUM("available", "rented", "flagged", "pending"),
        allowNull: false,
      },
      payment_mode: {
        type: DataTypes.ENUM("payment upon meetup", "gcash"),
        allowNull: false,
      },
      images: {
        type: DataTypes.JSON,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "ItemForSale",
      tableName: "items_for_sale",
      timestamps: false,
    }
  );

  ItemForSale.associate = (models) => {
    ItemForSale.hasMany(models.RentalDate, {
        foreignKey: 'item_id',
        as: 'available_dates',
    });
    ItemForSale.belongsTo(models.User, {
        foreignKey: 'seller_id', 
        as: 'seller', 
    });
};

  return ItemForSale;
};
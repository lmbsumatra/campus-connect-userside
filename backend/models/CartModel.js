const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class Cart extends Model {}

  Cart.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onDelete: "CASCADE", // Cascading delete for user_id
      },
      owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "user_id",
        },
        onDelete: "CASCADE", // Cascading delete for owner_id
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      transaction_type: {
        type: DataTypes.ENUM("buy", "rent"),
        allowNull: false,
      },
      date: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "dates",
          key: "id",
        },
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "durations",
          key: "id",
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "purchased",
          "rented",
          "removed",
          "expired"
        ),
      },
    },
    { sequelize, modelName: "cart", 
      tableName: "cart", 
      timestamps: false }
  );

  Cart.associate = (models) => {
    Cart.belongsTo(models.User, {
      as: "user",
      foreignKey: "user_id",
      onDelete: "CASCADE", // Cascading delete for user association
    });

    Cart.belongsTo(models.User, {
      as: "owner",
      foreignKey: "owner_id",
      onDelete: "CASCADE", // Cascading delete for owner association
    });

    Cart.belongsTo(models.Listing, {
      as: "listing_item",
      foreignKey: "item_id",
      constraints: false,
      onDelete: "CASCADE",
    });

    Cart.belongsTo(models.ItemForSale, {
      as: "sale_item",
      foreignKey: "item_id",
      constraints: false,
      onDelete: "CASCADE",
    });

    // Change the alias for the `date` association to avoid collision
    Cart.belongsTo(models.Date, {
      as: "transaction_date", // Renamed to avoid collision
      foreignKey: "date", // Use the original attribute `date`
    });

    Cart.belongsTo(models.Duration, {
      as: "transaction_duration",
      foreignKey: "duration",
    });
  };

  return Cart;
};

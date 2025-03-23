const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Listing extends Model {}

  Listing.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      listing_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      delivery_mode: {
        type: DataTypes.ENUM("pickup", "meetup"),
        defaultValue: "pickup",
      },
      late_charges: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      security_deposit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      repair_replacement: {
        type: DataTypes.TEXT,
      },
      specifications: {
        type: DataTypes.JSON,
      },
      description: {
        type: DataTypes.TEXT,
      },
      listing_condition: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tags: {
        type: DataTypes.JSON,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "approved",
          "declined",
          "removed",
          "revoked",
          "flagged",
          "unavailable"
        ),
        allowNull: false,
      },
      payment_mode: {
        type: DataTypes.ENUM("payment upon meetup", "gcash"),
        allowNull: false,
      },
      images: {
        type: DataTypes.TEXT,
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
      modelName: "Listing",
      // tableName: "listings",
      timestamps: false,
    }
  );

  Listing.associate = (models) => {
    Listing.hasMany(models.Date, {
      foreignKey: "item_id",
      as: "rental_dates",
    });
    Listing.belongsTo(models.User, {
      foreignKey: "owner_id",
      as: "owner",
    });
  };

  return Listing;
};

const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class RentalTransaction extends Model {}
  RentalTransaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      renter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      rental_date_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rental_time_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "Requested",
          "Accepted",
          "Declined",
          "HandedOver",
          "Returned",
          "Completed",
          "Cancelled"
        ),
        allowNull: false,
        defaultValue: "Requested",
      },
      delivery_method: {
        type: DataTypes.ENUM("pickup", "meetup"),
        allowNull: false,
      },
      has_review_rating: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      payment_status: {
        type: DataTypes.ENUM("Pending", "Completed", "Refunded"),
        allowNull: false,
        defaultValue: "Pending",
      },
      owner_confirmed: {
        // New field for owner confirmation
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      renter_confirmed: {
        // New field for renter confirmation
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      payment_mode: {
        type: DataTypes.ENUM("payment upon meetup", "gcash"),
        allowNull: false,
        defaultValue: "payment upon meetup",
      },
      stripe_payment_intent_id: {
        type: DataTypes.STRING,
        allowNull: true, 
      },
      stripe_charge_id: {
        type: DataTypes.STRING,
        allowNull: true, 
      },
      is_allowed_to_proceed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
      
    },
    {
      sequelize,
      modelName: "RentalTransaction",
      tableName: "rental_transactions",
      timestamps: true,
    }
  );

  RentalTransaction.associate = (models) => {
    RentalTransaction.belongsTo(models.User, {
      as: "renter",
      foreignKey: "renter_id",
    });
    RentalTransaction.belongsTo(models.User, {
      as: "owner",
      foreignKey: "owner_id",
    });
    RentalTransaction.belongsTo(models.Listing, { foreignKey: "item_id" });
    RentalTransaction.belongsTo(models.Post, { foreignKey: "post_id" });
    RentalTransaction.belongsTo(models.Date, {
      foreignKey: "rental_date_id",
      // as: "rentalDate",
    });

    RentalTransaction.belongsTo(models.Duration, {
      foreignKey: "rental_time_id",
      // as: "rentalTime",
    });
  };

  return RentalTransaction;
};

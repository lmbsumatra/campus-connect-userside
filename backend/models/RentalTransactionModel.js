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
        allowNull: true,
      },
      buyer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      seller_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      date_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      time_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      },
      is_allowed_to_cancel: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      transaction_type: {
        type: DataTypes.ENUM("rental", "sell"),
        allowNull: false,
        defaultValue: "rental",
      },
      tnx_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      tnx_time_from: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      tnx_time_to: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      quantity: {
        type: DataTypes.NUMBER,
        allowNull: false,
      },
      handover_proof: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      return_proof: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sale_completion_proof: {
        type: DataTypes.STRING,
        allowNull: true,
      },
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
    RentalTransaction.belongsTo(models.User, {
      as: "buyer",
      foreignKey: "buyer_id",
    });
    RentalTransaction.belongsTo(models.User, {
      as: "seller",
      foreignKey: "seller_id",
    });
    RentalTransaction.belongsTo(models.ItemForSale, {
      foreignKey: "item_id",
    });
    RentalTransaction.belongsTo(models.Listing, { foreignKey: "item_id" });
    RentalTransaction.belongsTo(models.Post, { foreignKey: "post_id" });
    RentalTransaction.belongsTo(models.Date, {
      foreignKey: "date_id",
      // as: "rentalDate",
    });

    RentalTransaction.belongsTo(models.Duration, {
      foreignKey: "time_id",
      // as: "rentalTime",
    });
  };

  return RentalTransaction;
};

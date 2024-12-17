const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class BuyAndSellTransaction extends Model {}

  BuyAndSellTransaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      buyer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Foreign key references the 'users' table
          key: 'user_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      seller_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // Foreign key references the 'users' table
          key: 'user_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'items_for_sale', // Foreign key references the 'items' table
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'posts', // Foreign key references the 'posts' table
          key: 'post_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      status: {
        type: DataTypes.ENUM(
          'Requested',
          'Accepted',
          'Declined',
          'Cancelled',
          'HandOver',
          'Review'
        ),
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.ENUM('Pending', 'Completed', 'Refunded'),
        allowNull: false,
      },
      delivery_method: {
        type: DataTypes.ENUM('pickup', 'meetup'),
        allowNull: false,
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
      has_review_rating: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0, // 0 for false, 1 for true
      },
      seller_confirmed: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0, // 0 for false, 1 for true
      },
      buyer_confirmed: {
        type: DataTypes.TINYINT(1),
        defaultValue: 0, // 0 for false, 1 for true
      },
    },
    {
      sequelize,
      modelName: 'BuyAndSellTransaction',
      tableName: 'buy_and_sell_transactions',
      timestamps: false, // Use 'created_at' and 'updated_at' for timestamps
    }
  );

  // Associations (defining relationships between models)
  BuyAndSellTransaction.associate = (models) => {
    // A buy and sell transaction belongs to a buyer (User)
    BuyAndSellTransaction.belongsTo(models.User, {
      as: 'buyer', 
      foreignKey: 'buyer_id',
    });

    // A buy and sell transaction belongs to a seller (User)
    BuyAndSellTransaction.belongsTo(models.User, {
      as: 'seller', 
      foreignKey: 'seller_id',
    });

    // A buy and sell transaction belongs to an item (from ItemForSale)
    BuyAndSellTransaction.belongsTo(models.ItemForSale, {
      foreignKey: 'item_id',
    });

    // A buy and sell transaction may belong to a post (if applicable)
    BuyAndSellTransaction.belongsTo(models.Post, {
      foreignKey: 'post_id',
    });
  };

  return BuyAndSellTransaction;
};

const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ReviewAndRate extends Model {}

  ReviewAndRate.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      reviewer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User", // Name of the table the foreign key references (User table)
          key: "user_id", // The primary key of the referenced table
        },
        onDelete: "CASCADE", // Optional: What happens if the referenced record is deleted
        onUpdate: "CASCADE", // Optional: What happens if the referenced record is updated
      },
      reviewee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User", // The User table
          key: "user_id", // The primary key of the referenced User
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Listing", // The User table
          key: "id", // The primary key of the referenced User
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      review_type: {
        type: DataTypes.ENUM("item", "owner", "renter", "seller", "buyer"),
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
        references: {
          model: "RentalTransaction", // The table name for the RentalTransaction model
          key: "id", // Primary key of RentalTransactions table
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      rate: {
        type: DataTypes.INTEGER, // Rating from 1 to 5, for example
        validate: {
          min: 0, // Minimum value for rate
          max: 5, // Maximum value for rate
        },
        allowNull: false,
      },
      review: {
        type: DataTypes.TEXT, // Optional review text
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
      modelName: "ReviewAndRate",
      tableName: "review_and_rates", // Corrected table name
      timestamps: false, // If you're not using Sequelize's built-in timestamps
    }
  );

  ReviewAndRate.associate = (models) => {
    // A ReviewAndRate belongs to a reviewer (User)
    ReviewAndRate.belongsTo(models.User, {
      foreignKey: "reviewer_id",
      as: "reviewer", // Reviewer is the one leaving the review
    });

    // A ReviewAndRate belongs to a reviewee (User)
    ReviewAndRate.belongsTo(models.User, {
      foreignKey: "reviewee_id",
      as: "reviewee", // Reviewee is the one being reviewed
    });

    // If the review is related to a RentalTransaction, add this association:
    ReviewAndRate.belongsTo(models.RentalTransaction, {
      foreignKey: "transaction_id",
      as: "transaction",
    });
    ReviewAndRate.belongsTo(models.Listing, { foreignKey: "item_id" });
  };

  return ReviewAndRate;
};

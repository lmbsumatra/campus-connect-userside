const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize, models) => {
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
      },
      reviewee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      review_type: {
        type: DataTypes.ENUM("item", "owner", "renter", "seller", "buyer"),
        allowNull: false,
      },
      transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      rate: {
        type: DataTypes.INTEGER,
        validate: {
          min: 0,
          max: 5,
        },
        allowNull: false,
      },
      review: {
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
      modelName: "ReviewAndRate",
      tableName: "review_and_rates",
      timestamps: false,
    }
  );

  // Define associations correctly
  ReviewAndRate.associate = (models) => {
    ReviewAndRate.belongsTo(models.User, { foreignKey: "reviewer_id", as: "reviewer" });
    ReviewAndRate.belongsTo(models.User, { foreignKey: "reviewee_id", as: "reviewee" });
    ReviewAndRate.belongsTo(models.RentalTransaction, { foreignKey: "transaction_id", as: "transaction" });
    ReviewAndRate.belongsTo(models.Listing, { foreignKey: "item_id", as: "listing" });
  };

  return ReviewAndRate;
};

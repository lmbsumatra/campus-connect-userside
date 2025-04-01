const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Report extends Model {}

Report.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    reporter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    reported_entity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.ENUM("user", "listing", "post", "sale"),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "reviewed", "dismissed", "resolved"),
      defaultValue: "pending",
    },
    is_dispute: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Report",
    tableName: "reports",
    timestamps: true,
  }
);

// Associations
Report.associate = (models) => {
  Report.belongsTo(models.User, {
    foreignKey: "reporter_id",
    as: "reporter",
  });

  Report.belongsTo(models.RentalTransaction, {
    foreignKey: "reported_entity_id",
    as: "rentalTransaction",
    constraints: false, // Allows flexibility since not all reports are transactions
  });

  // Report.belongsTo(models.BuyAndSellTransaction, {
  //   foreignKey: "reported_entity_id",
  //   as: "buySellTransaction",
  //   constraints: false,
  // });

  Report.belongsTo(models.User, {
    foreignKey: "reported_entity_id",
    as: "reportedUser",
    constraints: false,
  });

  Report.belongsTo(models.Listing, {
    foreignKey: "reported_entity_id",
    as: "reportedListing",
    constraints: false,
  });

  Report.belongsTo(models.Post, {
    foreignKey: "reported_entity_id",
    as: "reportedPost",
    constraints: false,
  });
};

module.exports = Report;

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
      type: DataTypes.ENUM("pending", "reviewed", "flagged", "dismissed"),
      defaultValue: "pending",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {  
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Report",
    tableName: "reports", // Ensure this matches the table name in your database
    timestamps: true, // Enable automatic `createdAt` and `updatedAt` handling
  }
);

// Associations (if any)
Report.associate = (models) => {
  Report.belongsTo(models.User, {
    foreignKey: "reporter_id",
    targetKey: "user_id",  
    as: "reporter",
  });
};

module.exports = Report;

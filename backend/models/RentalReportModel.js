const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class RentalReport extends Model {}

RentalReport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rental_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "rental_transactions",
        key: "id",
      },
    },
    reporter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    reported_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "user_id" },
    },
    report_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    response_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    response_by_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    status: {
      type: DataTypes.ENUM("open", "under_review", "resolved"),
      defaultValue: "open",
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
    modelName: "RentalReport",
    tableName: "rental_reports",
    timestamps: true,
  }
);

RentalReport.associate = (models) => {
  RentalReport.belongsTo(models.RentalTransaction, {
    foreignKey: "rental_id",
    as: "rentalTransaction",
  });

  RentalReport.belongsTo(models.User, {
    foreignKey: "reporter_id",
    as: "reporter",
  });

  RentalReport.belongsTo(models.User, {
    foreignKey: "reported_id",
    as: "reported",
  });

  RentalReport.belongsTo(models.User, {
    foreignKey: "response_by_id",
    as: "responder",
  });

  RentalReport.hasMany(models.RentalEvidence, {
    foreignKey: "rental_report_id",
    as: "evidence",
  });
};

module.exports = RentalReport;

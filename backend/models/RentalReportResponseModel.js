// models/RentalReportResponse.js
const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class RentalReportResponse extends Model {}

RentalReportResponse.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rental_report_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "rental_reports", key: "id" },
      onDelete: "CASCADE",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "user_id" },
    },
    response_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // createdAt and updatedAt will be added automatically if timestamps: true
  },
  {
    sequelize,
    modelName: "RentalReportResponse",
    tableName: "rental_report_responses",
    timestamps: true,
  }
);

// Define associations (in an associate function or after model definition)
RentalReportResponse.associate = (models) => {
  // A response belongs to a RentalReport and a User (responder)
  RentalReportResponse.belongsTo(models.RentalReport, {
    foreignKey: "rental_report_id",
    as: "report",
  });
  RentalReportResponse.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
  // If evidence files are linked to responses, allow association to evidence
  RentalReportResponse.hasMany(models.RentalEvidence, {
    foreignKey: "rental_report_response_id",
    as: "evidence",
  });
};

module.exports = RentalReportResponse;

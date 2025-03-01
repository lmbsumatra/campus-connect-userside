const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class TransactionReportResponse extends Model {}

TransactionReportResponse.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    transaction_report_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "transaction_reports", key: "id" },
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
  },
  {
    sequelize,
    modelName: "TransactionReportResponse",
    tableName: "transaction_report_responses",
    timestamps: true,
  }
);

TransactionReportResponse.associate = (models) => {
  TransactionReportResponse.belongsTo(models.TransactionReport, {
    foreignKey: "transaction_report_id",
    as: "report",
  });

  TransactionReportResponse.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });

  TransactionReportResponse.hasMany(models.TransactionEvidence, {
    foreignKey: "transaction_report_response_id",
    as: "evidence",
  });
};

module.exports = TransactionReportResponse;

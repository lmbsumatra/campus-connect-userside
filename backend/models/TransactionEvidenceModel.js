const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class TransactionEvidence extends Model {}

TransactionEvidence.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    transaction_report_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "transaction_reports",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    transaction_report_response_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "transaction_report_responses",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    uploaded_by_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    file_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "TransactionEvidence",
    tableName: "transaction_report_evidences",
    timestamps: false,
  }
);

TransactionEvidence.associate = (models) => {
  TransactionEvidence.belongsTo(models.TransactionReport, {
    foreignKey: "transaction_report_id",
    as: "transactionReport",
    onDelete: "CASCADE",
  });

  TransactionEvidence.belongsTo(models.User, {
    foreignKey: "uploaded_by_id",
    as: "uploader",
  });
};

module.exports = TransactionEvidence;

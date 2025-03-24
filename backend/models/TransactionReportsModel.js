const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class TransactionReport extends Model {}

TransactionReport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    transaction_type: {
      type: DataTypes.ENUM("rental", "buy_sell"),
      allowNull: false,
    },
    rental_transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "rental_transactions",
        key: "id",
      },
    },
    buy_and_sell_transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "buy_and_sell_transactions",
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
      type: DataTypes.ENUM("open", "under_review", "resolved", "escalated"),
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
    modelName: "TransactionReport",
    tableName: "transaction_reports",
    timestamps: true,
  }
);

TransactionReport.associate = (models) => {
  TransactionReport.belongsTo(models.RentalTransaction, {
    foreignKey: "rental_transaction_id",
    as: "rentalTransaction",
  });

  // TransactionReport.belongsTo(models.BuyAndSellTransaction, {
  //   foreignKey: "buy_and_sell_transaction_id",
  //   as: "buySellTransaction",
  // });

  // Keep user associations the same
  TransactionReport.belongsTo(models.User, {
    foreignKey: "reporter_id",
    as: "reporter",
  });

  TransactionReport.belongsTo(models.User, {
    foreignKey: "reported_id",
    as: "reported",
  });

  TransactionReport.belongsTo(models.User, {
    foreignKey: "response_by_id",
    as: "responder",
  });

  TransactionReport.hasMany(models.TransactionEvidence, {
    foreignKey: "transaction_report_id",
    as: "evidence",
  });

  TransactionReport.hasMany(models.TransactionReportResponse, {
    foreignKey: "transaction_report_id",
    as: "responses",
  });
};

module.exports = TransactionReport;

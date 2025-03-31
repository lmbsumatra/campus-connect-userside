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
      type: DataTypes.ENUM("rental", "sell"),
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
    reporter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Table name
        key: "user_id",
      },
    },
    reported_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "user_id" }, // Table name
    },
    report_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "open",
        "under_review",
        "resolved",
        "escalated",

        //  Admin statuses
        "admin_review",
        "admin_resolved",
        "admin_dismissed"
      ),
      defaultValue: "open",
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
    resolved_by_admin_id: {
      // Which admin handled it
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    admin_resolution_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    admin_action_taken: {
      type: DataTypes.ENUM(
        "none",
        "warning_issued",
        "temp_ban_24h", // Restricted for 24 hrs
        "perm_ban"
      ),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "TransactionReport",
    tableName: "transaction_reports",
    timestamps: true,
  }
);

// Associations should include the new admin reference
TransactionReport.associate = (models) => {
  TransactionReport.belongsTo(models.RentalTransaction, {
    foreignKey: "rental_transaction_id",
    as: "rentalTransaction",
  });
  TransactionReport.belongsTo(models.User, {
    foreignKey: "reporter_id",
    as: "reporter",
  });
  TransactionReport.belongsTo(models.User, {
    foreignKey: "reported_id",
    as: "reported",
  });
  // Association for the admin who resolved the report
  TransactionReport.belongsTo(models.User, {
    foreignKey: "resolved_by_admin_id",
    as: "resolvedByAdmin", // Use this alias in includes
  });
  // Keep responder if needed for student responses
  // TransactionReport.belongsTo(models.User, {
  //   foreignKey: "response_by_id",
  //   as: "responder",
  // });
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

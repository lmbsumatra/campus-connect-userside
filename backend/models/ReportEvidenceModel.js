const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class ReportEvidence extends Model {}

ReportEvidence.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    report_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "reports",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    file_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_type: {
      type: DataTypes.ENUM("image", "video", "document"),
      allowNull: false,
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "ReportEvidence",
    tableName: "report_evidence",
    timestamps: false,
  }
);

// Associations
ReportEvidence.associate = (models) => {
  ReportEvidence.belongsTo(models.Report, {
    foreignKey: "report_id",
    as: "report",
  });

  ReportEvidence.belongsTo(models.User, {
    foreignKey: "uploaded_by",
    as: "uploader",
  });
};

module.exports = ReportEvidence;

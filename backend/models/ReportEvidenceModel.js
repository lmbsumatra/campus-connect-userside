const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class RentalEvidence extends Model {}

RentalEvidence.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rental_report_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "rental_reports",
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
    modelName: "RentalEvidence",
    tableName: "rental_report_evidences",
    timestamps: false,
  }
);

RentalEvidence.associate = (models) => {
  RentalEvidence.belongsTo(models.RentalReport, {
    foreignKey: "rental_report_id",
    as: "rentalReport",
    onDelete: "CASCADE",
  });

  RentalEvidence.belongsTo(models.User, {
    foreignKey: "uploaded_by_id",
    as: "uploader",
  });
};

module.exports = RentalEvidence;

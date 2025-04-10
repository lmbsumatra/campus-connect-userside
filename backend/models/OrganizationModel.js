const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Org = sequelize.define(
  "orgs",
  {
    org_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "org_categories",
        key: "id",
      },
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Org",
    tableName: "orgs",
    timestamps: false,
  }
);

Org.associate = (models) => {
  Org.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "representative",
  });

  Org.belongsTo(models.OrgCategory, {
    foreignKey: "category_id",
    as: "category",
  });
};

module.exports = Org;

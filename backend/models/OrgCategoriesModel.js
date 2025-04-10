const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrgCategory = sequelize.define(
  "org_categories",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "org_categories",
    timestamps: false,
  }
);


module.exports = OrgCategory;

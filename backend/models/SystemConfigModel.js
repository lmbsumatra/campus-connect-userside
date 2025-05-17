const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SystemConfig = sequelize.define(
  "SystemConfig",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    config: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    config_value: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "false",
    },
    config_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "boolean",
    },
  },
  {
    sequelize,
    tableName: "system_config",
    timestamps: true,
    underscored: true,
  }
);

module.exports = SystemConfig;

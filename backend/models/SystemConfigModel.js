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
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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

const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class BlockedUser extends Model {}

BlockedUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    blocker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    blocked_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "BlockedUser",
    // tableName: "blocked_users",
    timestamps: false,
  }
);

module.exports = BlockedUser; 
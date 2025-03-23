const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./UserModel");

class Admin extends Model {}
Admin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    profile_pic: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.STRING, // Store the refresh token here
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Admin",
    // tableName: "admins",
  }
);

// Establishing relationship
Admin.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = Admin;

const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./UserModel");

const Follow = sequelize.define(
  "follows",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    follower_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    followee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
  },
  {
    sequelize,
    modelName: "Follow",
    // tableName: "follows",
    timestamps: true,
  }
);

Follow.associate = (models) => {
  Follow.belongsTo(models.User, {
    foreignKey: "follower_id",
    as: "follower",
  });
  Follow.belongsTo(models.User, {
    foreignKey: "followee_id",
    as: "followee",
  });
};

module.exports = Follow;

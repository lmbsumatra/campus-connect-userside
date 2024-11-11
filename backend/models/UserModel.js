const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "users",
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    middle_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "student", "superadmin"),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  { sequelize, modelName: "User", tableName: "users" }
);

User.associate = (models) => {
  User.hasMany(models.Listing, {
    foreignKey: "owner_id",
    as: "listings",
  });

  User.hasOne(models.Student, {
    foreignKey: "user_id",
    as: "student",
  });

  // Ensure that the 'user_id' exists in the Conversation model
  User.hasMany(models.Conversation, {
    foreignKey: "user_id",
    as: "conversations",
  });
};

module.exports = User;

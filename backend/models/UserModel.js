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
    // New columns for email verification
    verification_token: {
      type: DataTypes.STRING(255),
      allowNull: true, // The token will be generated upon registration
    },
    verification_token_expiration: {
      type: DataTypes.DATE,
      allowNull: true, // Set to null initially and later updated
    },
    // New columns for email verification
    reset_password_token: {
      type: DataTypes.STRING(255),
      allowNull: true, // The token will be generated upon registration
    },
    reset_password_token_expiration: {
      type: DataTypes.DATE,
      allowNull: true, // Set to null initially and later updated
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Default to false, will be updated upon email verification
    },
    stripe_acct_id: {
      type: DataTypes.STRING(255),
      allowNull: true, // Allow null initially, update when Stripe account is linked
    },
    is_stripe_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    lastlogin: {
      type: DataTypes.DATE,
      allowNull: true, // Allow null initially
    },
  },
  { sequelize, modelName: "User", 
    tableName: "users" 
  }
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

  User.hasMany(models.Conversation, {
    foreignKey: "user_id",
    as: "conversations",
  });

  User.hasMany(models.Follow, {
    foreignKey: "follower_id",
    as: "follower",
  });

  User.hasMany(models.Follow, {
    foreignKey: "followee_id",
    as: "followee",
  });
  User.hasMany(models.AuditLog, {
    foreignKey: "admin_id",
    as: "logs",
  });
  User.hasOne(models.Org, {
    foreignKey: "user_id",
    as: "org",
  });

  
};

module.exports = User;

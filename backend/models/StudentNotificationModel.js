const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Listing = require("./ListingModel")(sequelize); // Ensure Listing model is properly imported

const StudentNotification = sequelize.define(
  "StudentNotification",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rental_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Listing,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "student_notifications",
    timestamps: true,
  }
);

// Define association with Listing
StudentNotification.belongsTo(Listing, {
  foreignKey: "listing_id",
  as: "listing",
});

module.exports = StudentNotification;

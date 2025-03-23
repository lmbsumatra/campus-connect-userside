const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Listing = require("./ListingModel")(sequelize);
const Post = require("./PostModel")(sequelize);

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
    transaction_report_id: {
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
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Post, // Make sure Post is properly imported/defined
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    // tableName: "student_notifications",
    timestamps: true,
  }
);

// Define association with Listing if needed
StudentNotification.belongsTo(Listing, {
  foreignKey: "listing_id",
  as: "listing",
});

// Define association with Post
StudentNotification.belongsTo(Post, {
  foreignKey: "post_id",
  as: "post",
});

module.exports = StudentNotification;

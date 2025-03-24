const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class Notification extends Model {}

  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ownerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      itemId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      itemType: {
        type: DataTypes.STRING,
        allowNull: true, // listing, item-for-sale, post
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Notification",
      tableName: "notifications", // Make sure the actual table in DB is lowercase
      timestamps: false, // Unless you're using createdAt/updatedAt
    }
  );

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: "ownerId",
      as: "owner",
      onDelete: "CASCADE",
    });

    // You can also link itemId to different models if needed,
    // but Sequelize doesn’t support polymorphic associations natively.
  };

  return Notification;
};

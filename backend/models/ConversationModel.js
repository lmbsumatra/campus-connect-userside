const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class Conversation extends Model {}

  Conversation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      members: {
        type: DataTypes.JSON, // Array of user IDs
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Conversation",
      tableName: "conversations",
      timestamps: true,
      freezeTableName: true,
    }
  );

  Conversation.associate = (models) => {
    Conversation.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return Conversation;
};

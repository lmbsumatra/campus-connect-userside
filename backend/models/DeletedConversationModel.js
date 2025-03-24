const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class DeletedConversation extends Model {}

DeletedConversation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "conversations",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    deleted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "DeletedConversation",
    tableName: "deleted_conversations",
    timestamps: false,
  }
);

module.exports = DeletedConversation; 
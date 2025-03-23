const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./UserModel");


class Conversation extends Model {}

Conversation.init(
  {
    members: {
      type: DataTypes.JSON, // JSON field to store an array of user IDs
      allowNull: false,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "Conversation",
    // tableName: "conversations",
    timestamps: true,
    
  }
);

Conversation.belongsTo(User, { foreignKey: "user_id", as: "conversations" });



module.exports = Conversation;

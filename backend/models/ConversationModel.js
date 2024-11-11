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
  },
  {
    sequelize,
    modelName: "Conversation",
    timestamps: true,
    
  }
);

Conversation.belongsTo(User, { foreignKey: "user_id", as: "conversations" });



module.exports = Conversation;



// const mongoose = require("mongoose");

// class ConversationSchema =new mongoose.Schema(
//     {
//         members: {
//          type: Array,
//         },
//       },
//       { timestamps: true }
    
// )

  

// module.exports = mongoose.model("Conversation", ConversationSchema);
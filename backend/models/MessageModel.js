const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Message extends Model {}

Message.init(
  {
    conversationId: {
      type: DataTypes.STRING,
      allowNull: false, // Optional: prevents this field from being null
    },
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT, // Use TEXT if message content might be long
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Message",
    timestamps: true,
  }
);

module.exports = Message;



// const mongoose = require("mongoose");

// class MessageSchema =new mongoose.Schema(
//     {
//         conversationId: {
//          type: String,
//         },
//         sender: {
//          type: String,
//         },
//         text: {
//          type: String,
//         },
//       },
//       { timestamps: true }
    
// )

  

// module.exports = mongoose.model("MessageSchema", ConversationSchema);
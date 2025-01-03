const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class MessageNotification extends Model {}

MessageNotification.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  recipient_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'MessageNotification',
  tableName: 'messages_notif',
  timestamps: true
});

MessageNotification.sync()
  .then(() => {
    console.log('MessageNotification model synced successfully');
  })
  .catch(error => {
    console.error('Error syncing MessageNotification model:', error);
  });

module.exports = MessageNotification;
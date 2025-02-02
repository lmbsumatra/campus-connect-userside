const { DataTypes} = require("sequelize");
const sequelize = require("../config/database");

const StudentNotification = sequelize.define('StudentNotification', {
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
  // For example: 'rental_request', 'rental_confirmation', 'sale_offer', 'post_offer'
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
}, {
  tableName: 'student_notifications',
  timestamps: true,
});

module.exports = StudentNotification;

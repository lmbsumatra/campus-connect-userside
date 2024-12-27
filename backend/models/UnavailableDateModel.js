const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');  // Make sure this is correctly required

// Define the UnavailableDate model
class UnavailableDate extends Sequelize.Model {}
UnavailableDate.init(
  {
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'UnavailableDate',
    tableName: 'unavailable_dates',  // Ensure it matches your table name
    timestamps: true
  }
);

module.exports = UnavailableDate;

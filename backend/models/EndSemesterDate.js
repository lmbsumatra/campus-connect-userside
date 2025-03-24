// backend/models/EndSemesterDate.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const EndSemesterDate = sequelize.define("EndSemesterDate", {
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: "end_semester_dates",
  timestamps: true,
});

module.exports = EndSemesterDate;

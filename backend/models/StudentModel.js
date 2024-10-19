const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./UserModel");

class Student extends Model {}
Student.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tup_id: {
      type: DataTypes.STRING(15),
      unique: true,
      allowNull: false,
    },
    college: {
      type: DataTypes.ENUM("CIT", "CAFA", "COS"),
      allowNull: false,
    },
    scanned_id: {
      type: DataTypes.BLOB,
      allowNull: false,
    },
    photo_with_id: {
      type: DataTypes.BLOB,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Student",
  }
);

// Establishing relationship
Student.belongsTo(User, { foreignKey: "user_id" });

module.exports = Student;

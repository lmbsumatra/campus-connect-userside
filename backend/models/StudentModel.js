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
    user_id: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', 
        key: 'user_id',
      },
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

Student.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = Student;
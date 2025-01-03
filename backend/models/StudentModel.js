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
      type: DataTypes.ENUM("CAFA","CIE","CIT","CLA","COE","COS"),
      allowNull: false,
    },
    scanned_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    photo_with_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // status: {
    //   type: DataTypes.ENUM("pending", "verified"),
    //   defaultValue: "pending", // Default status is 'pending'
    //   allowNull: false,
    // },
  },
  {
    sequelize,
    modelName: "Student",
    tableName: "students"
  }
);

Student.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = Student;

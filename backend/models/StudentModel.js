const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./UserModel");

class Student extends Model {
  isRestricted() {
    return (
      this.status === "restricted" &&
      this.restricted_until &&
      new Date(this.restricted_until) > new Date()
    );
  }

  /**
   * Checks if this student's restriction has expired and updates status if needed
   * @returns {boolean} True if restriction was expired and status was updated
   */
  async checkAndUpdateRestriction() {
    if (this.status === "restricted" && this.restricted_until) {
      const now = new Date();
      if (new Date(this.restricted_until) <= now) {
        await this.update({
          status: "verified",
          status_message: `Restriction expired on ${now.toLocaleDateString()}. Account automatically reactivated.`,
          restricted_until: null,
        });
        return true;
      }
    }
    return false;
  }
}

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
        model: "users",
        key: "user_id",
      },
    },
    tup_id: {
      type: DataTypes.STRING(15),
      unique: true,
      allowNull: false,
    },
    college: {
      type: DataTypes.ENUM("CAFA", "CIE", "CIT", "CLA", "COE", "COS"),
      allowNull: false,
    },
    course: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    scanned_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    photo_with_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    profile_pic: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "verified",
        "flagged",
        "banned",
        "restricted"
      ),
      defaultValue: "pending",
      allowNull: false,
    },
    status_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    restricted_until: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Timestamp until which the user is temporarily restricted.",
    },
  },
  {
    sequelize,
    modelName: "Student",
    tableName: "students",
    timestamps: true,
  }
);

Student.belongsTo(User, { foreignKey: "user_id", as: "user" });

module.exports = Student;

const Student = require("../../models/StudentModel");
const User = require("../../models/UserModel");

const getStudentDataById = async (req, res) => {
    const userId = req.params.id;
    try {
      const student = await Student.findOne({ where: { user_id: userId } });
      if (!student) {
        return res.status(404).json({ message: "Student record not found" });
      }
  
      const user = await User.findByPk(student.user_id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({
        user: {
          fname: user.first_name,
          mname: user.middle_name,
          lname: user.last_name,
          role: user.role,
        },
        student: {
          id: student.tup_id,
          college: student.college,
          scannedId: student.scanned_id,
          photoWithId: student.photo_with_id,
        },
      });
    } catch (error) {
      console.error("Error retrieving user information:", error);
      res.status(500).json({
        message: "Error retrieving user information",
        error: error.message,
      });
    }
  };

  module.exports = getStudentDataById;
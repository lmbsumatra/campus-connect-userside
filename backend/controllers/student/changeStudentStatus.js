const { models } = require("../../models");

const changeStudentStatus = async (req, res) => {
    console.log("Change student status route hit"); // Add this line
    const { studentId, status } = req.body;
  
    try {
      const student = await models.Student.findByPk(studentId);
      if (!student) {
        console.log("Student not found"); // Add this line
        return res.status(404).json({ message: "Student not found." });
      }
  
      student.status = status;
      await student.save();
  
      console.log("Student status updated successfully"); // Add this line
      return res.status(200).json({ message: "Student status updated successfully." });
    } catch (error) {
      console.error("Error updating student status:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };
  
module.exports = changeStudentStatus;

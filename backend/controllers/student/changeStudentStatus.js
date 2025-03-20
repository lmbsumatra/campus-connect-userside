const { models } = require("../../models");

const changeStudentStatus = async (req, res) => {
  const { studentId, status, statusMessage } = req.body;

  try {
    const student = await models.Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    student.status = status;
    student.status_message = statusMessage; // Save the status message
    await student.save();

    return res.status(200).json({
      message: "Student status updated successfully.",
      status: status,
      statusMessage: statusMessage,
    });
  } catch (error) {
    console.error("Error updating student status:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = changeStudentStatus;

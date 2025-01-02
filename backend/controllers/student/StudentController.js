const getStudentDataById = require("./getStudentDataById.js");
const registerStudent = require("./registerStudent");
const verifyStudent = require("./verifyStudent.js");

const StudentController = {
  getStudentDataById,
  registerStudent,
  verifyStudent,
};

module.exports = StudentController;

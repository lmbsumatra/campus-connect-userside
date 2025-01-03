const getStudentDataById = require("./getStudentDataById.js");
const registerStudent = require("./registerStudent");
const verifyStudent = require("./verifyStudent.js");
const loginStudent = require("./loginStudent");

const StudentController = {
  getStudentDataById,
  registerStudent,
  verifyStudent,
  loginStudent,
};

module.exports = StudentController;

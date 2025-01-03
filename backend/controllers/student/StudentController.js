const getStudentDataById = require("./getStudentDataById.js");
const registerStudent = require("./registerStudent");
const verifyStudent = require("./verifyStudent.js");
const loginStudent = require("./loginStudent");
const resendVerificationEmail = require("./resendVerificationEmail")

const StudentController = {
  getStudentDataById,
  registerStudent,
  verifyStudent,
  loginStudent,
  resendVerificationEmail,
};

module.exports = StudentController;

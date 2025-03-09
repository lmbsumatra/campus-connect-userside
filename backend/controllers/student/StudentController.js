const getStudentDataById = require("./getStudentDataById.js");
const registerStudent = require("./registerStudent");
const verifyStudent = require("./verifyStudent.js");
const loginStudent = require("./loginStudent");
const resendVerificationEmail = require("./resendVerificationEmail");
const uploadProfileImage = require("./uploadProfileImage");
const googleLogin = require("./googleLoginStudent.js");
const getUsers = require("./getUsers.js");
const getOtherStudentDataById = require("./getOtherStudentDataById");
const getStudentDataForAdmin = require("./getStudentDataForAdmin.js");
const changeStudentStatus = require("./changeStudentStatus.js")

const StudentController = {
  getStudentDataById,
  registerStudent,
  verifyStudent,
  loginStudent,
  resendVerificationEmail,
  uploadProfileImage,
  googleLogin,
  getUsers,
  getOtherStudentDataById,
  getStudentDataForAdmin,
  changeStudentStatus
};

module.exports = StudentController;

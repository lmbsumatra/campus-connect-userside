const getStudentDataById = require("./getStudentDataById.js");
const registerStudent = require("./registerStudent");
const verifyStudent = require("./verifyStudent.js");
const loginStudent = require("./loginStudent");
const resendVerificationEmail = require("./resendVerificationEmail");
const createStripeOnBoardingLink = require("./createStripeOnBoardingLink");
const getMerchantDetails = require("./getMerchantDetails.js");
const uploadProfileImage = require("./uploadProfileImage");
const googleLogin = require("./googleLoginStudent.js");
const getUsers = require("./getUsers.js")

const StudentController = {
  getStudentDataById,
  registerStudent,
  verifyStudent,
  loginStudent,
  resendVerificationEmail,
  createStripeOnBoardingLink,
  getMerchantDetails,
  uploadProfileImage,
  googleLogin,
  getUsers,
};

module.exports = StudentController;

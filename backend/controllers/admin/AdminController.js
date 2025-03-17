const addEndSemesterDate = require("./addEndSemesterDates");
const addUnavailableDate = require("./addUnavailableDates");
const adminChangePassword = require("./adminChangePassword");
const deleteEndSemesterDate = require("./deleteEndSemesterDates");
const deleteUnavailableDate = require("./deleteUnavailableDates");
const getAllAdminAccounts = require("./getAllAdminAccounts");
const getAllEndSemesterDate = require("./getAllEndSemesterDates");
const getAuditLogs = require("./getAuditLogs");
const getAllUnavailableDate = require("./getUnavailableDates");
const loginAdmin = require("./loginAdmin");
const registerAdmin = require("./registerAdmin");
const refreshAdminToken = require("./refreshAdminToken");
const allUnavailableDates = require("./allUnavailableDates");
const logAdminLogout = require("./logAdminLogout");

const AdminController = {
  addEndSemesterDate,
  addUnavailableDate,
  adminChangePassword,
  deleteEndSemesterDate,
  deleteUnavailableDate,
  getAllAdminAccounts,
  getAllEndSemesterDate,
  getAuditLogs,
  getAllUnavailableDate,
  loginAdmin,
  registerAdmin,
  refreshAdminToken,
  allUnavailableDates,
  logAdminLogout,
};

module.exports = AdminController;

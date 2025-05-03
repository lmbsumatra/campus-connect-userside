const createTransactionReport = require("./createTransactionReport");
const addResponse = require("./addResponse");
const getAllTransactionReports = require("./getAllTransactionReports");
const getEscalatedTransactionReports = require("./getEscalatedTransactionReports");
const getTransactionReportById = require("./getTransactionReportById");
const getTransactionReportsByUser = require("./getTransactionReportsByUser");
const markReportResolved = require("./markReportResolved");
const escalateReport = require("./escalateReport");
const updateEscalatedReportStatusByAdmin = require("./updateEscalatedReportStatusByAdmin");

module.exports = ({ emitNotification }) => ({
  createTransactionReport: createTransactionReport({ emitNotification }),
  addResponse: addResponse({ emitNotification }),
  getAllTransactionReports: getAllTransactionReports(),
  getEscalatedTransactionReports: getEscalatedTransactionReports(),
  getTransactionReportById: getTransactionReportById(),
  getTransactionReportsByUser: getTransactionReportsByUser(),
  markReportResolved: markReportResolved({ emitNotification }),
  escalateReport: escalateReport({ emitNotification }),
  updateEscalatedReportStatusByAdmin: updateEscalatedReportStatusByAdmin({
    emitNotification,
  }),
});

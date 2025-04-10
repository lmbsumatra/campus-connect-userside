const createOrg = require("./createOrg");
const getAllOrgs = require("./getAllOrgs");
const setOrgRepresentative = require("./setOrgRepresentative");
const updateOrgStatus = require("./updateOrgStatus");

const OrgsController = {
  createOrg,
  getAllOrgs,
  updateOrgStatus,
  setOrgRepresentative,
};

module.exports = OrgsController;

const createOrg = require("./createOrg");
const deleteOrg = require("./deleteOrg");
const editOrg = require("./editOrg");
const getAllOrgs = require("./getAllOrgs");
const setOrgRepresentative = require("./setOrgRepresentative");
const updateOrgStatus = require("./updateOrgStatus");

const OrgsController = {
  createOrg,
  editOrg,
  getAllOrgs,
  updateOrgStatus,
  setOrgRepresentative,
  deleteOrg,
};

module.exports = OrgsController;

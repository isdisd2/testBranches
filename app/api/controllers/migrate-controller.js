"use strict";
const MigrateAbl = require("../../abl/migrate-abl.js");

class MigrateController {
  migrate(ucEnv) {
    return MigrateAbl.migrate(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  updateIndexes(ucEnv) {
    return MigrateAbl.updateIndexes(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  dropAwid(ucEnv) {
    return MigrateAbl.dropAwid(ucEnv);
  }

  deleteAwsc(ucEnv) {
    return MigrateAbl.deleteAwsc(ucEnv);
  }
}

module.exports = new MigrateController();

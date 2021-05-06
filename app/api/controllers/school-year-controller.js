"use strict";
const SchoolYearAbl = require("../../abl/school-year-abl.js");

class SchoolYearController {
  create(ucEnv) {
    return SchoolYearAbl.create(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
  get(ucEnv) {
    return SchoolYearAbl.get(ucEnv.getUri(), ucEnv.getDtoIn());
  }
  load(ucEnv) {
    return SchoolYearAbl.load(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
  list(ucEnv) {
    return SchoolYearAbl.list(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }
  update(ucEnv) {
    return SchoolYearAbl.update(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
  setState(ucEnv) {
    return SchoolYearAbl.setState(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
  setFinalState(ucEnv) {
    return SchoolYearAbl.setFinalState(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
  delete(ucEnv) {
    return SchoolYearAbl.delete(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
}

module.exports = new SchoolYearController();

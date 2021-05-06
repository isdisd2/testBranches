"use strict";
const TeacherAbl = require("../../abl/teacher-abl.js");

class TeacherController {
  create(ucEnv) {
    return TeacherAbl.create(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
  get(ucEnv) {
    return TeacherAbl.get(ucEnv.getUri(), ucEnv.getDtoIn());
  }
  load(ucEnv) {
    return TeacherAbl.load(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }
  update(ucEnv) {
    return TeacherAbl.update(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
  setState(ucEnv) {
    return TeacherAbl.setState(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
  setFinalState(ucEnv) {
    return TeacherAbl.setFinalState(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
  list(ucEnv) {
    return TeacherAbl.list(
      ucEnv.getUri().getAwid(),
      ucEnv.getDtoIn(),
      ucEnv.getSession(),
      ucEnv.getAuthorizationResult().getIdentityProfiles()
    );
  }
}

module.exports = new TeacherController();

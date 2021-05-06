"use strict";
const ClassAbl = require("../../abl/class-abl.js");

class ClassController {
  updateNumberInClass(ucEnv) {
    return ClassAbl.updateNumberInClass(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getSession(),
      ucEnv.getAuthorizationResult().getIdentityProfiles()
    );
  }
  create(ucEnv) {
    return ClassAbl.create(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  get(ucEnv) {
    return ClassAbl.get(ucEnv.getUri(), ucEnv.getDtoIn());
  }

  load(ucEnv) {
    return ClassAbl.load(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getSession(),
      ucEnv.getAuthorizationResult().getIdentityProfiles()
    );
  }

  listBySchoolYear(ucEnv) {
    return ClassAbl.listBySchoolYear(ucEnv.getUri(), ucEnv.getDtoIn());
  }

  listByTeacher(ucEnv) {
    return ClassAbl.listByTeacher(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  update(ucEnv) {
    return ClassAbl.update(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  updateByClassTeacher(ucEnv) {
    return ClassAbl.updateByClassTeacher(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  addStudents(ucEnv) {
    return ClassAbl.addStudents(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  removeStudent(ucEnv) {
    return ClassAbl.removeStudent(ucEnv.getUri(), ucEnv.getDtoIn());
  }

  listByStudent(ucEnv) {
    return ClassAbl.listByStudent(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  setState(ucEnv) {
    return ClassAbl.setState(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  setFinalState(ucEnv) {
    return ClassAbl.setFinalState(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  delete(ucEnv) {
    return ClassAbl.delete(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
}

module.exports = new ClassController();

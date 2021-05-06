"use strict";
const SubjectAbl = require("../../abl/subject-abl.js");

class SubjectController {

  removeStudentCourse(ucEnv) {
    return SubjectAbl.removeStudentCourse(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  removeCourse(ucEnv) {
    return SubjectAbl.removeCourse(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  addCourse(ucEnv) {
    return SubjectAbl.addCourse(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  addStudentCourse(ucEnv) {
    return SubjectAbl.addStudentCourse(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  setFinalState(ucEnv) {
    return SubjectAbl.setFinalState(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  setState(ucEnv) {
    return SubjectAbl.setState(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  listByTeacher(ucEnv) {
    return SubjectAbl.listByTeacher(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  listByClass(ucEnv) {
    return SubjectAbl.listByClass(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  listByStudent(ucEnv) {
    return SubjectAbl.listByStudent(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  get(ucEnv) {
    return SubjectAbl.get(ucEnv.getUri(), ucEnv.getDtoIn());
  }

  load(ucEnv) {
    return SubjectAbl.load(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getSession(),
      ucEnv.getAuthorizationResult().getIdentityProfiles()
    );
  }

  delete(ucEnv) {
    return SubjectAbl.delete(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  update(ucEnv) {
    return SubjectAbl.update(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  updateBySubjectTeacher(ucEnv) {
    return SubjectAbl.updateBySubjectTeacher(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  addStudents(ucEnv) {
    return SubjectAbl.addStudents(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getAuthorizationResult(), ucEnv.getSession());
  }

  removeStudent(ucEnv) {
    return SubjectAbl.removeStudent(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult(),
      ucEnv.getSession()
    );
  }

  create(ucEnv) {
    return SubjectAbl.create(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
}

module.exports = new SubjectController();

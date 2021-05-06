"use strict";
const StudentAbl = require("../../abl/student-abl.js");

class StudentController {
  create(ucEnv) {
    return StudentAbl.create(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  load(ucEnv) {
    return StudentAbl.load(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getAuthorizationResult(), ucEnv.getSession());
  }

  update(ucEnv) {
    return StudentAbl.update(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  updateByRelatedPerson(ucEnv) {
    return StudentAbl.updateByRelatedPerson(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  setEvaluation(ucEnv) {
    return StudentAbl.setEvaluation(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  setNickname(ucEnv) {
    return StudentAbl.setNickname(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getAuthorizationResult(), ucEnv.getSession());
  }

  get(ucEnv) {
    return StudentAbl.get(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  setState(ucEnv) {
    return StudentAbl.setState(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  setFinalState(ucEnv) {
    return StudentAbl.setFinalState(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  list(ucEnv) {
    return StudentAbl.list(
      ucEnv.getUri().getAwid(),
      ucEnv.getDtoIn(),
      ucEnv.getSession(),
      ucEnv.getAuthorizationResult().getIdentityProfiles()
    );
  }

  listByRelatedPerson(ucEnv) {
    return StudentAbl.listByRelatedPerson(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  addRelatedPersons(ucEnv) {
    return StudentAbl.addRelatedPersons(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult(),
      ucEnv.getSession()
    );
  }

  removeRelatedPerson(ucEnv) {
    return StudentAbl.removeRelatedPerson(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult(),
      ucEnv.getSession()
    );
  }

  updateNote(ucEnv) {
    return StudentAbl.updateNote(
      ucEnv.getUri().getAwid(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult(),
      ucEnv.getSession()
    );
  }

  updateRelationType(ucEnv) {
    return StudentAbl.updateRelationType(
      ucEnv.getUri().getAwid(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult(),
      ucEnv.getSession()
    );
  }

  setRelatedPerson(ucEnv) {
    return StudentAbl.setRelatedPerson(
      ucEnv.getUri().getAwid(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult(),
      ucEnv.getSession()
    );
  }
}

module.exports = new StudentController();

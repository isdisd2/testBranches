"use strict";
const {
  CreateAbl,
  LoadAbl,
  GetAbl,
  ListAbl,
  UpdateAbl,
  SetFinalStateAbl,
  SetStateAbl,
  AddStudentsAbl,
  RemoveStudentAbl,
  AddTaskAbl,
  UpdateTaskAbl,
  RemoveTaskAbl,
  GetLogsAbl,
} = require("../../abl/assignment/");

class AssignmentController {
  getLogs(ucEnv) {
    return GetLogsAbl.getLogs(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
  addTask(ucEnv) {
    return AddTaskAbl.addTask(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  updateTask(ucEnv) {
    return UpdateTaskAbl.updateTask(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  removeTask(ucEnv) {
    return RemoveTaskAbl.removeTask(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles()
    );
  }

  create(ucEnv) {
    return CreateAbl.create(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  load(ucEnv) {
    return LoadAbl.load(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  get(ucEnv) {
    return GetAbl.get(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  list(ucEnv) {
    return ListAbl.list(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  update(ucEnv) {
    return UpdateAbl.update(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  setFinalState(ucEnv) {
    return SetFinalStateAbl.setFinalState(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  setState(ucEnv) {
    return SetStateAbl.setState(
      ucEnv.getUri(),
      ucEnv.getDtoIn(),
      ucEnv.getAuthorizationResult().getIdentityProfiles(),
      ucEnv.getSession()
    );
  }

  addStudents(ucEnv) {
    return AddStudentsAbl.addStudents(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  removeStudent(ucEnv) {
    return RemoveStudentAbl.removeStudent(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }
}

module.exports = new AssignmentController();

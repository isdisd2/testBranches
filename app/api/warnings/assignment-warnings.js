"use strict";

const Errors = require("../errors/assignment-error");

const Warnings = {
  createAssignmenUnsupportedKeys: {
    code: `${Errors.Create.UC_CODE}unsupportedKeys`,
  },
  createFailedToDeleteAfterRollback: {
    code: `${Errors.Create.UC_CODE}failedToDeleteAfterRollback`,
    message: "System failed to delete uuObject after an exception has been thrown in uuObcIfc/create use case.",
  },
  loadAssignmenUnsupportedKeys: {
    code: `${Errors.Load.UC_CODE}unsupportedKeys`,
  },
  getAssignmentUnsupportedKeys: {
    code: `${Errors.Get.UC_CODE}unsupportedKeys`,
  },
  listAssignmentUnsupportedKeys: {
    code: `${Errors.List.UC_CODE}unsupportedKeys`,
  },
  updateAssignmentUnsupportedKeys: {
    code: `${Errors.Update.UC_CODE}unsupportedKeys`,
  },
  setFinalStateUnsupportedKeys: {
    code: `${Errors.SetFinalState.UC_CODE}unsupportedKeys`,
  },
  activeRelatedSubjectFound: {
    code: `${Errors.SetFinalState.UC_CODE}activeRelatedSubjectFound`,
    message: "Related subjects are active: ",
  },
  setStateUnsupportedKeys: {
    code: `${Errors.SetState.UC_CODE}unsupportedKeys`,
  },
  createFailedToCreateActivity: {
    code: `${Errors.SetState.UC_CODE}failedToCreateActivity`,
    message: "System failed to create new activity.",
  },
  addStudentsUnsupportedKeys: {
    code: `${Errors.AddStudents.UC_CODE}unsupportedKeys`,
  },
  addStudentsStudentIsAlreadyInSubject: {
    code: `${Errors.AddStudents.UC_CODE}studentIsAlreadyInSubject`,
  },
  addStudentsStudentIsNotClassStudent: {
    code: `${Errors.AddStudents.UC_CODE}studentIsNotClassStudent`,
  },
  addStudentsStudentNotFound: {
    code: `${Errors.AddStudents.UC_CODE}studentNotFound`,
  },
  addStudentsStudentIsNotInCorrectState: {
    code: `${Errors.AddStudents.UC_CODE}studentIsNotInCorrectState`,
  },
  removeStudentUnsupportedKeys: {
    code: `${Errors.RemoveStudent.UC_CODE}unsupportedKeys`,
  }
};

module.exports = Warnings;

"use strict";

const SchoolkitMainUseCaseError = require("./schoolkit-main-use-case-error.js");
const ASSIGNMENT_ERROR_PREFIX = `${SchoolkitMainUseCaseError.ERROR_PREFIX}assignment/`;

const Create = {
  UC_CODE: `${ASSIGNMENT_ERROR_PREFIX}create/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  SubjectIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}subjectIsNotInCorrectState`;
      this.message = "The subject is not in correct state.";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence.";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  AssignmentCreateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}assignmentCreateDaoFailed`;
      this.message = "Assignment Dao create failed.";
    }
  },

  AssignmentDaoUpdateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}assignmentDaoUpdateFailed`;
      this.message = "Assignment Dao update failed.";
    }
  },

  LocationIsNotInProperState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}locationIsNotInProperState`;
      this.message = "Location is not in proper state.";
    }
  },

  FolderDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}folderDoesNotExist`;
      this.message = "Location folder doesnt exist.";
    }
  },

  UserIsNotAuthorizedToAddArtifact: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}userIsNotAuthorizedToAddArtifact`;
      this.message = "User is not authorized to add artifact.";
    }
  },

  CallUuObcCreateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}callUuObcCreateFailed`;
      this.message = "Create of UuObc failed.";
    }
  },
};

const Load = {
  UC_CODE: `${ASSIGNMENT_ERROR_PREFIX}load/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  AssignmentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}assignmentNotFound`;
      this.message = "Assignment not found.";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence.";
    }
  },

  FailedToLoadUuObcEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}failedToLoadUuObcEnvironment`;
      this.message = "Failed to artifact environment.";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },
};

const AddTask = {
  UC_CODE: `${ASSIGNMENT_ERROR_PREFIX}addTask/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddTask.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddTask.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddTask.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddTask.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence.";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  AssignmentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddTask.UC_CODE}assignmentNotFound`;
      this.message = "Assignment not found.";
    }
  },

  CourseNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddTask.UC_CODE}courseNotFound`;
      this.message = "Course not found.";
    }
  },

  AddTaskDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}addTaskDaoFailed`;
      this.message = "Assignment add task Dao create failed.";
    }
  },
};

const UpdateTask = {
  UC_CODE: `${ASSIGNMENT_ERROR_PREFIX}updateTask/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateTask.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateTask.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateTask.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddTask.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence.";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  CourseNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateTask.UC_CODE}courseNotFound`;
      this.message = "Course not found.";
    }
  },

  AssignmentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateTask.UC_CODE}assignmentNotFound`;
      this.message = "Assignment not found.";
    }
  },

  UpdateTaskDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateTask.UC_CODE}updateTaskDaoFailed`;
      this.message = "Assignment update task Dao create failed.";
    }
  },
};

const RemoveTask = {
  UC_CODE: `${ASSIGNMENT_ERROR_PREFIX}removeTask/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveTask.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveTask.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveTask.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveTask.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveTask.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence.";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveTask.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  AssignmentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveTask.UC_CODE}assignmentNotFound`;
      this.message = "Assignment not found.";
    }
  },

  UpdateTaskDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveTask.UC_CODE}updateTaskDaoFailed`;
      this.message = "Assignment update task Dao create failed.";
    }
  },
};

const Get = {
  UC_CODE: `${ASSIGNMENT_ERROR_PREFIX}get/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  AssignmentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}assignmentNotFound`;
      this.message = "Assignment with this code not found.";
    }
  },
};

const List = {
  UC_CODE: `${ASSIGNMENT_ERROR_PREFIX}list/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  AssigmentDaoListFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}assigmentDaoListFailed`;
      this.message = "Assigment DAO list failed.";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },
};

const Update = {
  UC_CODE: `${ASSIGNMENT_ERROR_PREFIX}update/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  AssignmentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}assignmentNotFound`;
      this.message = "Assignment with this code not found.";
    }
  },

  AssignmentDaoUpdateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}assigmentDaoUpdateFailed`;
      this.message = "Assigment DAO update failed.";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  AssignmentIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}assignmentIsNotInCorrectState`;
      this.message = "The assignment is not in correct state.";
    }
  },

  SubjectIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}subjectIsNotInCorrectState`;
      this.message = "The subject is not in correct state.";
    }
  },

  SubjectNotExists: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}subjectNotExists`;
      this.message = "Subject not exists.";
    }
  },

  AppClientTokenCreateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}appClientTokenCreateFailed`;
      this.message = "Failed to create token.";
    }
  },

  SetBasicUuObcArtifactAttributesFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}setBasicUuObcArtifactAttributesFailed`;
      this.message = "Set basic attributes of uuObc artifact failed.";
    }
  },
};

const SetFinalState = {
  UC_CODE: `${ASSIGNMENT_ERROR_PREFIX}setFinalState/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  AssignmentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}assignmentNotFound`;
      this.message = "Assignment not found.";
    }
  },

  AssignmentIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}assignmentIsNotInCorrectState`;
      this.message = "The assignment is not in correct state.";
    }
  },

  ListArtifactActivitiesFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}listArtifactActivitiesFailed`;
      this.message = "List activities of artifact failed.";
    }
  },

  ExistingActiveActivities: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}existingActiveActivities`;
      this.message = "Some active activities related to assignment have been found.";
    }
  },

  UuObcSetStateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}uuObcSetStateFailed`;
      this.message = "Set state of artifact failed.";
    }
  },

  AssignmentDaoUpdateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}assigmentDaoUpdateFailed`;
      this.message = "Assigment DAO update failed.";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence.";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },
};

const SetState = {
  UC_CODE: `${ASSIGNMENT_ERROR_PREFIX}setState/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  AssignmentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}assignmentNotFound`;
      this.message = "Assignment not found.";
    }
  },

  AssignmentIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}assignmentIsNotInCorrectState`;
      this.message = "The assignment is not in correct state.";
    }
  },

  ListArtifactActivitiesFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}listArtifactActivitiesFailed`;
      this.message = "List activities of artifact failed.";
    }
  },

  ExistingActiveActivities: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}existingActiveActivities`;
      this.message = "Some active activities related to assignment have been found.";
    }
  },

  UuObcSetStateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}uuObcSetStateFailed`;
      this.message = "Set state of artifact failed.";
    }
  },

  AssignmentDaoUpdateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}assigmentDaoUpdateFailed`;
      this.message = "Assigment DAO update failed.";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence.";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  UserAuthorizationError: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}userAuthorizationError`;
      this.message = "An error has occurred while authorizing user.";
    }
  },
};

const AddStudents = {
  UC_CODE: `${ASSIGNMENT_ERROR_PREFIX}addStudents/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "uuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  AssignmentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}assignmentNotFound`;
      this.message = "Assignment not found.";
    }
  },

  AssignmentIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}assignmentIsNotInCorrectState`;
      this.message = "The assignment is not in correct state.";
    }
  },

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  StudentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}studentNotFound`;
      this.message = "Student not found.";
    }
  },

  StudentNotFoundOnSubject: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}studentNotFoundOnSubject`;
      this.message = "Student not found on subject.";
    }
  },

  SubjectIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}subjectIsNotInCorrectState`;
      this.message = "Subject is not in correct state.";
    }
  },

  SubjectDaoAddStudentsFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}subjectDaoAddStudentsFailed`;
      this.message = "Subject DAO add students failed.";
    }
  },
};

const RemoveStudent = {
  UC_CODE: `${ASSIGNMENT_ERROR_PREFIX}removeStudent/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudent.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "uuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudent.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudent.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  AssignmentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudent.UC_CODE}assignmentNotFound`;
      this.message = "Assignment not found.";
    }
  },

  AssignmentIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudent.UC_CODE}assignmentIsNotInCorrectState`;
      this.message = "The assignment is not in correct state.";
    }
  },

  StudentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudent.UC_CODE}studentNotFound`;
      this.message = "Student not found.";
    }
  },

  StudentNotFoundOnAssignment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudent.UC_CODE}studentNotFoundOnAssignment`;
      this.message = "Student not found  on assignment.";
    }
  },

  AssignmentDaoRemoveStudentFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudent.UC_CODE}assignmentDaoRemoveStudentFailed`;
      this.message = "Assignment DAO remove student failed.";
    }
  },
};

const UpdateStats = {
  UC_CODE: `${ASSIGNMENT_ERROR_PREFIX}updateStats/`,
};

const GetLogs = {
  UC_CODE: `${ASSIGNMENT_ERROR_PREFIX}getLogs/`,
};

module.exports = {
  GetLogs,
  UpdateStats,
  Create,
  Load,
  AddTask,
  UpdateTask,
  RemoveTask,
  Get,
  List,
  Update,
  SetFinalState,
  SetState,
  AddStudents,
  RemoveStudent,
};

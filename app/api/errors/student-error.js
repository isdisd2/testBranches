"use strict";

const SchoolkitMainUseCaseError = require("./schoolkit-main-use-case-error.js");
const STUDENT_ERROR_PREFIX = `${SchoolkitMainUseCaseError.ERROR_PREFIX}student/`;

const Create = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}create/`,

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

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}userNotAuthorized`;
      this.message = "User has no permission to call uuBem/person/get.";
    }
  },

  CallPersonGetFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}callPersonGetFailed`;
      this.message = "Person get failed.";
    }
  },

  MaximumOfLegalGuardiansExceeded: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}maximumOfLegalGuardiansExceeded`;
      this.message = "Number of legal guardians is more than 2.";
    }
  },

  MissingLegalGuardian: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}missingLegalGuardian`;
      this.message = "None of the persons in related list is defined as a legal guardian.";
    }
  },

  StudentAlreadyExists: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}studentAlreadyExists`;
      this.message = "Student already exists.";
    }
  },

  StudentCreateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}studentCreateDaoFailed`;
      this.message = "Creating student by student DAO create failed.";
    }
  },

  LocationIsNotInProperState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}locationIsNotInProperState`;
      this.message = "Location is not in a proper state.";
    }
  },

  FolderDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}folderDoesNotExist`;
      this.message = "There is no folder for subject in this unit.";
    }
  },

  UserIsNotAuthorizedToAddArtifact: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}userIsNotAuthorizedToAddArtifact`;
      this.message = "User doesn't have rights to create OBC in this unit or folder.";
    }
  },

  CallUuObcCreateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}callUuObcCreateFailed`;
      this.message = "Call uuObc/create failed.";
    }
  },

  StudentUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}studentUpdateDaoFailed`;
      this.message = "Call uuObc/create failed.";
    }
  },

  AarCreateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}aarCreateFailed`;
      this.message = "Failed to create aar.";
    }
  },
};

const Load = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}load/`,

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

  StudentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}studentNotFound`;
      this.message = "Student not found.";
    }
  },

  FailedToLoadUuObcEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}failedToLoadUuObcEnvironment`;
      this.message = "Failed to load uuObcEnvironment.";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence.";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },
};

const Update = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}update/`,

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

  StudentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}studentNotFound`;
      this.message = "Student not found.";
    }
  },

  StudentIsNotInProperState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}studentIsNotInProperState`;
      this.message = "Student is not in proper state.";
    }
  },

  SetBasicUuObcArtifactAttributesFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}setBasicUuObcArtifactAttributesFailed`;
      this.message = "Set basic attributes of uuObc artifact failed.";
    }
  },

  StudentDaoUpdateRelationsFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}studentDaoUpdateRelationsFailed`;
      this.message = "Student DAO update relations failed.";
    }
  },

  StudentUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}studentUpdateDaoFailed`;
      this.message = "Student DAO update failed.";
    }
  },
};

const UpdateByRelatedPerson = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}updateByRelatedPerson/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByRelatedPerson.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByRelatedPerson.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByRelatedPerson.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  StudentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByRelatedPerson.UC_CODE}studentNotFound`;
      this.message = "Student not found.";
    }
  },

  StudentIsNotInProperState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByRelatedPerson.UC_CODE}studentIsNotInProperState`;
      this.message = "Student is not in proper state.";
    }
  },

  UserIsNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByRelatedPerson.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  StudentUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByRelatedPerson.UC_CODE}studentUpdateDaoFailed`;
      this.message = "Student DAO update failed.";
    }
  },
};

const SetEvaluation = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}setEvaluation/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetEvaluation.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetEvaluation.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetEvaluation.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  StudentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetEvaluation.UC_CODE}studentNotFound`;
      this.message = "Student not found.";
    }
  },

  StudentIsNotInProperState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetEvaluation.UC_CODE}studentIsNotInProperState`;
      this.message = "Student is not in proper state.";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetEvaluation.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetEvaluation.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  StudentUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetEvaluation.UC_CODE}studentUpdateDaoFailed`;
      this.message = "Student DAO update failed.";
    }
  },
};

const SetNickname = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}setNickname/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetNickname.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetNickname.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetNickname.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  StudentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetNickname.UC_CODE}studentNotFound`;
      this.message = "Student not found.";
    }
  },

  StudentIsNotInProperState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetNickname.UC_CODE}studentIsNotInProperState`;
      this.message = "Student is not in proper state.";
    }
  },

  UserIsNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetNickname.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  StudentUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetNickname.UC_CODE}studentUpdateDaoFailed`;
      this.message = "Student DAO update failed.";
    }
  },
};

const SetState = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}setState/`,

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

  StudentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}studentNotFound`;
      this.message = "Student not found.";
    }
  },

  StudentIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}studentIsNotInCorrectState`;
      this.message = "Student is not in correct state.";
    }
  },
  UuObcSetStateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}uuObcSetStateFailed`;
      this.message = "Set state of artifact failed.";
    }
  },

  StudentUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}studentUpdateDaoFailed`;
      this.message = "Student DAO update failed.";
    }
  },
};

const Get = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}get/`,

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

  StudentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}studentNotFound`;
      this.message = "Student not found.";
    }
  },
};

const SetFinalState = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}setFinalState/`,

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

  StudentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}studentNotFound`;
      this.message = "Student not found.";
    }
  },

  StudentIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}studentIsNotInCorrectState`;
      this.message = "Student is not in correct state.";
    }
  },

  StudentIsActiveClassStudent: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}studentIsActiveClassStudent`;
      this.message = "A student is an active class student.";
    }
  },

  StudentIsActiveSubjectStudent: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}studentIsActiveSubjectStudent`;
      this.message = "A student is an active subject student.";
    }
  },

  CheckExistenceOfActiveRelatedArtifactsFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}checkExistenceOfActiveRelatedArtifactsFailed`;
      this.message = "System failed to check existence of active related artifacts.";
    }
  },

  ExistingActiveAARBySideB: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}existingActiveAARBySideB`;
      this.message = "Some active artifacts related to student by side B have been found.";
    }
  },

  UuObcSetStateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}uuObcSetStateFailed`;
      this.message = "Set state of artifact failed.";
    }
  },

  StudentUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}studentUpdateDaoFailed`;
      this.message = "Student DAO update failed.";
    }
  },
};

const List = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}list/`,

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

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },
};

const AddRelatedPersons = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}addRelatedPersons/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddRelatedPersons.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },
  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddRelatedPersons.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddRelatedPersons.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  StudentDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddRelatedPersons.UC_CODE}studentDoesNotExist`;
      this.message = "Student does not exist.";
    }
  },

  StudentIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddRelatedPersons.UC_CODE}studentIsNotInCorrectState`;
      this.message = "Student is not in correct state.";
    }
  },

  NoRelatedPersonsToAdd: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddRelatedPersons.UC_CODE}noRelatedPersonsToAdd`;
      this.message = "There are no related persons to be added.";
    }
  },

  MaximumOfLegalGuardiansExceeded: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddRelatedPersons.UC_CODE}maximumOfLegalGuardiansExceeded`;
      this.message = "Number of legal guardians is more than 2.";
    }
  },

  StudentDaoAddRelatedPersons: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddRelatedPersons.UC_CODE}studentDaoAddRelatedPersons`;
      this.message = "Student DAO add realted persons failed.";
    }
  },

  UserIsNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddRelatedPersons.UC_CODE}userIsNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  FailedToLoadUuObcEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddRelatedPersons.UC_CODE}failedToLoadUuObcEnvironment`;
      this.message = "Failed to load uuObcEnvironment.";
    }
  },
};

const RemoveRelatedPerson = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}removeRelatedPerson/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveRelatedPerson.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveRelatedPerson.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveRelatedPerson.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  StudentDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveRelatedPerson.UC_CODE}studentDoesNotExist`;
      this.message = "Student does not exist.";
    }
  },

  StudentIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveRelatedPerson.UC_CODE}studentIsNotInCorrectState`;
      this.message = "Student is not in correct state.";
    }
  },

  RemoveRelatedPersonDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveRelatedPerson.UC_CODE}removeRelatedPersonDaoFailed`;
      this.message = "Remove related person DAO failed.";
    }
  },

  StudentCantHaveAnyRelatedPerson: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveRelatedPerson.UC_CODE}studentCantHaveAnyRelatedPerson`;
      this.message = "Student cant have any related person.";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveRelatedPerson.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },
};

const ListByRelatedPerson = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}listByRelatedPerson/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByRelatedPerson.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },
  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByRelatedPerson.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByRelatedPerson.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByRelatedPerson.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence";
    }
  },
};

const UpdateRelationType = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}updateRelationType/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateRelationType.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },
  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateRelationType.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateRelationType.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  StudentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateRelationType.UC_CODE}studentNotFound`;
      this.message = "Student not found.";
    }
  },

  StudentIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateRelationType.UC_CODE}studentIsNotInCorrectState`;
      this.message = "Student is not in correct state.";
    }
  },

  RelatedPersonNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateRelationType.UC_CODE}relatedPersonNotFound`;
      this.message = "Related person not found.";
    }
  },

  RelatedPersonIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateRelationType.UC_CODE}relatedPersonIsNotInCorrectState`;
      this.message = "Related person is not in correct state.";
    }
  },

  StudentDaoUpdateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateRelationType.UC_CODE}studentDaoUpdateFailed`;
      this.message = "Student DAO update failed.";
    }
  },

  UserIsNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateRelationType.UC_CODE}userIsNotAuthorized`;
      this.message = "User has to rights to update related person.";
    }
  },
};

const UpdateNote = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}updateNote/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNote.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },
  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNote.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNote.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  StudentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNote.UC_CODE}studentNotFound`;
      this.message = "Student not found.";
    }
  },

  StudentIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNote.UC_CODE}studentIsNotInCorrectState`;
      this.message = "Student is not in correct state.";
    }
  },

  RelatedPersonNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNote.UC_CODE}relatedPersonNotFound`;
      this.message = "Related person not found.";
    }
  },

  RelatedPersonIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNote.UC_CODE}relatedPersonIsNotInCorrectState`;
      this.message = "Related person is not in correct state.";
    }
  },

  StudentDaoUpdateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNote.UC_CODE}studentDaoUpdateFailed`;
      this.message = "Student DAO update failed.";
    }
  },

  UserIsNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNote.UC_CODE}userIsNotAuthorized`;
      this.message = "User has to rights to update related person.";
    }
  },
};

const SetRelatedPerson = {
  UC_CODE: `${STUDENT_ERROR_PREFIX}setRelatedPerson/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetRelatedPerson.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },
  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetRelatedPerson.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetRelatedPerson.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  StudentDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetRelatedPerson.UC_CODE}studentDoesNotExist`;
      this.message = "Student does not exist.";
    }
  },

  StudentIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetRelatedPerson.UC_CODE}studentIsNotInCorrectState`;
      this.message = "Student is not in correct state.";
    }
  },

  UserIsNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetRelatedPerson.UC_CODE}userIsNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  RelatedPersonNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetRelatedPerson.UC_CODE}relatedPersonNotFound`;
      this.message = "Related person not found.";
    }
  },

  RelatedPersonIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetRelatedPerson.UC_CODE}relatedPersonIsNotInCorrectState`;
      this.message = "Related person is not in correct state.";
    }
  },

  RelatedPersonIsNotRelatedToStudent: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetRelatedPerson.UC_CODE}relatedPersonIsNotRelatedToStudent`;
      this.message = "Related person is not related to the student.";
    }
  },

  RelatedPersonHasAlreadyRequestedStatus: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetRelatedPerson.UC_CODE}relatedPersonHasAlreadyRequestedStatus`;
      this.message = "Related person has already requested status";
    }
  },

  MaximumOfLegalGuardiansExceeded: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetRelatedPerson.UC_CODE}maximumOfLegalGuardiansExceeded`;
      this.message = "Number of legal guardians is more than 2.";
    }
  },

  StudentHasOnlyOneLegalGuardian: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetRelatedPerson.UC_CODE}studentHasOnlyOneLegalGuardian`;
      this.message = "Related person cannot bet set, student has to have at least one legal guardian.";
    }
  },

  StudentUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetRelatedPerson.UC_CODE}studentUpdateDaoFailed`;
      this.message = "Student DAO update failed.";
    }
  },
};

module.exports = {
  SetRelatedPerson,
  UpdateNote,
  UpdateRelationType,
  List,
  ListByRelatedPerson,
  Get,
  Update,
  UpdateByRelatedPerson,
  SetEvaluation,
  SetNickname,
  SetState,
  SetFinalState,
  Load,
  Create,
  AddRelatedPersons,
  RemoveRelatedPerson,
};

"use strict";
const SchoolkitMainUseCaseError = require("./schoolkit-main-use-case-error.js");
const RELATED_PERSON_ERROR_PREFIX = `${SchoolkitMainUseCaseError.ERROR_PREFIX}relatedPerson/`;

const Create = {
  UC_CODE: `${RELATED_PERSON_ERROR_PREFIX}create/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "uuSchoolKit does not exist.";
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

  RelatedPersonAlreadyExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}relatedPersonAlreadyExist`;
      this.message = "Related person already exists.";
    }
  },

  RelatedPersonCreateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}relatedPersonCreateDaoFailed`;
      this.message = "Creating relatedPerson by relatedPerson DAO create failed.";
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
      this.message = "There is no folder for class in this unit.";
    }
  },

  UserIsNotAuthorizedToAddArtifact: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}userIsNotAuthorizedToAddArtifact`;
      this.message = "User doesn't have rights to create Unit in this unit or folder.";
    }
  },

  CallUuObcCreateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}callUuObcCreateFailed`;
      this.message = "Call uuObc/create failed.";
    }
  },

  RelatedPersonUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}relatedPersonUpdateDaoFailed`;
      this.message = "Updating related person by relatedPerson DAO update failed.";
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

const Get = {
  UC_CODE: `${SchoolkitMainUseCaseError.ERROR_PREFIX}relatedPerson/get/`,
  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "uuSchoolKit does not exist.";
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

  RelatedPersonNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}relatedPersonNotFound`;
      this.message = "Related person not found.";
    }
  },
};

const Load = {
  UC_CODE: `${RELATED_PERSON_ERROR_PREFIX}load/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "uuSchoolKit does not exist.";
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

  RelatedPersonNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}relatedPersonNotFound`;
      this.message = "Related person not found.";
    }
  },

  FailedToLoadUuObcEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}failedToLoadUuObcEnvironment`;
      this.message = "Failed to load uuObcEnviroment";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence";
    }
  },
};

const List = {
  UC_CODE: `${RELATED_PERSON_ERROR_PREFIX}list/`,
  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${List.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "uuSchoolKit does not exist.";
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
};

const Update = {
  UC_CODE: `${RELATED_PERSON_ERROR_PREFIX}update/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "uuSchoolKit does not exist.";
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

  RelatedPersonNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}relatedPersonNotFound`;
      this.message = "RelatedPerson not found.";
    }
  },

  RelatedPersonIsNotInProperState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}relatedPersonIsNotInProperState`;
      this.message = "RelatedPerson is not in proper state.";
    }
  },

  FailedToLoadUuObcEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}failedToLoadUuObcEnvironment`;
      this.message = "Failed to load uuObcEnviroment";
    }
  },

  StudentDaoUpdateRelationsFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}studentDaoUpdateRelationsFailed`;
      this.message = "Student DAO update relations failed.";
    }
  },

  RelatedPersonUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}relatedPersonUpdateDaoFailed`;
      this.message = "RelatedPerson DAO update failed.";
    }
  },
};

const UpdateByRelatedPerson = {
  UC_CODE: `${RELATED_PERSON_ERROR_PREFIX}updateByRelatedPerson/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByRelatedPerson.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "uuSchoolKit does not exist.";
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

  RelatedPersonNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByRelatedPerson.UC_CODE}relatedPersonNotFound`;
      this.message = "RelatedPerson not found.";
    }
  },

  RelatedPersonIsNotInProperState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByRelatedPerson.UC_CODE}relatedPersonIsNotInProperState`;
      this.message = "RelatedPerson is not in proper state.";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByRelatedPerson.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  RelatedPersonUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByRelatedPerson.UC_CODE}relatedPersonUpdateDaoFailed`;
      this.message = "RelatedPerson DAO update failed.";
    }
  },
};

const SetState = {
  UC_CODE: `${RELATED_PERSON_ERROR_PREFIX}setState/`,
  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "uuSchoolKit does not exist.";
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

  RelatedPersonNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}relatedPersonNotFound`;
      this.message = "Related person not found.";
    }
  },

  RelatedPersonIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}relatedPersonIsNotInCorrectState`;
      this.message = "Related person is not in correct state.";
    }
  },

  UuObcSetStateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}uuObcSetStateFailed`;
      this.message = "Set state of artifact failed.";
    }
  },

  RelatedPersonUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}relatedPersonUpdateDaoFailed`;
      this.message = "Related person DAO update failed.";
    }
  },
};

const SetFinalState = {
  UC_CODE: `${RELATED_PERSON_ERROR_PREFIX}setFinalState/`,

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

  RelatedPersonNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}relatedPersonNotFound`;
      this.message = "Related person not found.";
    }
  },

  RelatedPersonIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}relatedPersonIsNotInCorrectState`;
      this.message = "Related person is not in correct state.";
    }
  },

  StudentIsActiveClassStudent: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}studentIsActiveClassStudent`;
      this.message = "A student is an active class student.";
    }
  },

  ExistingStudentRelatedPersonRelation: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}existingStudentRelatedPersonRelation`;
      this.message = "At least one student related to relatedPerson exists.";
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
      this.message = "Some active artifacts related to relatedPerson by side B have been found.";
    }
  },

  UuObcSetStateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}uuObcSetStateFailed`;
      this.message = "Set state of artifact failed.";
    }
  },

  RelatedPersonUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}relatedPersonUpdateDaoFailed`;
      this.message = "Related person DAO update failed.";
    }
  },
};

module.exports = {
  Create,
  Get,
  Load,
  List,
  SetState,
  Update,
  UpdateByRelatedPerson,
  SetFinalState,
};

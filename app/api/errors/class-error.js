"use strict";
const SchoolkitMainUseCaseError = require("./schoolkit-main-use-case-error.js");
const ClASS_ERROR_PREFIX = `${SchoolkitMainUseCaseError.ERROR_PREFIX}class/`;

const Create = {
  UC_CODE: `${ClASS_ERROR_PREFIX}create/`,

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

  SchoolYearNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}schoolYearNotFound`;
      this.message = "SchoolYear not found.";
    }
  },

  SchoolYearIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}schoolYearIsNotInCorrectState`;
      this.message = "SchoolYear is not in correct state.";
    }
  },

  FailedToCreateUuUnit: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}failedToCreateUuUnit`;
      this.message = "Failed to create uuUnit.";
    }
  },

  FailedToCreateUuRole: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}failedToCreateUuRole`;
      this.message = "Failed to create uuRole.";
    }
  },

  FailedToAddCastUuRole: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}failedToAddCastUuRole`;
      this.message = "Failed to addCast uuRole.";
    }
  },

  UuUnitFailedToSetResponsibleRole: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}uuUnitFailedToSetResponsibleRole`;
      this.message = "Failed to set uuUnit responsible role.";
    }
  },

  ClassCreateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}classCreateDaoFailed`;
      this.message = "Creating class by class DAO create failed.";
    }
  },

  ClassWithCodeAlreadyExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}classWithCodeAlreadyExist`;
      this.message = "Class with code already exists.";
    }
  },

  UuClassUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}failedToUpdateAfterRollback`;
      this.message = "Updating Class by class DAO update failed.";
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

  CallUuObcCreateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}callUuObcCreateFailed`;
      this.message = "Call uuObc/create failed.";
    }
  },

  CallFolderCreateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}callFolderCreateFailed`;
      this.message = "Call folder/create failed";
    }
  },

  ClassNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}classNotFound`;
      this.message = "Class not found.";
    }
  },

  ClassUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}classUpdateDaoFailed`;
      this.message = "Updating class by class DAO update failed.";
    }
  },

  FailedToGetClassTeacherRole: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}failedToGetClassTeacherRole`;
      this.message = "Failed to load class teacher role";
    }
  },

  ClassTeacherRoleIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}classTeacherRoleIsNotInCorrectState`;
      this.message = "Class teacher role is not in correct state";
    }
  },

  FailedToCallSetUnitPermissionScript: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}failedToCallSetUnitPermissionScript`;
      this.message = "Failed to call setUnitPermissionScript";
    }
  },

  TeacherCreateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}teacherCreateDaoFailed`;
      this.message = "Creating teacher by teacher DAO create failed.";
    }
  },

  UuRoleIfcGetFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}uuRoleIfcGetFailed`;
      this.message = "Failed to load teacher role detail.";
    }
  },
};

const Update = {
  UC_CODE: `${ClASS_ERROR_PREFIX}update/`,

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

  ClassNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}classNotFound`;
      this.message = "Class not found.";
    }
  },

  ClassIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}classIsNotInCorrectState`;
      this.message = "Class is not in correct state.";
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
  SetBasicUuUnitArtifactAttributesFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}setBasicUuUnitArtifactAttributesFailed`;
      this.message = "Set basic attributes of uuUnit artifact failed.";
    }
  },
  SetBasicUuFolderAttributesFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}setBasicUuFolderAttributesFailed`;
      this.message = "Set basic attributes of uuFolder failed.";
    }
  },
  ClassUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}classUpdateDaoFailed`;
      this.message = "Class DAO update failed.";
    }
  },

  FailedToLoadUuObcEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}failedToLoadUuObcEnvironment`;
      this.message = "Failed to load uuObc environment.";
    }
  },
};

const UpdateByClassTeacher = {
  UC_CODE: `${ClASS_ERROR_PREFIX}updateByClassTeacher/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByClassTeacher.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "uuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByClassTeacher.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByClassTeacher.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  ClassNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByClassTeacher.UC_CODE}classNotFound`;
      this.message = "Class not found.";
    }
  },

  ClassIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByClassTeacher.UC_CODE}classIsNotInCorrectState`;
      this.message = "Class is not in correct state.";
    }
  },

  AppClientTokenCreateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByClassTeacher.UC_CODE}appClientTokenCreateFailed`;
      this.message = "Failed to create token.";
    }
  },

  SetBasicUuObcArtifactAttributesFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByClassTeacher.UC_CODE}setBasicUuObcArtifactAttributesFailed`;
      this.message = "Set basic attributes of uuObc artifact failed.";
    }
  },
  SetBasicUuUnitArtifactAttributesFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByClassTeacher.UC_CODE}setBasicUuUnitArtifactAttributesFailed`;
      this.message = "Set basic attributes of uuUnit artifact failed.";
    }
  },
  SetBasicUuFolderAttributesFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByClassTeacher.UC_CODE}setBasicUuFolderAttributesFailed`;
      this.message = "Set basic attributes of uuFolder failed.";
    }
  },
  ClassUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByClassTeacher.UC_CODE}classUpdateDaoFailed`;
      this.message = "Class DAO update failed.";
    }
  },
  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByClassTeacher.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence";
    }
  },
  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByClassTeacher.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized";
    }
  },

  FailedToLoadUuObcEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateByClassTeacher.UC_CODE}failedToLoadUuObcEnvironment`;
      this.message = "Failed to load uuObc environment.";
    }
  },
};

const AddStudents = {
  UC_CODE: `${ClASS_ERROR_PREFIX}addStudents/`,

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

  ClassNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}classNotFound`;
      this.message = "Class not found.";
    }
  },

  ClassIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}classIsNotInCorrectState`;
      this.message = "Class is not in correct state.";
    }
  },

  NoStudentToBeAdded: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}noStudentToBeAdded`;
      this.message = "There are no students to be added.";
    }
  },

  ClassDaoAddStudentsFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}classDaoAddStudentsFailed`;
      this.message = "Class DAO add students failed.";
    }
  },
};

const RemoveStudent = {
  UC_CODE: `${ClASS_ERROR_PREFIX}removeStudent/`,

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

  ClassNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudent.UC_CODE}classNotFound`;
      this.message = "Class not found.";
    }
  },

  ClassIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudent.UC_CODE}classIsNotInCorrectState`;
      this.message = "Class is not in correct state.";
    }
  },

  ClassDaoRemoveStudentFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudent.UC_CODE}classDaoRemoveStudentFailed`;
      this.message = "Class DAO remove student failed.";
    }
  },
};

const ListBySchoolYear = {
  UC_CODE: `${ClASS_ERROR_PREFIX}listBySchoolYear/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListBySchoolYear.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "SchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListBySchoolYear.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListBySchoolYear.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
};

const ListByTeacher = {
  UC_CODE: `${ClASS_ERROR_PREFIX}listByTeacher/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByTeacher.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "SchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByTeacher.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByTeacher.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  FailedToLoadUuRoleCasts: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByTeacher.UC_CODE}failedToLoadUuRoleCasts`;
      this.message = "Failed to load uuRole casts.";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByTeacher.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized";
    }
  },
};

const ListByStudent = {
  UC_CODE: `${ClASS_ERROR_PREFIX}listByStudent/`,

  UuSchoolkitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByStudent.UC_CODE}uuSchoolkitDoesNotExist`;
      this.message = "SchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByStudent.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByStudent.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  StudentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByStudent.UC_CODE}studentNotFound`;
      this.message = "Student not found.";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByStudent.UC_CODE}userNotAuthorized`;
      this.message = "User not authorized.";
    }
  },
};

const Get = {
  UC_CODE: `${ClASS_ERROR_PREFIX}get/`,

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

  ClassNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}classNotFound`;
      this.message = "Class not found.";
    }
  },
};

const Load = {
  UC_CODE: `${ClASS_ERROR_PREFIX}load/`,

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

  ClassNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}classNotFound`;
      this.message = "Class not found.";
    }
  },

  FailedToLoadUuObcEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}failedToLoadUuObcEnvironment`;
      this.message = "Failed to load uuObc environment.";
    }
  },

  AppClientTokenCreateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}appClientTokenCreateFailed`;
      this.message = "Creation of app client token failed.";
    }
  },

  FailedToLoadUuUnitEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}failedToLoadUuUnitEnvironment`;
      this.message = "Failed to load UuUnit environment";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized";
    }
  },
};

const Delete = {
  UC_CODE: `${ClASS_ERROR_PREFIX}delete/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "uuSchoolKit does not exist.";
    }
  },

  UuSchoolKitNotInActiveState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}uuSchoolKitNotInActiveState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  ClassIsNotInFinalState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}classIsNotInFinalState`;
      this.message = "Class is not in final state.";
    }
  },

  DeleteUuObcFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}deleteUuObcFailed`;
      this.message = "Deleting of uuObc failed.";
    }
  },

  ClassDaoDeleteFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}classDaoDeleteFailed`;
      this.message = "Class delete failed.";
    }
  },
};

const SetState = {
  UC_CODE: `${ClASS_ERROR_PREFIX}setState/`,

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

  ClassNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}classNotFound`;
      this.message = "Class not found.";
    }
  },

  ClassIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}classIsNotInCorrectState`;
      this.message = "Class is not in correct state.";
    }
  },

  UuObcSetStateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}uuObcSetStateFailed`;
      this.message = "Set state of artifact failed.";
    }
  },

  ClassDaoUpdateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}classDaoUpdateFailed`;
      this.message = "Class update failed.";
    }
  },

  FailedToLoadUuObcEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}failedToLoadUuObcEnvironment`;
      this.message = "Failed to load uuObc environment.";
    }
  },
};

const SetFinalState = {
  UC_CODE: `${ClASS_ERROR_PREFIX}setFinalState/`,

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

  ClassNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}classNotFound`;
      this.message = "Class not found.";
    }
  },

  ClassIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}classIsNotInCorrectState`;
      this.message = "Class is not in correct state.";
    }
  },

  ExistingActiveRelatedSubject: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}existingActiveRelatedSubject`;
      this.message = "Related subjects is in active state.";
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
      this.message = "Some active artifacts related to class by side B have been found.";
    }
  },

  UuObcSetStateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}uuObcSetStateFailed`;
      this.message = "Set state of artifact failed.";
    }
  },

  ClassUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}classUpdateDaoFailed`;
      this.message = "Class DAO update failed..";
    }
  },

  FailedToLoadUuObcEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}failedToLoadUuObcEnvironment`;
      this.message = "Failed to load uuObc environment.";
    }
  },
};

const UpdateNumberInClass = {
  UC_CODE: `${ClASS_ERROR_PREFIX}updateNumberInClass/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNumberInClass.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNumberInClass.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNumberInClass.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  ClassNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNumberInClass.UC_CODE}classNotFound`;
      this.message = "Class not found.";
    }
  },

  ClassIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNumberInClass.UC_CODE}classIsNotInCorrectState`;
      this.message = "Class is not in correct state.";
    }
  },
  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNumberInClass.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence.";
    }
  },
  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNumberInClass.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },
  StudentIsNotInClass: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNumberInClass.UC_CODE}studentIsNotInClass`;
      this.message = "The entered student is not in class.";
    }
  },
  NumberInClassIsAlreadyTaken: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNumberInClass.UC_CODE}numberInClassIsAlreadyTaken`;
      this.message = "The entered number is already used by another student.";
    }
  },
  StudentNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNumberInClass.UC_CODE}studentNotFound`;
      this.message = "Student not found.";
    }
  },
  StudentIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNumberInClass.UC_CODE}studentIsNotInCorrectState`;
      this.message = "Student is not in the correct state.";
    }
  },
  ClassDaoUpdateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateNumberInClass.UC_CODE}classDaoUpdateFailed`;
      this.message = "Class DAO update failed.";
    }
  },
};

module.exports = {
  UpdateNumberInClass,
  SetFinalState,
  SetState,
  Create,
  Update,
  UpdateByClassTeacher,
  AddStudents,
  RemoveStudent,
  ListBySchoolYear,
  ListByTeacher,
  ListByStudent,
  Get,
  Load,
  Delete,
};

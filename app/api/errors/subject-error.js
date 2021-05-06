"use strict";

const SchoolkitMainUseCaseError = require("./schoolkit-main-use-case-error.js");
const SUBJECT_ERROR_PREFIX = `${SchoolkitMainUseCaseError.ERROR_PREFIX}subject/`;

const Create = {
  UC_CODE: `${SUBJECT_ERROR_PREFIX}create/`,

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

  ClassNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}classNotFound`;
      this.message = "Class not found.";
    }
  },

  ClassIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}classIsNotInCorrectState`;
      this.message = "Class is not in correct state.";
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

  SubjectWithCodeAlreadyExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}subjectWithCodeAlreadyExist`;
      this.message = "Subject with code already exists.";
    }
  },

  SubjectCreateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}subjectCreateDaoFailed`;
      this.message = "Creating subject by subject DAO create failed.";
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

  SubjectUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}subjectUpdateDaoFailed`;
      this.message = "Updating subject by subject DAO update failed.";
    }
  },

  FailedToCreateUuUnit: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}failedToCreateUuUnit`;
      this.message = "Failed to create uuUnit.";
    }
  },

  UuUnitFailedToSetResponsibleRole: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}uuUnitFailedToSetResponsibleRole`;
      this.message = "Failed to set uuUnit responsible role.";
    }
  },

  FailedToGetSubjectTeacherRole: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}failedToGetSubjectTeacherRole`;
      this.message = "Failed to load subject teacher role";
    }
  },

  SubjectTeacherRoleIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}subjectTeacherRoleIsNotInCorrectState`;
      this.message = "Subject teacher role is not in correct state";
    }
  },

  TeacherCreateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}teacherCreateDaoFailed`;
      this.message = "Creating teacher by teacher DAO create failed.";
    }
  },
};

const Load = {
  UC_CODE: `${SUBJECT_ERROR_PREFIX}load/`,

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

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  FailedToLoadUuObcEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}failedToLoadUuObcEnvironment`;
      this.message = "Failed to load uuObcEnviroment.";
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

  UuRoleIfcGetFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}uuRoleIfcGetFailed`;
      this.message = "Failed to load teacher role detail.";
    }
  },
};

const Update = {
  UC_CODE: `${SUBJECT_ERROR_PREFIX}update/`,
  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "SchoolKit does not exist.";
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

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  SubjectIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}subjectIsNotInCorrectState`;
      this.message = "Subject is not in correct state.";
    }
  },

  SetBasicUuObcArtifactAttributesFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}setBasicUuObcArtifactAttributesFailed`;
      this.message = "Set basic attributes of uuObc artifact failed.";
    }
  },

  SubjectUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}subjectUpdateDaoFailed`;
      this.message = "Subject DAO update failed.";
    }
  },

  SetBasicUuUnitArtifactAttributesFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}setBasicUuUnitArtifactAttributesFailed`;
      this.message = "Set basic attributes of uuUnit artifact failed.";
    }
  },
};

const UpdateBySubjectTeacher = {
  UC_CODE: `${SUBJECT_ERROR_PREFIX}updateBySubjectTeacher/`,
  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateBySubjectTeacher.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "SchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateBySubjectTeacher.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateBySubjectTeacher.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateBySubjectTeacher.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  SubjectIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateBySubjectTeacher.UC_CODE}subjectIsNotInCorrectState`;
      this.message = "Subject is not in correct state.";
    }
  },

  SetBasicUuObcArtifactAttributesFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateBySubjectTeacher.UC_CODE}setBasicUuObcArtifactAttributesFailed`;
      this.message = "Set basic attributes of uuObc artifact failed.";
    }
  },

  SubjectUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateBySubjectTeacher.UC_CODE}subjectUpdateDaoFailed`;
      this.message = "Subject DAO update failed.";
    }
  },
  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateBySubjectTeacher.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence";
    }
  },
  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateBySubjectTeacher.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized";
    }
  },

  SetBasicUuUnitArtifactAttributesFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${UpdateBySubjectTeacher.UC_CODE}setBasicUuUnitArtifactAttributesFailed`;
      this.message = "Set basic attributes of uuUnit artifact failed.";
    }
  },
};

const AddStudents = {
  UC_CODE: `${SUBJECT_ERROR_PREFIX}addStudents/`,

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

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  SubjectIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}subjectIsNotInCorrectState`;
      this.message = "Subject is not in correct state.";
    }
  },

  NoStudentToBeAdded: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}noStudentToBeAdded`;
      this.message = "There are no students to be added.";
    }
  },

  SubjectDaoAddStudentsFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}subjectDaoAddStudentsFailed`;
      this.message = "Subject DAO add students failed.";
    }
  },

  SubjetClassNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}subjetClassNotFound`;
      this.message = "Subject class not found.";
    }
  },

  SubjetSchoolYearNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudents.UC_CODE}subjetSchoolYearNotFound`;
      this.message = "Subject school year not found.";
    }
  },
};

const RemoveStudent = {
  UC_CODE: `${SUBJECT_ERROR_PREFIX}removeStudent/`,

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

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudent.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  SubjectIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudent.UC_CODE}subjectIsNotInCorrectState`;
      this.message = "Subject is not in correct state.";
    }
  },

  SubjectDaoRemoveStudentFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudent.UC_CODE}subjectDaoRemoveStudentFailed`;
      this.message = "Class DAO remove student failed.";
    }
  },
};

const Delete = {
  UC_CODE: `${SUBJECT_ERROR_PREFIX}delete/`,
  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "uuSchoolKit doesnt not exitst.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
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

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  SubjectIsNotInFinalState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}subjectIsNotInFinalState`;
      this.message = "Subject is not in final state.";
    }
  },

  DeleteUuObcFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}deleteUuObcFailed`;
      this.message = "Deleting of uuObc failed.";
    }
  },

  SubjectDaoDeleteFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Delete.UC_CODE}subjectDaoDeleteFailed`;
      this.message = "Subject delete failed.";
    }
  },
};

const Get = {
  UC_CODE: `${SUBJECT_ERROR_PREFIX}get/`,
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

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },
};

const ListByTeacher = {
  UC_CODE: `${SchoolkitMainUseCaseError.ERROR_PREFIX}subject/listByTeacher/`,
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
  UC_CODE: `${SchoolkitMainUseCaseError.ERROR_PREFIX}listByStudent/`,
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

const ListByClass = {
  UC_CODE: `${SUBJECT_ERROR_PREFIX}listByClass/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByClass.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "SchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByClass.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "UuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByClass.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  UuRoleIfcGetFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByClass.UC_CODE}uuRoleIfcGetFailed`;
      this.message = "Failed to load teacher role detail.";
    }
  },

  FailedToLoadUuObcEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${ListByClass.UC_CODE}failedToLoadUuObcEnvironment`;
      this.message = "Failed to load UuObc environment.";
    }
  },
};

const SetState = {
  UC_CODE: `${SUBJECT_ERROR_PREFIX}setState/`,
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

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  SubjectIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}subjectIsNotInCorrectState`;
      this.message = "Subject is not in correct state.";
    }
  },

  UuObcSetStateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}uuObcSetStateFailed`;
      this.message = "Set state of artifact failed.";
    }
  },

  SubjectUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}subjectUpdateDaoFailed`;
      this.message = "Subject DAO update failed.";
    }
  },
};

const SetFinalState = {
  UC_CODE: `${SUBJECT_ERROR_PREFIX}setFinalState/`,

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

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  SubjectIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}subjectIsNotInCorrectState`;
      this.message = "Subject is not in correct state.";
    }
  },

  ActiveRelatedStudentFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}activeRelatedStudentFound`;
      this.message = "Related students is in active state.";
    }
  },

  ExistingActiveRelatedStudent: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}existingActiveRelatedStudent`;
      this.message = "Related students is in active state.";
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
      this.message = "Some active artifacts related to subject by side B have been found.";
    }
  },

  UuObcSetStateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}uuObcSetStateFailed`;
      this.message = "Set state of artifact failed.";
    }
  },

  SubjectUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}subjectUpdateDaoFailed`;
      this.message = "Subject DAO update failed.";
    }
  },

  ExistingActiveStudents: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetFinalState.UC_CODE}existingActiveStudents`;
      this.message = "Subject contains active students.";
    }
  },
};

const AddStudentCourse = {
  UC_CODE: `${SUBJECT_ERROR_PREFIX}addStudentCourse/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudentCourse.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudentCourse.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudentCourse.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudentCourse.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  SubjectIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudentCourse.UC_CODE}subjectIsNotInCorrectState`;
      this.message = "The subject is not in correct state.";
    }
  },

  StudentsHasAlreadyCourseKitId: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudentCourse.UC_CODE}studentsHasAlreadyCourseKitId`;
      this.message = "The students have already courseKitId.";
    }
  },

  SubjectUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudentCourse.UC_CODE}subjectUpdateDaoFailed`;
      this.message = "Updating subject by subject DAO update failed.";
    }
  },

  CourseIsNotRegistered: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudentCourse.UC_CODE}courseIsNotRegistered`;
      this.message = "Course is not registered.";
    }
  },

  FailedToLoadUuObcEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddStudentCourse.UC_CODE}failedToLoadUuObcEnvironment`;
      this.message = "Failed to load uuObcEnviroment.";
    }
  },
};

const AddCourse = {
  UC_CODE: `${SUBJECT_ERROR_PREFIX}addCourse/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddCourse.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddCourse.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddCourse.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddCourse.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  SubjectIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddCourse.UC_CODE}subjectIsNotInCorrectState`;
      this.message = "The subject is not in correct state.";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddCourse.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence.";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddCourse.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  CourseIsNotRegistered: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddCourse.UC_CODE}courseIsNotRegistered`;
      this.message = "Course is not registered.";
    }
  },

  CourseAlreadyAdded: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddCourse.UC_CODE}courseAlreadyAdded`;
      this.message = "The subject has already added courseKit.";
    }
  },

  SubjetClassNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddCourse.UC_CODE}subjetClassNotFound`;
      this.message = "Subject class not found.";
    }
  },

  SubjetSchoolYearNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddCourse.UC_CODE}subjetSchoolYearNotFound`;
      this.message = "Subject school year not found.";
    }
  },

  FailedLoadStudentsList: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddCourse.UC_CODE}failedLoadStudentsList`;
      this.message = "Failed load student list.";
    }
  },

  FailedToLoadUuObcEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${AddCourse.UC_CODE}failedToLoadUuObcEnvironment`;
      this.message = "Failed to load uuObcEnviroment.";
    }
  },
};

const RemoveCourse = {
  UC_CODE: `${SUBJECT_ERROR_PREFIX}removeCourse/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveCourse.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveCourse.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveCourse.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveCourse.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  SubjectIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveCourse.UC_CODE}subjectIsNotInCorrectState`;
      this.message = "The subject is not in correct state.";
    }
  },

  CallVerifyMyCastExistenceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveCourse.UC_CODE}callVerifyMyCastExistenceFailed`;
      this.message = "Failed to call verifyMyCastExistence.";
    }
  },

  UserNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveCourse.UC_CODE}userNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  CourseIsNotRegistered: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveCourse.UC_CODE}courseIsNotRegistered`;
      this.message = "Course is not registered.";
    }
  },

  SubjectUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveCourse.UC_CODE}subjectUpdateDaoFailed`;
      this.message = "Subject DAO update failed.";
    }
  },
};

const RemoveStudentCourse = {
  UC_CODE: `${SUBJECT_ERROR_PREFIX}removeStudentCourse/`,

  UuSchoolKitDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudentCourse.UC_CODE}uuSchoolKitDoesNotExist`;
      this.message = "UuSchoolKit does not exist.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudentCourse.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "uuSchoolKit is not in active state.";
    }
  },

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudentCourse.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  SubjectNotFound: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudentCourse.UC_CODE}subjectNotFound`;
      this.message = "Subject not found.";
    }
  },

  SubjectIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudentCourse.UC_CODE}subjectIsNotInCorrectState`;
      this.message = "The subject is not in correct state.";
    }
  },

  StudentsHasAlreadyCourseKitId: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudentCourse.UC_CODE}studentsHasAlreadyCourseKitId`;
      this.message = "The students have already courseKitId.";
    }
  },

  SubjectUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudentCourse.UC_CODE}subjectUpdateDaoFailed`;
      this.message = "Updating subject by subject DAO update failed.";
    }
  },

  CourseIsNotRegistered: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${RemoveStudentCourse.UC_CODE}courseIsNotRegistered`;
      this.message = "Course is not registered.";
    }
  },
};

module.exports = {
  RemoveStudentCourse,
  RemoveCourse,
  AddCourse,
  AddStudentCourse,
  SetFinalState,
  SetState,
  AddStudents,
  RemoveStudent,
  ListByClass,
  ListByStudent,
  ListByTeacher,
  Get,
  Load,
  Delete,
  Update,
  UpdateBySubjectTeacher,
  Create,
};

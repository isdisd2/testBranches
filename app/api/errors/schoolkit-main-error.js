"use strict";
const SchoolkitMainUseCaseError = require("./schoolkit-main-use-case-error.js");
const SCHOOLKIT_ERROR_PREFIX = `${SchoolkitMainUseCaseError.ERROR_PREFIX}uuSchoolKit/`;

const Init = {
  UC_CODE: `${SCHOOLKIT_ERROR_PREFIX}init/`,

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Init.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

  InvalidLocationUri: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Init.UC_CODE}invalidLocationUri`;
      this.message = "Location uri does not include id of location or is not uri.";
    }
  },

  SchemaDaoCreateSchemaFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Init.UC_CODE}schemaDaoCreateSchemaFailed`;
      this.message = "Create schema by Dao createSchema failed.";
    }
  },

  FailedToInitializeKeys: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Init.UC_CODE}failedToInitializeKeys`;
      this.message = "Failed to initialize keys.";
    }
  },

  AppClientTokenCreateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Init.UC_CODE}appClientTokenCreateFailed`;
      this.message = "Creation of app client token failed.";
    }
  },

  MetaModelDoesNotExist: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Init.UC_CODE}metaModelDoesNotExist`;
      this.message = "Meta model was not found.";
    }
  },

  UuSchoolKitCreateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Init.UC_CODE}uuSchoolKitCreateDaoFailed`;
      this.message = "uuSchoolKit create failed.";
    }
  },

  UuSchoolKitDeleteDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Init.UC_CODE}uuSchoolKitDeleteDaoFailed`;
      this.message = "uuSchoolKit delete failed.";
    }
  },

  CreateAwscFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Init.UC_CODE}createAwscFailed`;
      this.message = "Create awsc failed.";
    }
  },

  GetAwscFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Init.UC_CODE}getAwscFailed`;
      this.message = "Get awsc failed.";
    }
  },

  ConnectAwscFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Init.UC_CODE}connectAwscFailed`;
      this.message = "Connecting to awsc failed.";
    }
  },

  SysGetAppWorkspaceFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Init.UC_CODE}sysGetAppWorkspaceFailed`;
      this.message = "SysGetAppWorkspace failed.";
    }
  },

  FailedToGetRoleGroupFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Init.UC_CODE}failedToGetRoleGroupFailed`;
      this.message = "Get uuRoleGroup failed.";
    }
  },

  SetAwscPermissionsFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Init.UC_CODE}setAwscPermissionsFailed`;
      this.message = "Set awsc permissions failed.";
    }
  },

  ScriptOperationFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Init.UC_CODE}scriptOperationFailed`;
      this.message = "Script operation failed.";
    }
  }
};

const Load = {
  UC_CODE: `${SCHOOLKIT_ERROR_PREFIX}load/`,

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

  FailedToLoadUuAwscEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}failedToLoadUuAwscEnvironment`;
      this.message = "Failed to load uuAwsc environment.";
    }
  },

  UuSchoolKitDaoLoadFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Load.UC_CODE}uuSchoolKitDaoLoadFailed`;
      this.message = "uuSchoolKit load dao failed.";
    }
  },
};

const Update = {
  UC_CODE: `${SCHOOLKIT_ERROR_PREFIX}update/`,

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

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
      this.message = "uuSchoolKit is not in an active state.";
    }
  },

  UuSchoolKitDaoUpdateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}uuSchoolKitDaoUpdateFailed`;
      this.message = "uuSchoolKit update failed.";
    }
  },

  SetBasicUuAwscArtifactAttributesFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}setBasicUuAwscArtifactAttributesFailed`;
      this.message = "Set basic attributes of uuAwsc artifact failed.";
    }
  },

  FailedToLoadUuAwscEnvironment: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}failedToLoadUuAwscEnvironment`;
      this.message = "Failed to load uuAwsc environment.";
    }
  }
};

const SetState = {
  UC_CODE: `${SCHOOLKIT_ERROR_PREFIX}setState/`,

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },

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
      this.code = `${SetState.UC_CODE}uuSchoolKitNotInActiveState`;
      this.message = "uuSchoolKit is in final state.";
    }
  },

  UuAwscSetStateFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}uuAwscSetStateFailed`;
      this.message = "Set state of uuAwsc artifact failed.";
    }
  },

  UuSchoolKitUpdateDaoFailed: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${SetState.UC_CODE}uuSchoolKitUpdateDaoFailed`;
      this.message = "UuSchoolKit DAO update failed.";
    }
  }
};

const Get = {
  UC_CODE: `${SCHOOLKIT_ERROR_PREFIX}get/`,

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
  }
};

module.exports = {
  Init,
  Load,
  Update,
  SetState,
  Get
};

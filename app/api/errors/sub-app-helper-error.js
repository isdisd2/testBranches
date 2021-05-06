"use strict";

const SchoolkitMainUseCaseError = require("./schoolkit-main-use-case-error.js");
const SUB_APP_HELPER_ERROR_PREFIX = `${SchoolkitMainUseCaseError.ERROR_PREFIX}subAppHelper/`;

const TrustedSubAppAuthorization = {
  UC_CODE: `${SUB_APP_HELPER_ERROR_PREFIX}trustedSubAppAuthorization/`,

  UserIsNotAuthorized: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${TrustedSubAppAuthorization.UC_CODE}userIsNotAuthorized`;
      this.message = "User is not authorized.";
    }
  },

  UuSchoolKitIsNotInCorrectState: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${TrustedSubAppAuthorization.UC_CODE}uuSchoolKitIsNotInCorrectState`;
      this.message = "UuSchoolKit is not in active state.";
    }
  },

  AppHasNotSetTrustedSubApps: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${TrustedSubAppAuthorization.UC_CODE}appHasNotSetTrustedSubApps`;
      this.message = "Application has not set trusted subApps.";
    }
  }

};

module.exports = {
  TrustedSubAppAuthorization
};

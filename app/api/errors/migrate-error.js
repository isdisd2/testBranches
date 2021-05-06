"use strict";

const SchoolkitMainUseCaseError = require("./schoolkit-main-use-case-error.js");
const MIGRATE_ERROR_PREFIX = `${SchoolkitMainUseCaseError.ERROR_PREFIX}migrate/`;

const Migrate = {
  UC_CODE: `${MIGRATE_ERROR_PREFIX}migrate/`,

  InvalidDtoIn: class extends SchoolkitMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Migrate.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  }
};

module.exports = {
  Migrate
};

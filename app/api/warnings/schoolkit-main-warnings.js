"use strict";
const Errors = require("../errors/schoolkit-main-error.js");

const Warnings = {
  InitUnsupportedKeys: {
    CODE: `${Errors.Init.UC_CODE}unsupportedKeys`
  },
  UpdateUnsupportedKeys: {
    CODE: `${Errors.Update.UC_CODE}unsupportedKeys`
  },
  SetStateUnsupportedKeys: {
    CODE: `${Errors.SetState.UC_CODE}unsupportedKeys`
  },
  FailedToLoadPrincipalRole: {
    CODE: `${Errors.Load.UC_CODE}failedToLoadPrincipalRole`,
    MESSAGE: "Failed to load detail of principal role."
  },
  createFailedToCreateActivity: {
    code: `${Errors.Init.UC_CODE}failedToCreateActivity`,
    message: "System failed to create new activity.",
  },
};

module.exports = Warnings;

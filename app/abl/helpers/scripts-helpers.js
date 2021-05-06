"use strict";
const { AppClient } = require("uu_appg01_server-client");
const { UriBuilder } = require("uu_appg01_core-uri");
const RUN_SCRIPT_USE_CASE = "/runScript";

let ScriptEngineHelper = {
  async uuSchoolKitFolderCreate(scriptEngineUri, dtoIn, session) {
    let preparedScriptEngineUri = UriBuilder.parse(scriptEngineUri).setUseCase(RUN_SCRIPT_USE_CASE).toString();
    return await AppClient.post(preparedScriptEngineUri, dtoIn, { session });
  },

  async uuSchoolKitSetUnitPermissions(scriptEngineUri, dtoIn, session) {
    await this.sleep(5000); //FIXME: this is only temporary solution! Waiting for BT support
    let preparedScriptEngineUri = UriBuilder.parse(scriptEngineUri).setUseCase(RUN_SCRIPT_USE_CASE).toString();
    return await AppClient.post(preparedScriptEngineUri, dtoIn, { session });
  },

  async uuSchoolKitUpdateStudentToCourse(scriptEngineUri, dtoIn, session) {
    let preparedScriptEngineUri = UriBuilder.parse(scriptEngineUri).setUseCase(RUN_SCRIPT_USE_CASE).toString();
    return await AppClient.post(preparedScriptEngineUri, dtoIn, { session });
  },

  async uuSchoolKitGetAssignmentLogs(scriptEngineUri, dtoIn, session) {
    let preparedScriptEngineUri = UriBuilder.parse(scriptEngineUri).setUseCase(RUN_SCRIPT_USE_CASE).toString();
    return await AppClient.post(preparedScriptEngineUri, dtoIn, { session });
  },

  /**
   * Helper method that pauses execution for specified time.
   * @param miliseconds how long will method execution wait
   * @returns {Promise<void>}
   */
  async sleep(miliseconds) {
    return new Promise((resolve) => {
      setTimeout(resolve, miliseconds);
    });
  },
};

module.exports = ScriptEngineHelper;

const Path = require("path");
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const Errors = require("../../api/errors/assignment-error.js");
const { Schemas, SchoolKit } = require("../common-constants");
const InstanceChecker = require("../../components/instance-checker");
const ConsoleUriHelper = require("../../components/console-uri-helper");
const { Config } = require("uu_appg01_server").Utils;

const ScriptEngineHelper = require("../helpers/scripts-helpers");

const WARNINGS = {};

class GetLogsAbl {
  constructor() {
    this.validator = Validator.load();
    // this.dao = DaoFactory.getDao("assignment");
  }

  async getLogs(uri, dtoIn, session, uuAppErrorMap = {}) {
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    const awid = uri.getAwid();
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.UpdateTask.RemoveStudentCourse,
      allowedStates,
      uuAppErrorMap
    );
    let consoleUri = ConsoleUriHelper.get(uuSchoolKit);

    const scriptDtoIn = {
      scriptUri: Config.get("uuScriptGetAssignmentsLogs"),
      consoleUri,
      scriptDtoIn: {
        assignmentId: dtoIn.id,
        uuSchoolKitBaseUri: uri.getBaseUri().toString(),
      },
    };

    let dtoOut = {};
    try {
      dtoOut = ScriptEngineHelper.uuSchoolKitGetAssignmentLogs(uuSchoolKit.scriptEngineUri, scriptDtoIn, session);
    } catch (e) {
      dtoOut = e;
      //console.log("Error :", e);
    }
    dtoOut.scriptDtoIn = scriptDtoIn;
    dtoOut.uuAppErrorMap = uuAppErrorMap;
    return dtoOut;
  }
}

module.exports = new GetLogsAbl();

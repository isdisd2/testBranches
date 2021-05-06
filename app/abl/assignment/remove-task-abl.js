const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { UriBuilder } = require("uu_appg01_server").Uri;
const { AppClient } = require("uu_appg01_server-client");
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { Schemas, SchoolKit } = require("../common-constants");
const InstanceChecker = require("../../components/instance-checker");

const Errors = require("../../api/errors/assignment-error.js");
const Warnings = require("../../api/warnings/assignment-warnings");

const TYPE_CODE = "uu-schoolkit-schoolg01/assignment";

const STATES = Object.freeze({
  initial: "initial",
  prepared: "prepared",
  active: "active",
  warning: "warning",
  problem: "problem",
  passive: "passive",
  closed: "closed",
});

class RemoveTaskAbl {
  constructor() {
    this.validator = Validator.load();
    this.states = STATES;
    this.typeCode = TYPE_CODE;
    this.dao = DaoFactory.getDao(Schemas.ASSIGNMENT);
  }

  /**
   * Cmd add task to assignment
   * @param uri
   * @param dtoIn
   * @param profileList
   * @param session
   * @param uuAppErrorMap
   * @returns {Promise<void>}
   */

  async removeTask(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();

    // HDS 1 - check schoolkit state
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.Create, allowedStates, uuAppErrorMap);

    // HDS 2 - check dtoIn
    let validationResult = this.validator.validate("removeTaskDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      Warnings.createAssignmenUnsupportedKeys.code,
      Errors.RemoveTask.InvalidDtoIn
    );

    // HDS 3 - check if assignment exists
    const uuAsignment = await this.dao.get(awid, dtoIn.id);
    if (!uuAsignment) {
      throw new Errors.RemoveTask.AssignmentNotFound({ uuAppErrorMap }, { id: dtoIn.id });
    }

    // HDS 4 - check if task exists
    if (!uuAsignment.taskMap[dtoIn.code]) {
      throw new Errors.RemoveTask.AssignmentNotFound({ uuAppErrorMap }, { id: dtoIn.id });
    }

    // HDS 5 - remove task from taskMap
    delete uuAsignment.taskMap[dtoIn.code];

    //HDS 6 - dao update with removed task
    let dtoOut = {};

    try {
      dtoOut = await this.dao.update(uuAsignment);
    } catch (e) {
      throw new Errors.RemoveTask.AddTaskDaoFailed({ uuAppErrorMap }, { cause: e });
    }

    return { ...dtoOut, uuAppErrorMap };
  }
}

module.exports = new RemoveTaskAbl();

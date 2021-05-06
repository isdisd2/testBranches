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

class UpdateTaskAbl {
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

  async updateTask(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();

    // HDS 1 - check schoolkit state
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.Create, allowedStates, uuAppErrorMap);

    // HDS 2 - check dtoIn
    let validationResult = this.validator.validate("updateTaskDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      Warnings.createAssignmenUnsupportedKeys.code,
      Errors.UpdateTask.InvalidDtoIn
    );

    // HDS 3 - check if assignment exists
    const uuAsignment = await this.dao.get(awid, dtoIn.id);
    if (!uuAsignment) {
      throw new Errors.UpdateTask.AssignmentNotFound({ uuAppErrorMap }, { id: dtoIn.id });
    }

    // HDS 4 - check if task exists
    if (!uuAsignment.taskMap[dtoIn.code]) {
      throw new Errors.UpdateTask.AssignmentNotFound({ uuAppErrorMap }, { id: dtoIn.id });
    }



    //HDS 4 - prepare updated task
    let uuTask = uuAsignment.taskMap[dtoIn.code];

    let uuUpdatedTask = {};
    if (dtoIn.pointsStrategy) {
      uuUpdatedTask.data = { pointsStrategy: dtoIn.pointsStrategy };
      delete dtoIn.pointsStrategy;
    }
    uuTask = { ...uuTask, ...uuUpdatedTask, ...dtoIn };

    let task = {};

    task.taskMap = uuAsignment.taskMap;
    task.taskMap[dtoIn.code] = uuTask;
    task.awid = awid;
    task.id = dtoIn.id;

    //HDS 5 - dao create
    let dtoOut = {};

    try {
      dtoOut = await this.dao.update(task);
    } catch (e) {
      throw new Errors.UpdateTask.AddTaskDaoFailed({ uuAppErrorMap }, { cause: e });
    }

    return { ...dtoOut, uuAppErrorMap };
  }
}

module.exports = new UpdateTaskAbl();

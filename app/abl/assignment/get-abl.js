const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
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

class GetAbl {
  constructor() {
    this.validator = Validator.load();
    this.states = STATES;
    this.typeCode = TYPE_CODE;
    this.dao = DaoFactory.getDao(Schemas.ASSIGNMENT);
    this.subjectDao = DaoFactory.getDao(Schemas.SUBJECT);
  }

  /**
   * Cmd create new empty assignment
   * @param uri
   * @param dtoIn
   * @param profileList
   * @param session
   * @param uuAppErrorMap
   * @returns {Promise<void>}
   */
  async get(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();

    // HDS 1
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    await InstanceChecker.ensureInstanceAndState(awid, Errors.Get, allowedStates, uuAppErrorMap);

    // HDS 2
    let validationResult = this.validator.validate("getAssignmentDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      Warnings.getAssignmentUnsupportedKeys.code,
      Errors.Get.InvalidDtoIn
    );

    // HDS 3
    let uuObject;
    if (dtoIn.id) {
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    if (!uuObject) {
      // 2.1
      throw new Errors.Get.AssignmentNotFound({ uuAppErrorMap }, { id: dtoIn.id });
    }

    // HDS 4
    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }
}

module.exports = new GetAbl();

const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { Schemas, SchoolKit } = require("../common-constants");
const AppClientTokenHelper = require("../helpers/app-client-token-helper.js");
const UuBtHelper = require("../helpers/uu-bt-helper");
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

class CreateAbl {
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
   * @returns {Promise<{uuAppErrorMap: (*|{})}>}
   */
  async update(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();

    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.Update, allowedStates, uuAppErrorMap);

    // HDS 2
    let validationResult = this.validator.validate("updateAssignmentDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      Warnings.updateAssignmentUnsupportedKeys.code,
      Errors.Update.InvalidDtoIn
    );

    // HDS 3
    let uuObject;
    if (dtoIn.id) {
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }
    if (!uuObject) {
      // 3.1
      throw new Errors.Update.AssignmentNotFound({ uuAppErrorMap }, { id: dtoIn.id });
    }

    if (uuObject.state === this.states.closed) {
      // 3.2
      throw new Errors.Update.AssignmentIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 5
    const subject = await this.subjectDao.get(awid, uuObject.subjectId);
    if (!subject) {
      // 5.1
      throw new Errors.Update.SubjectNotExists({ uuAppErrorMap }, { id: dtoIn.id });
    }

    if (subject.state === this.states.closed) {
      // 5.2
      throw new Errors.Update.SubjectIsNotInCorrectState({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 4
    if (!profileList.includes("Authorities") && !profileList.includes("Executives")) {
      let roleGroupIfcList = [{ id: uuObject.subjectTeacher }];
      let verifyMyCastExistenceDtoOut = {};

      try {
        const callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
        verifyMyCastExistenceDtoOut = await UuBtHelper.verifyMyCastExistence(
          uuSchoolKit.btBaseUri,
          { roleGroupIfcList: roleGroupIfcList },
          callOpts
        );
      } catch (e) {
        // 4.1
        throw new Errors.Update.CallVerifyMyCastExistenceFailed({ uuAppErrorMap });
      }

      const isSubjectTeacher = verifyMyCastExistenceDtoOut.roleGroupIfcList.find(
        (uuRole) => uuRole.id === uuObject.subjectTeacher
      );

      if (isSubjectTeacher) {
        profileList.push("SubjectTeacher");
      } else {
        // 4.2
        throw new Errors.Update.UserNotAuthorized({ uuAppErrorMap });
      }
    }
    const updateObcDtoIn = {};
    if (dtoIn.name) updateObcDtoIn.name = dtoIn.name;
    if (dtoIn.code) updateObcDtoIn.code = dtoIn.code;
    if (dtoIn.desc) updateObcDtoIn.desc = dtoIn.desc;
    if (Object.keys(updateObcDtoIn).length !== 0) {
      let callOpts = {};
      try {
        callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      } catch (e) {
        // A6
        throw new Errors.Update.AppClientTokenCreateFailed({ uuAppErrorMap }, e);
      }

      const dtoInUuObcSetBasicAttributes = {
        id: uuObject.artifactId,
        ...updateObcDtoIn,
      };

      try {
        // 7.1.A.2.A.
        const artifactEnvironment = await UuBtHelper.uuObc.setBasicAttributes(
          uuSchoolKit.btBaseUri,
          dtoInUuObcSetBasicAttributes,
          callOpts
        );
        // 7.1.A.2.B.
      } catch (e) {
        // 7.1.A.2.B.1.
        throw new Errors.Update.SetBasicUuObcArtifactAttributesFailed({ uuAppErrorMap }, e);
      }
    }

    // HDS 6
    const dtoInUpdated = {
      ...uuObject,
      ...dtoIn,
    };

    let uuObjectUpdated;
    try {
      uuObjectUpdated = await this.dao.update(dtoInUpdated);
    } catch (e) {
      // 6.1
      throw new Errors.Update.AssignmentDaoUpdateFailed({ uuAppErrorMap }, e, { id: dtoIn.id });
    }

    // HDS 7
    return {
      ...uuObjectUpdated,
      uuAppErrorMap,
    };
  }
}

module.exports = new CreateAbl();

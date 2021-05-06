const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const UuBtHelper = require("../helpers/uu-bt-helper.js");
const { Schemas, SchoolKit } = require("../common-constants");
const AppClientTokenHelper = require("../helpers/app-client-token-helper.js");
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

class SetFinalStateAbl {
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
  async setFinalState(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.SetFinalState,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2, 2.1, 2.2
    // 2.2.1, 2.3, 2.3.1
    let validationResult = this.validator.validate("classSetFinalStateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      Warnings.setFinalStateUnsupportedKeys.code,
      Errors.SetFinalState.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    let uuObject;
    // 3.1.A
    if (dtoIn.id) {
      // 3.1.A.1
      uuObject = await this.dao.get(awid, dtoIn.id);
      // 3.1.B
    } else {
      // 3.1.B.1
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4
    // 4.1, 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.SetFinalState.AssignmentNotFound({ uuAppErrorMap });
    }

    // HDS 5, 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1
      throw new Errors.SetFinalState.AssignmentIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6
    // 6.1
    const dtoInUuArtifactIfcListActivities = {
      id: uuObject.artifactId,
    };

    // 6.2
    let callOpts = {};
    const { btBaseUri } = uuSchoolKit;
    let listByArtifactBDtoOut;
    // 6.2.A
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
      listByArtifactBDtoOut = await UuBtHelper.uuArtifactIfc.listActivities(
        btBaseUri,
        dtoInUuArtifactIfcListActivities,
        callOpts
      );

      // 6.2.B
    } catch (e) {
      // 6.2.B.1
      throw new Errors.SetFinalState.ListArtifactActivitiesFailed({ uuAppErrorMap }, e, {
        artifactId: dtoInUuArtifactIfcListActivities.id,
      });
    }

    // 6.3, 6.3.1, 6.3.1.1
    listByArtifactBDtoOut.activityList.forEach((item) => {
      // 6.3.1.1.A.
      if (item.state !== STATES.closed) {
        // 6.3.1.1.A.1.
        throw new Errors.SetFinalState.ExistingActiveActivities({ uuAppErrorMap });
      }
    });

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
        throw new Errors.SetFinalState.CallVerifyMyCastExistenceFailed({ uuAppErrorMap });
      }

      const isSubjectTeacher = verifyMyCastExistenceDtoOut.roleGroupIfcList.find(
        (uuRole) => uuRole.id === uuObject.subjectTeacher
      );

      if (isSubjectTeacher) {
        profileList.push("SubjectTeacher");
      } else {
        // 4.2
        throw new Errors.SetFinalState.UserNotAuthorized({ uuAppErrorMap });
      }
    }

    // HDS 7
    // 7.1
    const dtoInUuObcSetState = {
      id: uuObject.artifactId,
      state: STATES.closed,
      desc: dtoIn.setStateReason,
      data: dtoIn.stateData
    };
    let artifactEnvironment;
    // 7.2, 7.2.A
    try {
      artifactEnvironment = await UuBtHelper.uuObc.setState(btBaseUri, dtoInUuObcSetState, callOpts);
      // 7.2.B.
    } catch (e) {
      // 7.2.B.1.
      throw new Errors.SetFinalState.UuObcSetStateFailed({ uuAppErrorMap }, e);
    }
    // HDS 8
    // 8.1
    // 8.1.A.
    uuObject.state = STATES.closed;
    if (dtoIn.setStateReason !== undefined) {
      const setStateReason = uuObject.setStateReason || [];
      setStateReason.push(dtoIn.setStateReason);
      uuObject.setStateReason = setStateReason;
    }
    try {
      uuObject = await this.dao.update(uuObject);
    } catch (e) {
      // 8.1.B.
      throw new Errors.SetFinalState.AssignmentDaoUpdateFailed({ uuAppErrorMap }, e);
    }

    // HDS 9
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }
}

module.exports = new SetFinalStateAbl();

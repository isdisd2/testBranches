const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const UuBtHelper = require("../helpers/uu-bt-helper.js");
const { Schemas, SchoolKit } = require("../common-constants");
const AppClientTokenHelper = require("../helpers/app-client-token-helper.js");
const InstanceChecker = require("../../components/instance-checker");
const { Activity, TYPES: activityTypes } = require("../../components/activity");
const { AuthenticationService } = require("uu_appg01_server").Authentication;

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

class SetStateAbl {
  constructor() {
    this.validator = Validator.load();
    this.states = STATES;
    this.typeCode = TYPE_CODE;
    this.dao = DaoFactory.getDao(Schemas.ASSIGNMENT);
    this.subjectDao = DaoFactory.getDao(Schemas.SUBJECT);
    this.studentDao = DaoFactory.getDao(Schemas.STUDENT);
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
  async setState(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.SetState, allowedStates, uuAppErrorMap);

    // HDS 2, 2.1, 2.2
    // 2.2.1, 2.3, 2.3.1
    let validationResult = this.validator.validate("setStateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      Warnings.setStateUnsupportedKeys.code,
      Errors.SetState.InvalidDtoIn
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
      throw new Errors.SetState.AssignmentNotFound({ uuAppErrorMap });
    }

    // HDS 5, 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1
      throw new Errors.SetState.AssignmentIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6
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
        // 6.1
        throw new Errors.SetState.CallVerifyMyCastExistenceFailed({ uuAppErrorMap });
      }

      const isSubjectTeacher = verifyMyCastExistenceDtoOut.roleGroupIfcList.find(
        (uuRole) => uuRole.id === uuObject.subjectTeacher
      );

      if (isSubjectTeacher) {
        profileList.push("SubjectTeacher");
      } else {
        // 6.2
        throw new Errors.SetState.UserNotAuthorized({ uuAppErrorMap });
      }
    }

    // HDS 7
    // activity is created by uik 26-2068-1
    //TODO: do it propper way
    let loginSession;
    try {
      let credentials = {
        accessCode1: "835M1R81v9772037-W3cyD4hR678_6zy",
        accessCode2: "2234y3X7Pw6PbCwt1-PdNMhs2353J4u_",
      };
      loginSession = await AuthenticationService.authenticate(credentials);
    } catch (e) {
      throw new Errors.SetState.UserAuthorizationError({ uuAppErrorMap }, e);
    }

    // iteration through taskMap
    // All task - 1 line + link
    // 1 row of desc == uuObject.desc
    // decision of structure by course or book

    if (dtoIn.state === this.states.active) {
      // 7.1.
      if (uuObject.studentMap) {
        if (Object.keys(uuObject.studentMap).length > 0) {
          // create activity for active students only
          const subject = await this.subjectDao.get(awid, uuObject.subjectId);
          let subjectStudentList = [];
          if (subject && subject.studentList) subjectStudentList = subject.studentList;
          subjectStudentList = subjectStudentList
            .filter((student) => student.state === this.states.active)
            .map((student) => student.uuIdentity);

          let createActivityDtoInList = [];
          for (const uuIdentity in uuObject.studentMap) {
            // 7.1.1
            // 7.1.1.1
            if (subjectStudentList.includes(uuIdentity)) {
              createActivityDtoInList.push({
                id: uuObject.artifactId,
                submitterCode: "26-2068-1",
                solverList: [
                  {
                    solverCode: uuIdentity,
                  },
                ],
                type: activityTypes.doIt,
                name: uuObject.name,
                desc: uuObject.desc,
                endTime: uuObject.deadline,
              });
            }
          }
          // 7.1.1.2
          for (const activityDtoIn of createActivityDtoInList) {
            try {
              await Activity.create(activityDtoIn, loginSession, uuSchoolKit.btBaseUri, uri, null, uuAppErrorMap);
            } catch (e) {
              ValidationHelper.addWarning(
                uuAppErrorMap,
                Warnings.createFailedToCreateActivity.code,
                Warnings.createFailedToCreateActivity.message,
                { cause: e }
              );
            }
          }
        }
      }
      // 7.1.2
      const activityDtoIn = {
        id: uuObject.artifactId,
        submitterCode: session.getIdentity().getUuIdentity(),
        solverList: [
          {
            solver: uuObject.subjectTeacher,
          },
        ],
        type: activityTypes.info,
        name: uuObject.name,
        desc: uuObject.desc,
        endTime: uuObject.deadline,
      };
      // 7.1.2.2.
      try {
        await Activity.create(activityDtoIn, loginSession, uuSchoolKit.btBaseUri, uri, null, uuAppErrorMap);
      } catch (e) {
        ValidationHelper.addWarning(
          uuAppErrorMap,
          Warnings.createFailedToCreateActivity.code,
          Warnings.createFailedToCreateActivity.message,
          { cause: e }
        );
      }
    }

    // HDS 6
    // 6.1
    const uuObcSetStateDtoIn = {
      id: uuObject.artifactId,
      state: dtoIn.state,
      desc: dtoIn.setStateReason,
      data: dtoIn.stateData,
    };

    let artifactEnvironment;
    let callOpts;
    try {
      // 6.2
      // 6.2.A
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      artifactEnvironment = await UuBtHelper.uuObc.setState(uuSchoolKit.btBaseUri, uuObcSetStateDtoIn, callOpts);
    } catch (e) {
      // 6.2.B
      // 6.2.B.1
      throw new Errors.SetState.UuObcSetStateFailed({ uuAppErrorMap }, e);
    }

    // HDS 7
    if (dtoIn.setStateReason !== undefined) {
      const setStateReason = uuObject.setStateReason || [];
      setStateReason.push(dtoIn.setStateReason);
      uuObject.setStateReason = setStateReason;
    }
    try {
      // 7.1
      // 7.1.A
      uuObject = await this.dao.update({ ...uuObject, state: dtoIn.state });
    } catch (e) {
      // 7.1.B
      // 7.1.B.1
      throw new Errors.SetState.AssignmentDaoUpdateFailed({ uuAppErrorMap }, e);
    }

    // HDS 9
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }
}

module.exports = new SetStateAbl();

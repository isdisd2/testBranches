"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { UriBuilder } = require("uu_appg01_server").Uri;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { Schemas, SchoolKit } = require("../common-constants");
const AppClientTokenHelper = require("../helpers/app-client-token-helper.js");
const UuBtHelper = require("../helpers/uu-bt-helper");
const InstanceChecker = require("../../components/instance-checker");
const crypto = require("crypto");

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
   * @returns {Promise<void>}
   */
  async create(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();

    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.Create, allowedStates, uuAppErrorMap);

    // HDS 2
    let validationResult = this.validator.validate("createAssignmentDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      Warnings.createAssignmenUnsupportedKeys.code,
      Errors.Create.InvalidDtoIn
    );

    const uuSubject = await this.subjectDao.get(awid, dtoIn.subjectId);
    if (!uuSubject) {
      throw new Errors.Create.SubjectNotFound({ uuAppErrorMap }, { id: dtoIn.subjectId });
    }

    if (uuSubject.state === this.states.closed) {
      throw new Errors.Create.SubjectIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuSubject.id, state: uuSubject.state }
      );
    }

    // HDS 6
    let callOpts;
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
    } catch (e) {
      throw new Errors.Create.CallVerifyMyCastExistenceFailed({ uuAppErrorMap }, e);
    }
    if (!profileList.includes("Authorities") && !profileList.includes("Executives")) {
      const roleGroupIfcList = [{ id: uuSubject.subjectTeacher }];

      let verifyMyCastExistenceDtoOut = {};
      try {
        verifyMyCastExistenceDtoOut = await UuBtHelper.verifyMyCastExistence(
          uuSchoolKit.btBaseUri,
          { roleGroupIfcList: roleGroupIfcList },
          callOpts
        );
      } catch (e) {
        throw new Errors.Create.CallVerifyMyCastExistenceFailed({ uuAppErrorMap }, e);
      }

      // 6.4
      if (verifyMyCastExistenceDtoOut.roleGroupIfcList.length === 0) {
        throw new Errors.Create.UserNotAuthorized({ uuAppErrorMap });
      }
    }
    let uuObject;
    let code;
    let shortSubjectName;
    if (uuSubject.code > 10) {
      shortSubjectName = uuSubject.code.substring(0, 10);
    } else {
      shortSubjectName = uuSubject.code;
    }

    code = shortSubjectName + "_Assignment_" + crypto.randomBytes(10).toString("hex");
    const assignmentsDtoIn = {
      awid,
      code: code,
      name: dtoIn.name,
      desc: dtoIn.desc,
      state: STATES.initial,
      subjectId: uuSubject.id.toString(),
      subjectTeacher: uuSubject.subjectTeacher,
      from: dtoIn.from,
      deadline: dtoIn.deadline,
    };

    if (dtoIn.addSubjectStudents && uuSubject.studentList) {
      let studentMap = {};
      uuSubject.studentList.forEach((student) => {
        if (student.state === "active") {
          studentMap[student.uuIdentity] = { id: student.id };
        }
      });
      assignmentsDtoIn.studentMap = studentMap;
    }

    try {
      uuObject = await this.dao.create(assignmentsDtoIn);
    } catch (e) {
      throw new Errors.Create.AssignmentCreateDaoFailed({ uuAppErrorMap }, e);
    }

    let artifactEnvironment;
    const uuObUri = UriBuilder.parse(uri)
      .setUseCase("assignmentDetail")
      .setParameters({ id: uuObject.id.toString() })
      .toUri()
      .toString();
    let uuObcCreateDtoIn = {
      typeCode: this.typeCode,
      code: dtoIn.code,
      name: dtoIn.name,
      desc: dtoIn.desc,
      location: uuSubject.assignmentsFolder,
      uuObId: uuObject.id,
      uuObUri,
      competentRole: uuSubject.subjectTeacher,
    };

    try {
      artifactEnvironment = await UuBtHelper.uuObc.create(uuSchoolKit.btBaseUri, uuObcCreateDtoIn, callOpts);
    } catch (e) {
      // 12.2.B
      // 12.2.B.1
      try {
        // 12.2.B.1.A
        await this.dao.delete(awid, uuObject.id);
      } catch (e) {
        // 12.2.B.1.B
        // 12.2.B.1.B.1
        ValidationHelper.addWarning(
          uuAppErrorMap,
          Warnings.createFailedToDeleteAfterRollback.code,
          Warnings.createFailedToDeleteAfterRollback.message,
          { cause: e }
        );
      }
      // 12.2.B.2
      this._throwCorrespondingError(e, uuAppErrorMap);
    }

    if (artifactEnvironment) {
      try {
        uuObject = await this.dao.update({ ...uuObject, artifactId: artifactEnvironment.id });
        // 4.1.B.
      } catch (e) {
        // 4.1.B.1.
        throw new Errors.Create.AssignmentDaoUpdateFailed({ uuAppErrorMap }, { awid }, e);
      }
    }

    return {
      ...uuObject,
      uuSubject,
      uuAppErrorMap,
    };
  }

  _throwCorrespondingError(e, uuAppErrorMap) {
    let error;
    switch (e.code) {
      case "invalidHomeFolderState":
        error = new Errors.Create.LocationIsNotInProperState({ uuAppErrorMap }, e);
        break;
      case "locationDoesNotExist":
        error = new Errors.Create.FolderDoesNotExist({ uuAppErrorMap }, e);
        break;
      case "userIsNotAuthorizedToAddArtifact":
        error = new Errors.Create.UserIsNotAuthorizedToAddArtifact({ uuAppErrorMap }, e);
        break;
      default:
        error = new Errors.Create.CallUuObcCreateFailed({ uuAppErrorMap }, e);
        break;
    }
    throw error;
  }
}

module.exports = new CreateAbl();

"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { Schemas, SchoolKit } = require("../common-constants");
const AppClientTokenHelper = require("../helpers/app-client-token-helper.js");
const UuBtHelper = require("../helpers/uu-bt-helper");
const InstanceChecker = require("../../components/instance-checker");
const StudentDetail = require("../../components/assignment-load-student-detail");
const Errors = require("../../api/errors/assignment-error.js");
const Warnings = require("../../api/warnings/assignment-warnings");

const DEFAULT_PAGE_INFO = {
  pageIndex: 0,
  pageSize: 1000,
};

class LoadAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao(Schemas.ASSIGNMENT);
    this.subjectDao = DaoFactory.getDao(Schemas.SUBJECT);
    this.studentDao = DaoFactory.getDao(Schemas.STUDENT);
  }

  async load(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();

    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.Load, allowedStates, uuAppErrorMap);

    // HDS 2
    let validationResult = this.validator.validate("loadAssignmentDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      Warnings.loadAssignmenUnsupportedKeys.code,
      Errors.Load.InvalidDtoIn
    );

    let uuObject;
    if (dtoIn.id) {
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    if (!uuObject) {
      throw new Errors.Load.AssignmentNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    const uuSubject = await this.subjectDao.get(awid, uuObject.subjectId);
    if (!uuSubject) {
      throw new Errors.Load.SubjectNotFound({ uuAppErrorMap }, { id: uuObject.subjectId });
    }
    let callOpts = {};
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
    } catch (e) {
      throw new Errors.Load.FailedToLoadUuObcEnvironment({ uuAppErrorMap }, { cause: "callOpts crate failed" });
    }

    if (!profileList.includes("Authorities") && !profileList.includes("Executives")) {
      const userIdentity = session.getIdentity().getUuIdentity();
      let roleGroupIfcList = [{ id: uuObject.subjectTeacher }];

      let verifyMyCastExistenceDtoOut = {};

      try {
        verifyMyCastExistenceDtoOut = await UuBtHelper.verifyMyCastExistence(
          uuSchoolKit.btBaseUri,
          { roleGroupIfcList: roleGroupIfcList },
          callOpts
        );
      } catch (e) {
        throw new Errors.Load.CallVerifyMyCastExistenceFailed({ uuAppErrorMap });
      }

      const isSubjectTeacher = verifyMyCastExistenceDtoOut.roleGroupIfcList.find(
        (uuRole) => uuRole.id === uuObject.subjectTeacher
      );

      if (isSubjectTeacher) {
        profileList.push("SubjectTeacher");
      }

      let isSubjectStudent;
      if (uuSubject.studentList) {
        isSubjectStudent = uuSubject.studentList.find((student) => student.uuIdentity === userIdentity);
        if (isSubjectStudent) {
          profileList.push("SubjectStudent");
        }
      }

      if (profileList.length === 1 && profileList[0] === "StandardUsers") {
        throw new Errors.Load.UserNotAuthorized({ uuAppErrorMap });
      }
    }

    let artifactEnvironment = {};
    const loadEnvDtoIn = { id: uuObject.artifactId };
    try {
      artifactEnvironment = await UuBtHelper.uuObc.loadEnvironment(uuSchoolKit.btBaseUri, loadEnvDtoIn, callOpts);
    } catch (e) {
      // 6.2.B.
      // 6.2.B.1.
      throw new Errors.Load.FailedToLoadUuObcEnvironment({ uuAppErrorMap }, e);
    }

    uuObject = await StudentDetail.loadDetails(uuObject, this.studentDao);

    return { ...uuObject, subject: uuSubject, uuAppErrorMap, profileList, artifactEnvironment };
  }
}

module.exports = new LoadAbl();

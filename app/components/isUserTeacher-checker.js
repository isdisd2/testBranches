"use strict";
// template: uuCommand
// templateVersion: 0.1.0
// documentation:
//@@viewOn:revision
// coded: Branislav Dolny (13-2838-1), 30/10/2020
//@@viewOff:revision

//@@viewOn:imports
const AppClientTokenHelper = require("../abl/helpers/app-client-token-helper");
const UuBtHelper = require("../abl/helpers/uu-bt-helper");
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { Schemas } = require("../abl/common-constants");
//@@viewOff:imports

//@@viewOn:constants
const STATES = Object.freeze({
  initial: "initial",
  active: "active",
  prepared: "prepared",
  warning: "warning",
  problem: "problem",
  passive: "passive",
  closed: "closed",
  former: "former"
});
//@@viewOff:constants

//@@viewOn:component
class IsUserTeacherChecker {
  constructor() {
    this.subjectDao = DaoFactory.getDao(Schemas.SUBJECT);
    this.studentDao = DaoFactory.getDao(Schemas.STUDENT);
    this.classDao = DaoFactory.getDao(Schemas.CLASS);
    this.states = STATES;
  }

  async checkIfUserIsTeacher(
    uri,
    student,
    uuClass = null,
    uuSchoolKit,
    callOpts = null,
    session,
    profileList,
    errors,
    uuAppErrorMap = {}
  ) {
    if (!uuClass) {
      uuClass = await this.classDao.getStudentCurrentClass(uuSchoolKit.awid, student.id.toString());
    }
    let roleGroupIfcList = [];
    uuClass && roleGroupIfcList.push({ id: uuClass.classTeacher });
    let uuSubjectList = await this.subjectDao.listByStudentId(uuSchoolKit.awid, student.id.toString());
    uuSubjectList.itemList.forEach(subject => {
      if (subject.studentList.find(student => student.state !== this.states.closed)) {
        roleGroupIfcList.push({ id: subject.subjectTeacher });
      }
    });
    let verifyMyCastExistenceDtoOut;
    if (roleGroupIfcList.length) {
      try {
        if (!callOpts) {
          callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
        }
        verifyMyCastExistenceDtoOut = await UuBtHelper.verifyMyCastExistence(
          uuSchoolKit.btBaseUri,
          { roleGroupIfcList },
          callOpts
        );
      } catch (e) {
        throw new errors.CallVerifyMyCastExistenceFailed({ uuAppErrorMap }, e);
      }
    }
    if (
      verifyMyCastExistenceDtoOut &&
      verifyMyCastExistenceDtoOut.roleGroupIfcList.find(uuRole => uuRole.id === uuClass.classTeacher)
    ) {
      profileList.push("ClassTeacher");
    }
    if (verifyMyCastExistenceDtoOut && verifyMyCastExistenceDtoOut.roleGroupIfcList.length) {
      profileList.push("SubjectTeacher");
    }

    return profileList;
  }
}
//@@viewOff:component

//@@viewOn:exports
module.exports = new IsUserTeacherChecker();
//@@viewOff:exports

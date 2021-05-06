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

class ListAbl {
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
   * @returns {Promise<{uuAppErrorMap: (*|{})}>}
   */
  async list(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();

    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.List, allowedStates, uuAppErrorMap);

    // HDS 2
    let validationResult = this.validator.validate("listAssignmentDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      Warnings.listAssignmentUnsupportedKeys.code,
      Errors.List.InvalidDtoIn
    );

    const filter = { awid };
    if (dtoIn.filterMap && dtoIn.filterMap.subjectId) {
      filter.subjectId = dtoIn.filterMap.subjectId;
    }
    if (dtoIn.filterMap && dtoIn.filterMap.subjectTeacherId) {
      //TODO ak chceme zistovat podla teacher id (nie id jeho role) tak je potrebne zistit v ktorych rolach je castnuty, a .....
    }

    let student;
    if (dtoIn.filterMap && dtoIn.filterMap.studentId) {
      student = await this.studentDao.get(awid, dtoIn.filterMap.studentId);
      if (student) {
        filter.uuIdentity = student.uuIdentity;
      }
    }

    let uuObjectList = await this.dao.list(
      filter,
      dtoIn.pageInfo || {
        pageIndex: 0,
        pageSize: 100,
      }
    );

    // we need student detail on route studentDetail in Student Assignments component
    if (student) {
      uuObjectList.itemList = uuObjectList.itemList.map((assignment) => {
        return {
          ...assignment,
          studentDetail: {
            uuIdentity: student.uuIdentity,
            id: student.id,
            name: student.name,
            surname: student.surname,
          },
        };
      });
    }

    // HDS xxxx, get subject name to display it on student detail route in assigments list
    if (dtoIn.filterMap && dtoIn.filterMap.studentId && uuObjectList && uuObjectList.itemList.length > 0) {
      const listOfSubjects = await this.subjectDao.listByStudentId(awid, dtoIn.filterMap.studentId);
      uuObjectList.itemList = uuObjectList.itemList.map((assignment) => {
        const subject = listOfSubjects.itemList.find((subject) => subject.id.toString() === assignment.subjectId);
        if (subject) {
          return { ...assignment, subjectName: subject.name };
        } else {
          throw new Errors.List.SubjectNotFound({ uuAppErrorMap }, { id: assignment.subjectId });
        }
      });
    }

    // HDS 3
    if (!profileList.includes("Authorities") && !profileList.includes("Executives")) {
      let isStudentOnAssignment;
      const userUuIdentity = session.getIdentity().getUuIdentity();

      const teacherRolesIdFromAssignments = [];
      if (uuObjectList && uuObjectList.itemList) {
        uuObjectList.itemList.forEach((assignment) => {
          teacherRolesIdFromAssignments.push({ id: assignment.subjectTeacher });
          if (assignment.studentMap && Object.prototype.hasOwnProperty.call(assignment.studentMap, userUuIdentity)) {
            isStudentOnAssignment = true;
          }
        });
      }

      let verifyMyCastExistenceDtoOut = {};
      try {
        const callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
        verifyMyCastExistenceDtoOut = await UuBtHelper.verifyMyCastExistence(
          uuSchoolKit.btBaseUri,
          { roleGroupIfcList: teacherRolesIdFromAssignments },
          callOpts
        );
      } catch (e) {
        // 3.1
        throw new Errors.List.CallVerifyMyCastExistenceFailed({ uuAppErrorMap });
      }

      if (verifyMyCastExistenceDtoOut.roleGroupIfcList && verifyMyCastExistenceDtoOut.roleGroupIfcList.length) {
        profileList.push("SubjectTeacher");
      }

      if (isStudentOnAssignment) {
        profileList.push("Student");
      }

      if (profileList.length === 1 && profileList[0] === "StandardUsers") {
        throw new Errors.List.UserNotAuthorized({ uuAppErrorMap });
      }
    }

    // HDS 5
    return {
      ...uuObjectList,
      uuAppErrorMap,
    };
  }
}

module.exports = new ListAbl();

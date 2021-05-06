const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { Schemas, SchoolKit } = require("../common-constants");
const InstanceChecker = require("../../components/instance-checker");
const StudentDetail = require("../../components/assignment-load-student-detail");
const Errors = require("../../api/errors/assignment-error.js");
const Warnings = require("../../api/warnings/assignment-warnings");

const TYPE_CODE = "uu-schoolkit-schoolg01/assignment";

const DEFAULT_PAGE_INFO = {
  pageIndex: 0,
  pageSize: 1000,
};

const STATES = Object.freeze({
  initial: "initial",
  prepared: "prepared",
  active: "active",
  warning: "warning",
  problem: "problem",
  passive: "passive",
  closed: "closed",
});

class AddStudentsAbl {
  constructor() {
    this.validator = Validator.load();
    this.states = STATES;
    this.typeCode = TYPE_CODE;
    this.dao = DaoFactory.getDao(Schemas.ASSIGNMENT);
    this.subjectDao = DaoFactory.getDao(Schemas.SUBJECT);
    this.studentDao = DaoFactory.getDao(Schemas.STUDENT);
  }

  async addStudents(uri, dtoIn, authResult, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    await InstanceChecker.ensureInstanceAndState(awid, Errors.AddStudents, allowedStates, uuAppErrorMap);

    // HDS 2, 2.2
    let validationResult = this.validator.validate("assignmentAddStudentsDtoInType", dtoIn);
    // 2.2.1, 2.3, 2.3.1
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      Warnings.addStudentsUnsupportedKeys.code,
      Errors.AddStudents.InvalidDtoIn
    );

    // HDS 3
    let uuObject;
    // 3.1, 3.1.A
    if (dtoIn.id) {
      // 3.1.A.1
      uuObject = await this.dao.get(awid, dtoIn.id);
      // 3.1.B
    } else {
      // 3.1.B.1
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4
    // 4.1
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.AddStudents.AssignmentNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // 4.2
    if (uuObject.state === this.states.closed) {
      // 4.2.A
      throw new Errors.AddStudents.AssignmentIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 5
    // 5.1
    const uuSubject = await this.subjectDao.get(awid, uuObject.subjectId);
    if (!uuSubject) {
      // 5.1.A
      throw new Errors.AddStudents.SubjectNotFound({ uuAppErrorMap }, { id: uuObject.subjectId });
    }

    // HDS 6
    // 6.1, 6.2, 6.3, 6.4
    let studentMap = uuObject.studentMap || {};

    const studentsDetails = await this.studentDao.listByIds(awid, dtoIn.studentList, DEFAULT_PAGE_INFO);
    const studentIsMissingAtAll = [];
    const studentIsNotSubjectStudent = [];

    if (studentsDetails && studentsDetails.itemList) {
      studentsDetails.itemList.forEach((student) => {
        const studentId = student.id.toString();
        if (!dtoIn.studentList.includes(studentId)) {
          studentIsMissingAtAll.push(studentId);
        }

        if (uuSubject.studentList) {
          let isInSubject = uuSubject.studentList.find((subjectStudent) => subjectStudent.id === studentId);
          if (!isInSubject) {
            studentIsNotSubjectStudent.push(studentId);
          }
        }

        studentMap[student.uuIdentity] = { id: studentId };
      });
    }

    if (studentIsMissingAtAll.length) {
      throw new Errors.AddStudents.StudentNotFound({ uuAppErrorMap }, { id: studentIsMissingAtAll });
    }

    if (studentIsNotSubjectStudent.length) {
      throw new Errors.AddStudents.StudentNotFoundOnSubject(
        { uuAppErrorMap },
        { id: studentIsNotSubjectStudent, subjectId: dtoIn.subjectId }
      );
    }

    // HDS 7
    // 7.1
    try {
      // 7.1.A.
      uuObject = await this.dao.addStudents({ awid, id: uuObject.id }, studentMap);
    } catch (e) {
      // 7.1.B.
      // 7.1.B.1.
      throw new Errors.AddStudents.SubjectDaoAddStudentsFailed({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    uuObject = await StudentDetail.loadDetails(uuObject, this.studentDao);

    // HDS 9
    return { ...uuObject, uuAppErrorMap };
  }
}

module.exports = new AddStudentsAbl();

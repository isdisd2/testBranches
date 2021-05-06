const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { Schemas, SchoolKit } = require("../common-constants");
const InstanceChecker = require("../../components/instance-checker");
const StudentDetail = require("../../components/assignment-load-student-detail");

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
  get NonFinalStatesWithoutPassive() {
    return new Set([
      this.States.INITIAL,
      this.States.ACTIVE,
      this.States.PREPARED,
      this.States.WARNING,
      this.States.PROBLEM,
    ]);
  },
});

class RemoveStudentAbl {
  constructor() {
    this.validator = Validator.load();
    this.states = STATES;
    this.typeCode = TYPE_CODE;
    this.dao = DaoFactory.getDao(Schemas.ASSIGNMENT);
    this.subjectDao = DaoFactory.getDao(Schemas.SUBJECT);
    this.studentDao = DaoFactory.getDao(Schemas.STUDENT);
  }

  async removeStudent(uri, dtoIn, authResult, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    await InstanceChecker.ensureInstanceAndState(awid, Errors.RemoveStudent, allowedStates, uuAppErrorMap);

    // HDS 2, 2.2
    let validationResult = this.validator.validate("assignmnetRemoveStudentDtoInType", dtoIn);
    // 2.2.1, 2.3, 2.3.1
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      Warnings.removeStudentUnsupportedKeys.code,
      Errors.RemoveStudent.InvalidDtoIn
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
      throw new Errors.RemoveStudent.AssignmentNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // 4.2
    // 4.2.A.
    if (uuObject.state === this.states.closed) {
      // 4.2.A.1.
      throw new Errors.RemoveStudent.AssignmentIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 5
    const studentId = dtoIn.studentId;

    const uuStudent = await this.studentDao.get(awid, studentId);
    if (!uuStudent) {
      // 5.1.A.1.
      throw new Errors.RemoveStudent.StudentNotFound({ uuAppErrorMap }, { id: studentId });
    }

    let studentToRemove = uuObject.studentMap && uuObject.studentMap[uuStudent.uuIdentity];
    // 5.2.A.
    if (!studentToRemove) {
      // 5.2.A.1.
      throw new Errors.RemoveStudent.StudentNotFoundOnAssignment({ uuAppErrorMap }, { id: studentId });
    }

    // HDS 6
    // 7.1
    try {
      // 6.1.A.
      uuObject = await this.dao.removeStudent({ awid, id: uuObject.id }, uuStudent.uuIdentity);
    } catch (e) {
      // 6.1.B.
      // 6.1.B.1.
      throw new Errors.RemoveStudent.AssignmentDaoRemoveStudentFailed({ uuAppErrorMap }, e, {
        id: dtoIn.id,
        code: dtoIn.code,
      });
    }

    uuObject = await StudentDetail.loadDetails(uuObject, this.studentDao);

    return { ...uuObject, uuAppErrorMap };
  }
}

module.exports = new RemoveStudentAbl();

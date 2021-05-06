"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const Errors = require("../api/errors/subject-error.js");
const { UriBuilder } = require("uu_appg01_server").Uri;
const { Config } = require("uu_appg01_server").Utils;
const TeacherAbl = require("./teacher-abl.js");
const AppClientTokenHelper = require("./helpers/app-client-token-helper.js");
const UuBtHelper = require("./helpers/uu-bt-helper.js");
const ScriptEngineHelper = require("./helpers/scripts-helpers");
const StudentAbl = require("./student-abl.js");
const InstanceChecker = require("../components/instance-checker");
const StateChecker = require("../components/state-checker");
const UserRoleChecker = require("../components/user-roles-checker");
const IsUserTeacher = require("../components/isUserTeacher-checker");
const TeacherDetail = require("../components/teacher-detail");
const { Activity, TYPES: activityTypes, dateFunctions } = require("../components/activity");
const { Schemas, SchoolKit, Class, Subject } = require("./common-constants");
const ConsoleUriHelper = require("../components/console-uri-helper");
const TrustedSubAppAuthorization = require("../components/trusted-sub-app-authorization");
const { LoggerFactory } = require("uu_appg01_server").Logging;

const logger = LoggerFactory.get("UuSchoolKit.Model.Subject");

const TYPE_CODE = "uu-schoolkit-schoolg01/subject";

const STATES = Object.freeze({
  initial: "initial",
  prepared: "prepared",
  active: "active",
  warning: "warning",
  problem: "problem",
  passive: "passive",
  closed: "closed",
});

const ACTIVE_STATES = [STATES.initial, STATES.active, STATES.warning, STATES.problem, STATES.prepared];

const DEFAULT_PAGE_INFO = {
  pageIndex: 0,
  pageSize: 1000,
};
const WARNINGS = {
  createUnsupportedKeys: {
    code: `${Errors.Create.UC_CODE}unsupportedKeys`,
  },
  createFailedToDeleteAfterRollback: {
    code: `${Errors.Create.UC_CODE}failedToDeleteAfterRollback`,
    message: "System failed to delete uuObject after an exception has been thrown in uuObcIfc/create use case.",
  },
  createFailedToCreateActivity: {
    code: `${Errors.Create.UC_CODE}failedToCreateActivity`,
    message: "System failed to create new activity.",
  },
  getUnsupportedKeys: {
    code: `${Errors.Get.UC_CODE}unsupportedKeys`,
  },
  loadUnsupportedKeys: {
    code: `${Errors.Load.UC_CODE}unsupportedKeys`,
  },
  listByClassUnsupportedKeys: {
    code: `${Errors.ListByClass.UC_CODE}unsupportedKeys`,
  },
  listByTeacherUnsupportedKeys: {
    code: `${Errors.ListByTeacher.UC_CODE}unsupportedKeys`,
  },
  listByStudentUnsupportedKeys: {
    code: `${Errors.ListByStudent.UC_CODE}unsupportedKeys`,
  },
  updateUnsupportedKeys: {
    code: `${Errors.Update.UC_CODE}unsupportedKeys`,
  },
  updateBySubjectTeacherUnsupportedKeys: {
    code: `${Errors.UpdateBySubjectTeacher.UC_CODE}unsupportedKeys`,
  },
  setStateUnsupportedKeys: {
    code: `${Errors.SetState.UC_CODE}unsupportedKeys`,
  },
  setFinalStateUnsupportedKeys: {
    code: `${Errors.SetFinalState.UC_CODE}unsupportedKeys`,
  },
  addStudentsUnsupportedKeys: {
    code: `${Errors.AddStudents.UC_CODE}unsupportedKeys`,
  },
  addStudentsStudentIsNotClassStudent: {
    code: `${Errors.AddStudents.UC_CODE}studentIsNotClassStudent`,
  },
  addStudentsStudentIsAlreadyInSubject: {
    code: `${Errors.AddStudents.UC_CODE}studentIsAlreadyInSubject`,
  },
  addStudentsStudentNotFound: {
    code: `${Errors.AddStudents.UC_CODE}studentNotFound`,
  },
  addStudentsStudentIsNotInCorrectState: {
    code: `${Errors.AddStudents.UC_CODE}studentIsNotInCorrectState`,
  },
  addStudentsStudentIsAlreadyInOtherClassInAcitveState: {
    code: `${Errors.AddStudents.UC_CODE}studentIsAlreadyInOtherClassInAcitveState`,
  },
  removeStudentUnsupportedKeys: {
    code: `${Errors.RemoveStudent.UC_CODE}unsupportedKeys`,
  },
  removeStudentStudentIsNotInSubject: {
    code: `${Errors.RemoveStudent.UC_CODE}studentIsNotInSubject`,
  },
  removeStudentStudentIsFormerSubjectStudent: {
    code: `${Errors.RemoveStudent.UC_CODE}studentIsFormerSubjectStudent`,
  },
  deleteUnsupportedKeys: {
    code: `${Errors.Delete.UC_CODE}unsupportedKeys`,
  },
  AddStudentCourseUnsupportedKeys: {
    code: `${Errors.AddStudentCourse.UC_CODE}unsupportedKeys`,
  },
  RemoveStudentCourseUnsupportedKeys: {
    code: `${Errors.RemoveStudentCourse.UC_CODE}unsupportedKeys`,
  },
  addCourseUnsupportedKeys: {
    code: `${Errors.AddCourse.UC_CODE}unsupportedKeys`,
  },
  removeCourseUnsupportedKeys: {
    code: `${Errors.RemoveCourse.UC_CODE}unsupportedKeys`,
  },
  teacherAlreadyExist: {
    code: `${Errors.Create.UC_CODE}teacherAlreadyExist`,
    message: "Teacher already exist.",
  },
};

class SubjectAbl {
  constructor() {
    this.validator = Validator.load();
    this.typeCode = TYPE_CODE;
    this.states = STATES;
    this.dao = DaoFactory.getDao(Schemas.SUBJECT);
    this.classDao = DaoFactory.getDao(Schemas.CLASS);
    this.studentDao = DaoFactory.getDao(Schemas.STUDENT);
    this.teacherDao = DaoFactory.getDao(Schemas.TEACHER);
    this.schoolKitDao = DaoFactory.getDao(Schemas.SCHOOLKIT);
    this.schoolYearDao = DaoFactory.getDao(Schemas.SCHOOL_YEAR);
  }

  async removeStudentCourse(awid, dtoIn, uuAppErrorMap = {}) {
    // HDS 1, 1.1, 1.2, 1.2.A, 1.2.A.1, 1.3, 1.3.A, 1.3.A.1
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.RemoveStudentCourse,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2
    let validationResult = this.validator.validate("subjectRemoveStudentCourseDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.RemoveStudentCourseUnsupportedKeys.code,
      Errors.RemoveStudentCourse.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    let uuObject;
    //   3.1.A.
    if (dtoIn.id) {
      // 3.1.A.1.
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      // 3.1.B.
      // 3.1.B.1.
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.RemoveStudentCourse.SubjectNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.RemoveStudentCourse.SubjectIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6

    let uuSchoolKitDoesHaveAppUri;
    if (uuSchoolKit.appMap && uuSchoolKit.appMap.length) {
      uuSchoolKitDoesHaveAppUri = uuSchoolKit.appMap.find((app) => app.uri === dtoIn.appUri);
    }
    if (uuSchoolKitDoesHaveAppUri === undefined) {
      // 7.1.A.1
      throw new Errors.RemoveStudentCourse.CourseIsNotRegistered(
        { uuAppErrorMap },
        { id: uuObject.id, appUri: dtoIn.appUri }
      );
    }

    if (uuObject.studentList && uuObject.studentList.length > 0) {
      dtoIn.studentList.forEach((studentFromDtoIn) => {
        uuObject.studentList.forEach((student) => {
          if (studentFromDtoIn.id === student.id && student.courses) {
            student.courses = student.courses.filter((course) => course.uri !== dtoIn.appUri);
          }
        });
      });
    }
    // HDS 7
    // 7.1

    // 7.1.A
    try {
      uuObject = await this.dao.update({ ...uuObject });
      // 7.1.B
    } catch (e) {
      // 7.1.B.1
      throw new Errors.RemoveStudentCourse.SubjectUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    return { ...uuObject, uuAppErrorMap };
  }

  /**
   *
   * @param uri
   * @param dtoIn
   * @param profileList
   * @param session
   * @param uuAppErrorMap
   * @returns {Promise<void>}
   */
  async removeCourse(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.RemoveCourse,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2
    let validationResult = this.validator.validate("subjectRemoveCourseDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.removeCourseUnsupportedKeys.code,
      Errors.RemoveCourse.InvalidDtoIn
    );
    // HDS 3
    // 3.1
    let uuObject;
    //   3.1.A.
    if (dtoIn.id) {
      // 3.1.A.1.
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      // 3.1.B.
      // 3.1.B.1.
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.RemoveCourse.SubjectNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.RemoveCourse.SubjectIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6
    if (!profileList.includes("Authorities") && !profileList.includes("Executives")) {
      // 6.1
      const roleGroupIfcList = [{ id: uuObject.subjectTeacher }];
      // 6.2

      let verifyMyCastExistenceDtoOut = {};
      try {
        //6.3, 6.3.A
        const callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
        verifyMyCastExistenceDtoOut = await UuBtHelper.verifyMyCastExistence(
          uuSchoolKit.btBaseUri,
          { roleGroupIfcList: roleGroupIfcList },
          callOpts
        );
      } catch (e) {
        // 6.3.B, 6.3.B.1
        throw new Errors.RemoveCourse.CallVerifyMyCastExistenceFailed({ uuAppErrorMap }, e);
      }

      // 6.4
      if (verifyMyCastExistenceDtoOut.roleGroupIfcList.length === 0) {
        throw new Errors.RemoveCourse.UserNotAuthorized({ uuAppErrorMap });
      }
    }

    // HDS 7, 7.1, 7.1.A
    let subjectDoesHaveAppUri = uuObject.appMap && uuObject.appMap.find((app) => app.uri === dtoIn.appUri);
    if (subjectDoesHaveAppUri === undefined) {
      // 7.1.A.1
      throw new Errors.RemoveCourse.CourseIsNotRegistered({ uuAppErrorMap }, { id: uuObject.id, appUri: dtoIn.appUri });
    }

    if (uuObject.studentList && uuObject.studentList.length > 0) {
      // HDS 8

      let studentListDtoIn = [];
      uuObject.studentList.forEach((student) => {
        if (student.state !== "former") studentListDtoIn.push({ uuIdentity: student.uuIdentity, id: student.id });
      });

      const uuCKcallOpts = await AppClientTokenHelper.createToken(uri, dtoIn.appUri, session);
      let consoleUri = ConsoleUriHelper.get(uuSchoolKit);

      for (let student of studentListDtoIn) {
        const scriptDtoIn = {
          scriptUri: Config.get("uuScriptUnregisterStudentFromCourse"),
          consoleUri,
          scriptDtoIn: {
            subjectId: uuObject.id.toString(),
            uuSchoolKitBaseUri: uri.toString(),
            studentList: [student],
            uuCkBaseUri: dtoIn.appUri,
            callOpts: uuCKcallOpts,
          },
        };
        logger.error(`Remove course: ${JSON.stringify(scriptDtoIn)}`);
        try {
          ScriptEngineHelper.uuSchoolKitUpdateStudentToCourse(uuSchoolKit.scriptEngineUri, scriptDtoIn, session);
        } catch (e) {
          logger.error(`Remove course failed: ${JSON.stringify(e)}`);
        }
      }
    }

    // HDS 9, 9.1
    const appMap = [];
    uuObject.appMap.forEach((app) => {
      if (app.uri !== dtoIn.appUri) {
        appMap.push(app);
      }
    });

    try {
      uuObject = await this.dao.update({ ...uuObject, appMap });
      // 9.1.B
    } catch (e) {
      // 9.1.B.1
      throw new Errors.RemoveCourse.SubjectUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }

  /**
   * add uuCourseKit reference into subject object
   * @param uri
   * @param dtoIn
   * @param profileList
   * @param session
   * @param uuAppErrorMap
   * @returns {Promise<void>}
   */
  async addCourse(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.AddCourse,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2
    let validationResult = this.validator.validate("subjectAddCourseDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.addCourseUnsupportedKeys.code,
      Errors.AddCourse.InvalidDtoIn
    );
    // HDS 3
    // 3.1
    let uuObject;
    //   3.1.A.
    if (dtoIn.id) {
      // 3.1.A.1.
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      // 3.1.B.
      // 3.1.B.1.
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.AddCourse.SubjectNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.AddCourse.SubjectIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6
    let callOpts;
    if (!profileList.includes("Authorities") && !profileList.includes("Executives")) {
      // 6.1
      const roleGroupIfcList = [{ id: uuObject.subjectTeacher }];
      // 6.2

      let verifyMyCastExistenceDtoOut = {};
      try {
        //6.3, 6.3.A
        callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
        verifyMyCastExistenceDtoOut = await UuBtHelper.verifyMyCastExistence(
          uuSchoolKit.btBaseUri,
          { roleGroupIfcList: roleGroupIfcList },
          callOpts
        );
      } catch (e) {
        // 6.3.B, 6.3.B.1
        throw new Errors.AddCourse.CallVerifyMyCastExistenceFailed({ uuAppErrorMap }, e);
      }

      // 6.4
      if (verifyMyCastExistenceDtoOut.roleGroupIfcList.length === 0) {
        throw new Errors.AddCourse.UserNotAuthorized({ uuAppErrorMap });
      }
    }

    // HDS 7
    // 7.1
    let courseIsRegisteredIntoSchoolKit;
    if (uuSchoolKit.appMap) {
      courseIsRegisteredIntoSchoolKit = uuSchoolKit.appMap.find((app) => {
        return app.uri === dtoIn.appUri && app.type === "course";
      });
    }
    // 7.1.A
    if (!courseIsRegisteredIntoSchoolKit) {
      // 7.1.A.1
      throw new Errors.AddCourse.CourseIsNotRegistered({ uuAppErrorMap }, { appUri: dtoIn.appUri });
    }

    // 7.2
    if (!uuObject.appMap) uuObject.appMap = [];
    const courseIsRegisteredIntoSubject = uuObject.appMap.find((app) => {
      return app.uri === dtoIn.appUri && app.type === "course";
    });

    // 7.2.A
    if (courseIsRegisteredIntoSubject) {
      // 7.2.A.1
      throw new Errors.AddCourse.CourseAlreadyAdded({ uuAppErrorMap }, { appUri: dtoIn.appUri });
    }

    // HDS 8
    const subjectTeacherDetailResult = await TeacherDetail.getTeacherDataFromEnvironment(
      uri,
      uuSchoolKit,
      uuObject,
      uuAppErrorMap,
      Errors.AddCourse,
      session,
      callOpts,
      null
    );
    const { teacherApi: subjectTeacher } = subjectTeacherDetailResult.uuObject;
    uuAppErrorMap = subjectTeacherDetailResult.uuAppErrorMap;

    const uuClass = await this.classDao.get(awid, uuObject.classId);
    if (!uuClass) {
      throw new Errors.AddCourse.SubjetClassNotFound({ uuAppErrorMap }, { id: uuObject.classId });
    }

    const classTeacherDetailResult = await TeacherDetail.getTeacherDataFromEnvironment(
      uri,
      uuSchoolKit,
      uuClass,
      uuAppErrorMap,
      Errors.AddCourse,
      session,
      callOpts,
      null
    );
    const { teacherApi: classTeacher } = classTeacherDetailResult.uuObject;
    uuAppErrorMap = classTeacherDetailResult.uuAppErrorMap;

    const schoolYear = await this.schoolYearDao.get(awid, uuClass.schoolYearId);
    if (!schoolYear) {
      throw new Errors.AddCourse.SubjetSchoolYearNotFound({ uuAppErrorMap }, { id: uuClass.schoolYearId });
    }
    // TODO pridelit cisla, upravit dizajn, upravit test

    if (uuObject.studentList && uuObject.studentList.length > 0) {
      const listOfIdOnlyActiveStudents = [];
      uuObject.studentList.forEach((student) => {
        if (student.state === "active") {
          if (!student.courses) student.courses = [];
          if (!student.courses.find((course) => course.uri === dtoIn.appUri)) {
            listOfIdOnlyActiveStudents.push(student.id);
          }
        }
      });
      const studentsList = await this.studentDao.listByIds(awid, listOfIdOnlyActiveStudents, DEFAULT_PAGE_INFO);

      logger.error(`studentList: ${JSON.stringify(studentsList)}`);
      if (studentsList && studentsList.itemList && studentsList.itemList.length > 0) {
        let consoleUri = ConsoleUriHelper.get(uuSchoolKit);

        const uuCKcallOpts = await AppClientTokenHelper.createToken(uri, dtoIn.appUri, session);

        for (let student of studentsList.itemList) {
          const scriptDtoIn = {
            scriptUri: Config.get("uuScriptRegisterStudentToCourse"),
            consoleUri,
            scriptDtoIn: {
              classTeacher: {
                id: classTeacher.id.toString(),
                uuIdentity: classTeacher.uuIdentity,
                name: classTeacher.name,
                surname: classTeacher.surname,
              },
              subjectTeacher: {
                id: subjectTeacher.id.toString(),
                uuIdentity: subjectTeacher.uuIdentity,
                name: subjectTeacher.name,
                surname: subjectTeacher.surname,
              },
              subjectId: uuObject.id.toString(),
              uuSchoolKitBaseUri: uri.toString(),
              studentList: [student],
              uuCkBaseUri: dtoIn.appUri,
              // TODO fix licenteValidTo
              licenceValidTo: "2025-01-01",
              validFrom: schoolYear.startDate,
              validTo: schoolYear.endDate,
              callOpts: uuCKcallOpts,
            },
          };
          logger.error(`Add course: ${JSON.stringify(scriptDtoIn)}`);
          try {
            ScriptEngineHelper.uuSchoolKitUpdateStudentToCourse(uuSchoolKit.scriptEngineUri, scriptDtoIn, session);
          } catch (e) {
            logger.error(`Add course failed: ${JSON.stringify(e)}`);
          }
        }
      }
    }

    // HDS 9
    // 9.1
    // 9.1.A
    uuObject.appMap.push({
      uri: dtoIn.appUri,
      type: "course",
    });
    try {
      uuObject = await this.dao.update(uuObject);
      // 9.1.B
    } catch (e) {
      // 9.1.B.1
      throw new Errors.AddCourse.SubjectUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }

  /**
   * update on subject object, list of students with data from uuCK after register student there
   * @param awid
   * @param dtoIn
   * @param uuAppErrorMap
   * @returns {Promise<{uuAppErrorMap: (*|{})}>}
   */
  async addStudentCourse(awid, dtoIn, uuAppErrorMap = {}) {
    // HDS 1, 1.1, 1.2, 1.2.A, 1.2.A.1, 1.3, 1.3.A, 1.3.A.1
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.AddStudentCourse,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2
    let validationResult = this.validator.validate("subjectAddStudentCourseDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.AddStudentCourseUnsupportedKeys.code,
      Errors.AddStudentCourse.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    let uuObject;
    //   3.1.A.
    if (dtoIn.id) {
      // 3.1.A.1.
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      // 3.1.B.
      // 3.1.B.1.
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.AddStudentCourse.SubjectNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.AddStudentCourse.SubjectIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6
    if (!uuObject.appMap) uuObject.appMap = [];
    const courseIsRegisteredIntoSubject = uuObject.appMap.find((app) => {
      return app.uri === dtoIn.appUri && app.type === "course";
    });

    if (!courseIsRegisteredIntoSubject) {
      throw new Errors.AddStudentCourse.CourseIsNotRegistered({ uuAppErrorMap }, { appUri: dtoIn.appUri });
    }

    let hasAllreadyCourse = [];
    if (uuObject.studentList && dtoIn.studentList.length > 0) {
      uuObject.studentList.forEach((student) => {
        dtoIn.studentList.forEach((studentFromDtoIn) => {
          if (student.id === studentFromDtoIn.id) {
            let courseIsThere = student.courses && student.courses.find((course) => course.uri === dtoIn.appUri);
            if (courseIsThere) {
              hasAllreadyCourse.push(studentFromDtoIn);
            } else {
              if (!student.courses) {
                student.courses = [];
              }
              student.courses.push({
                studentId: studentFromDtoIn.studentCourseId,
                uri: dtoIn.appUri,
              });
            }
          }
        });
      });
    }

    if (hasAllreadyCourse.length > 0) {
      // TODO warning
      throw new Errors.AddStudentCourse.StudentsHasAlreadyCourseKitId({ uuAppErrorMap }, { hasAllreadyCourse });
    }

    // HDS 7
    // 7.1

    // 7.1.A
    try {
      uuObject = await this.dao.update({ ...uuObject });
      // 7.1.B
    } catch (e) {
      // 7.1.B.1
      throw new Errors.AddStudentCourse.SubjectUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    return { ...uuObject, uuAppErrorMap };
  }

  /**
   * Creates a new subject.
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns { subject, artifactEnvironment, uuAppErrorMap }
   */
  async create(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.Create, allowedStates, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("subjectCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.createUnsupportedKeys.code,
      Errors.Create.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    let uuClass = await this.classDao.get(awid, dtoIn.classId);
    // 3.2
    if (!uuClass) {
      // 3.2.1.A
      // 3.2.1.A.1
      throw new Errors.Create.ClassNotFound({ uuAppErrorMap }, { id: dtoIn.classId });
    }

    // HDS 4
    // 4.1.A
    // 4.1.A.1
    let stateError = Errors.Create.ClassIsNotInCorrectState;
    allowedStates = Class.NonFinalStatesWithoutPassive;
    StateChecker.ensureState(uuClass, stateError, allowedStates, uuAppErrorMap, {
      id: uuClass.id,
      state: uuClass.state,
    });

    // HDS 5
    let callOpts = {};
    const { btBaseUri } = uuSchoolKit;
    // 5.1
    dtoIn.subjectTeacherId = dtoIn.subjectTeacherId || session.getIdentity().getUuIdentity();
    // 5.2
    let subjectTeacherRole;
    // 5.3, 5.3.A
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
      subjectTeacherRole = await UuBtHelper.uuRoleIfc.get(btBaseUri, { code: dtoIn.subjectTeacherId }, callOpts);
      // 5.3.B
    } catch (e) {
      // 5.3.B.1.A.1.
      throw new Errors.Create.FailedToGetSubjectTeacherRole({ uuAppErrorMap }, { cause: e });
    }

    // 5.4, 5.4.1

    let teacherRolesAllowedStates =
      (subjectTeacherRole && subjectTeacherRole.state && ACTIVE_STATES.includes(subjectTeacherRole.state)) || false;

    // 5.4.2, 5.4.2.A
    if (!teacherRolesAllowedStates) {
      // 5.4.2.A.1
      throw new Errors.Create.SubjectTeacherRoleIsNotInCorrectState(
        { uuAppErrorMap },
        { state: subjectTeacherRole.state }
      );
    }

    // HDS 6
    // 6.1

    // 6.2
    let teacher = await this.teacherDao.getByUuIdentity(awid, dtoIn.subjectTeacherId);
    // 6.3
    if (teacher) {
      // 6.3.A.1
      ValidationHelper.addWarning(
        uuAppErrorMap,
        WARNINGS.teacherAlreadyExist.code,
        WARNINGS.teacherAlreadyExist.message,
        { uuIdentity: dtoIn.subjectTeacherId }
      );
    } else {
      // 6.3.B.
      try {
        // 6.3.B.1.2.A
        let teacherCreateUri = UriBuilder.parse(uri).setUseCase(TeacherAbl.useCases.create).clearParameters().toUri();
        teacher = await TeacherAbl.create(
          teacherCreateUri,
          { uuIdentity: subjectTeacherRole.mainUuIdentity },
          session,
          uuAppErrorMap
        );
      } catch (e) {
        // 7.3.B.1.2.B
        throw new Errors.Create.TeacherCreateDaoFailed({ uuAppErrorMap }, e);
      }
    }

    // HDS 7
    // 7.1
    // 7.2

    const uuUnitDtoIn = {
      name: dtoIn.name,
      code: dtoIn.code + "_unit",
      desc: dtoIn.desc,
      location: uuClass.subjectsFolderId,
      responsibleRoleCode: session.getIdentity().getUuIdentity(),
    };
    // 7.2.A
    let uuUnit;
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
      uuUnit = await UuBtHelper.uuUnit.create(btBaseUri, uuUnitDtoIn, callOpts);
    } catch (e) {
      // 6.2.B
      // 6.2.B.1
      throw new Errors.Create.FailedToCreateUuUnit({ uuAppErrorMap }, e);
    }

    // HDS 8
    // 8.1
    let uuRole;
    const uuRoleCreateDtoIn = { name: `Subject Teacher ${dtoIn.name}`, locationCode: `${uuUnit.code}` };
    try {
      // 8.2.A
      uuRole = await UuBtHelper.uuRole.create(btBaseUri, uuRoleCreateDtoIn, callOpts);
    } catch (e) {
      // 8.2.B
      // 8.2.B.1
      throw new Errors.Create.FailedToCreateUuRole({ uuAppErrorMap }, e);
    }
    // 8.3
    const subjectTeacherIdentity = dtoIn.subjectTeacherId || session.getIdentity().getUuIdentity();
    const uuRoleAddCastDtoIn = { id: uuRole.id, sideBCode: subjectTeacherIdentity };
    // 8.4
    try {
      // 8.4.A
      await UuBtHelper.uuRole.addCast(btBaseUri, uuRoleAddCastDtoIn, callOpts);
    } catch (e) {
      // 8.4.B
      // 8.4.B
      throw new Errors.Create.FailedToAddCastUuRole({ uuAppErrorMap }, e);
    }

    // HDS 9
    // 9.1
    let uuUnitSetResponsibleRoleDtoIn = { id: uuUnit.id, responsibleRole: uuRole.id };
    try {
      // 9.2
      // 9.2.A
      await UuBtHelper.uuUnit.setResponsibleRole(btBaseUri, uuUnitSetResponsibleRoleDtoIn, callOpts);
    } catch (e) {
      // 9.2.B
      // 9.2.B.1
      throw new Errors.Create.UuUnitFailedToSetResponsibleRole({ uuAppErrorMap }, e);
    }

    // HDS 10
    let uuObject;
    try {
      // 10.2.A
      delete dtoIn.subjectTeacherId;
      uuObject = await this.dao.create({
        ...dtoIn,
        awid,
        state: this.states.initial,
        subjectTeacher: uuRole.id,
      });
    } catch (e) {
      // 10.2.B
      if (e.code === "uu-app-objectstore/duplicateKey") {
        // 10.2.B.1.A.
        // 10.2.B.1.A.1
        throw new Errors.Create.SubjectWithCodeAlreadyExist({ uuAppErrorMap }, e);
      }
      // 10.2.B.1
      throw new Errors.Create.SubjectCreateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 11
    // 11.1
    const uuObId = uuObject.id;
    const uuObUri = UriBuilder.parse(uri)
      .setUseCase("subjectDetail")
      .setParameters({ id: uuObId.toString() })
      .toUri()
      .toString();
    let uuObcCreateDtoIn = {
      typeCode: this.typeCode,
      code: uuObject.code,
      name: uuObject.name,
      desc: uuObject.desc,
      location: uuUnit.id,
      uuObId,
      uuObUri,
      competentRole: uuRole.id,
    };
    let artifactEnvironment;
    try {
      // 11.2.A
      artifactEnvironment = await UuBtHelper.uuObc.create(btBaseUri, uuObcCreateDtoIn, callOpts);
    } catch (e) {
      // 11.2.B
      // 11.2.B.1
      try {
        // 11.2.B.1.A
        await this.dao.delete(awid, uuObject.id);
      } catch (e) {
        // 11.2.B.1.B
        // 11.2.B.1.B.1
        ValidationHelper.addWarning(
          uuAppErrorMap,
          WARNINGS.createFailedToDeleteAfterRollback.code,
          WARNINGS.createFailedToDeleteAfterRollback.message,
          { cause: e }
        );
      }
      // 11.2.B.2
      this._throwCorrespondingError(e, uuAppErrorMap);
    }

    const assignmentsFolderDtoIn = {
      name: "Assignments",
      code: "Assignment_" + uuObject.code,
      location: uuUnit.id,
      responsibleRole: uuRole.id,
    };
    let assignmentsFolder;
    try {
      assignmentsFolder = await UuBtHelper.uuFolder.create(btBaseUri, assignmentsFolderDtoIn, callOpts);
    } catch (e) {
      throw new Errors.Create.AssignmentsFolderCreateFailed({ uuAppErrorMap }, { cause: e });
    }

    // HDS 12
    try {
      // 12.1.A
      uuObject = await this.dao.update({
        ...uuObject,
        artifactId: artifactEnvironment.id,
        assignmentsFolder: assignmentsFolder.id,
      });
    } catch (e) {
      // 12.1.A
      // 12.1.B.1
      throw new Errors.Create.SubjectUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 13
    let actualUuFolder, unitExecutivesId;
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
      actualUuFolder = await UuBtHelper.uuFolder.load(
        btBaseUri,
        { id: uuSchoolKit.btSchoolYearId, loadContext: true },
        callOpts
      );
      unitExecutivesId = actualUuFolder.data.context.unit.unitGroupMap["2"];
    } catch (e) {
      throw e;
    }

    let consoleUri = ConsoleUriHelper.get(uuSchoolKit);
    const scriptDtoIn = {
      scriptUri: Config.get("uuScriptSetPermissionsUri"),
      consoleUri,
      scriptDtoIn: {
        code: dtoIn.code + "_unit/executives",
        sideB: unitExecutivesId,
        uuBtBaseUri: uuSchoolKit.btBaseUri,
      },
    };
    try {
      ScriptEngineHelper.uuSchoolKitSetUnitPermissions(uuSchoolKit.scriptEngineUri, scriptDtoIn, session); //FIXME: waiting for BT fix
    } catch (e) {
      throw e;
    }

    const activityDtoIn = {
      id: uuObject.artifactId,
      submitterCode: session.getIdentity().getUuIdentity(),
      solverList: [
        {
          solverCode: subjectTeacherIdentity,
        },
      ],
      type: activityTypes.doIt,
      name: Activity.createLsiContent("subject", "name"),
      desc: Activity.createLsiContent("subject", "desc"),
      endTime: dateFunctions.getNextDay(),
    };
    let activityResult;
    try {
      activityResult = await Activity.create(activityDtoIn, session, btBaseUri, uri, callOpts, uuAppErrorMap);
    } catch (e) {
      ValidationHelper.addWarning(
        uuAppErrorMap,
        WARNINGS.createFailedToCreateActivity.code,
        WARNINGS.createFailedToCreateActivity.message,
        { cause: e }
      );
    }

    // HDS 14
    return {
      ...uuObject,
      activityResult,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  /**
   * Loads the subject uuObject. Checks all profiles of logged user
   * (Authorities, Executives, Standard Users, Auditors) to provide appropriate
   * functionality for given profile.
   * @param uri
   * @param dtoIn
   * @param session
   * @param profileList
   * @param uuAppErrorMap
   * @returns {Promise<{uuAppErrorMap: (*|{}), uuClass: *, artifactEnvironment: *}>}
   */
  async load(uri, dtoIn, session, profileList, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.Load, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("subjectLoadDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.loadUnsupportedKeys.code,
      Errors.Load.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    let uuObject;
    //   3.1.A.
    if (dtoIn.id) {
      // 3.1.A.1.
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      // 3.1.B.
      // 3.1.B.1.
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.Load.SubjectNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5
    // 5.1, 5.2
    let callOpts = {};
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
    } catch (e) {
      // fix
      throw new Errors.Load.CallVerifyMyCastExistenceFailed({ uuAppErrorMap });
    }

    let uuClass = await this.classDao.get(awid, uuObject.classId);
    if (
      !profileList.includes("Authorities") &&
      !profileList.includes("Executives") &&
      !profileList.includes("Auditors")
    ) {
      const userIdentity = session.getIdentity().getUuIdentity();
      let roleGroupIfcList = [{ id: uuObject.subjectTeacher }, { id: uuClass.classTeacher }];
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

      let isTeacher = verifyMyCastExistenceDtoOut.roleGroupIfcList.filter((uuRole) => {
        if (uuRole.id === uuObject.subjectTeacher) {
          profileList.push("SubjectTeacher");
          return uuRole;
        }
        if (uuRole.id === uuClass.classTeacher) {
          profileList.push("ClassTeacher");
          return uuRole;
        }
      });

      if (isTeacher.length === 0) {
        const userIsTeacherAtAll = await UserRoleChecker.checkIsTeacher(awid, userIdentity);
        if (Object.keys(userIsTeacherAtAll).length !== 0) {
          profileList.push("Teacher");
        }
      }

      let userIsSubjectStudent;
      let userIsRelatedPerson;
      if (
        uuObject.studentList &&
        !profileList.includes("Teacher") &&
        !profileList.includes("SubjectTeacher") &&
        !profileList.includes("ClassTeacher")
      ) {
        const studentListOfId = uuObject.studentList.map((student) => student.id);
        const subjectStudents = await this.studentDao.listByIds(awid, studentListOfId, DEFAULT_PAGE_INFO);
        if (subjectStudents && subjectStudents.itemList) {
          subjectStudents.itemList.forEach((student) => {
            if (student.uuIdentity === userIdentity) userIsSubjectStudent = true;
            if (student.relatedPersonList.find((relatedPerson) => relatedPerson.uuIdentity === userIdentity))
              userIsRelatedPerson = true;
          });
        }

        if (!userIsSubjectStudent && !userIsRelatedPerson) {
          const studentAtAll = await this.studentDao.getByUuIdentity(awid, userIdentity);
          if (studentAtAll) {
            profileList.push("Student");
          }
        }
      }

      if (userIsSubjectStudent) {
        profileList.push("SubjectStudent");
      }
      if (userIsRelatedPerson) {
        profileList.push("RelatedPerson");
      }

      if (
        !profileList.includes("Teacher") &&
        !profileList.includes("SubjectTeacher") &&
        !profileList.includes("ClassTeacher") &&
        !profileList.includes("SubjectStudent") &&
        !profileList.includes("RelatedPerson") &&
        !profileList.includes("Student")
      ) {
        throw new Errors.Load.UserNotAuthorized({ uuAppErrorMap });
      }
    }

    // HDS 6
    // 6.1
    const uuObcLoadEnvDtoIn = { id: uuObject.artifactId };
    let artifactEnvironment;
    // 6.2.
    // 6.2.A.
    try {
      artifactEnvironment = await UuBtHelper.uuObc.loadEnvironment(uuSchoolKit.btBaseUri, uuObcLoadEnvDtoIn, callOpts);
    } catch (e) {
      // 6.2.B.
      // 6.2.B.1.
      throw new Errors.Load.FailedToLoadUuObcEnvironment({ uuAppErrorMap }, e);
    }

    const teacherDetailResult = await TeacherDetail.getTeacherDataFromEnvironment(
      uri,
      uuSchoolKit,
      uuObject,
      uuAppErrorMap,
      Errors.Load,
      session,
      callOpts,
      artifactEnvironment
    );
    uuObject = teacherDetailResult.uuObject;
    uuAppErrorMap = teacherDetailResult.uuAppErrorMap;
    // HDS 7

    return {
      ...uuObject,
      uuClass,
      artifactEnvironment,
      profileList,
      uuAppErrorMap,
    };
  }

  /**
   * Updates subject manually.
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns {Promise<{uuAppErrorMap: (*|{}), artifactEnvironment: *}>}
   */
  async update(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.Update, allowedStates, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("subjectUpdateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.updateUnsupportedKeys.code,
      Errors.Update.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    let uuObject;
    //   3.1.A.
    if (dtoIn.id) {
      // 3.1.A.1.
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      // 3.1.B.
      // 3.1.B.1.
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.Update.SubjectNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.Update.SubjectIsNotInCorrectState({ uuAppErrorMap }, { id: uuObject.id, state: uuObject.state });
    }

    // HDS 6, 6.1, 6.1.A
    let artifactEnvironment;
    let callOpts = {};
    const { btBaseUri } = uuSchoolKit;
    if (
      (dtoIn.name && dtoIn.name !== uuObject.name) ||
      (dtoIn.code && dtoIn.code !== uuObject.code) ||
      (dtoIn.desc && dtoIn.desc !== uuObject.desc)
    ) {
      // 6.1.A.1
      const dtoInUuObcSetBasicAttributes = {
        id: uuObject.artifactId,
        name: dtoIn.name,
        desc: dtoIn.desc,
        code: dtoIn.code,
      };
      // 6.1.A.2
      try {
        // 6.1.A.2.A

        try {
          callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
        } catch (e) {
          throw new Errors.Update.AppClientTokenCreateFailed({ uuAppErrorMap }, e);
        }

        artifactEnvironment = await UuBtHelper.uuObc.setBasicAttributes(
          btBaseUri,
          dtoInUuObcSetBasicAttributes,
          callOpts
        );
      } catch (e) {
        // 6.1.A.2.B
        // 6.1.A.2.B.1
        throw new Errors.Update.SetBasicUuObcArtifactAttributesFailed({ uuAppErrorMap }, e);
      }
    }
    // HDS 7, 7.1, 7.1.A
    if ((dtoIn.name && dtoIn.name !== uuObject.name) || (dtoIn.code && dtoIn.code !== uuObject.code)) {
      // 7.1.A.1.
      const dtoInUuUnitSetBasicAttributes = {
        id: artifactEnvironment.unit,
        name: dtoIn.name,
        code: dtoIn.code + "_unit",
      };
      // 7.1.A.2., 7.1.A.2.A.
      try {
        await UuBtHelper.uuUnit.setBasicAttributes(btBaseUri, dtoInUuUnitSetBasicAttributes, callOpts);

        // 7.1.A.2.B
      } catch (e) {
        //7.1.A.2.B.1.
        throw new Errors.Update.SetBasicUuUnitArtifactAttributesFailed({ uuAppErrorMap }, e);
      }
    }

    // HDS 8
    try {
      // 8.1, 8.1.A
      uuObject = await this.dao.update({ ...uuObject, ...dtoIn });
    } catch (e) {
      // 8.1.B, 8.1.B.1
      throw new Errors.Update.SubjectUpdateDaoFailed({ uuAppErrorMap }, e);
    }
    // HDS 9
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  /**
   * Updates subject manually by subject teacher.
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns {subject, artifactEnvironment, uuAppErrorMap}
   */
  async updateBySubjectTeacher(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.UpdateBySubjectTeacher,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2
    // 2.2, 2.2.1, 2.3, 2.3.1.
    let validationResult = this.validator.validate("subjectUpdateBySubjectTeacherDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.updateBySubjectTeacherUnsupportedKeys.code,
      Errors.UpdateBySubjectTeacher.InvalidDtoIn
    );

    // HDS 3, 3.1
    let uuObject;
    //   3.1.A.
    if (dtoIn.id) {
      // 3.1.A.1.
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      // 3.1.B.
      // 3.1.B.1.
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4, 4.1, 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.UpdateBySubjectTeacher.SubjectNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5, 5.1, 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.UpdateBySubjectTeacher.SubjectIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6, 6.1
    let roleGroupIfcList = [{ id: uuObject.subjectTeacher }];
    // 6.2
    let verifyMyCastExistenceDtoOut = {};
    let callOpts;
    try {
      //6.3, 6.3.A
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      verifyMyCastExistenceDtoOut = await UuBtHelper.verifyMyCastExistence(
        uuSchoolKit.btBaseUri,
        { roleGroupIfcList: roleGroupIfcList },
        callOpts
      );
    } catch (e) {
      // 6.3.B, 6.3.B.1
      throw new Errors.UpdateBySubjectTeacher.CallVerifyMyCastExistenceFailed({ uuAppErrorMap });
    }

    // 6.4
    if (verifyMyCastExistenceDtoOut.roleGroupIfcList.length === 0) {
      throw new Errors.UpdateBySubjectTeacher.UserNotAuthorized({ uuAppErrorMap });
    }

    // HDS 7, 7.1, 7.1.A
    let artifactEnvironment;
    const { btBaseUri } = uuSchoolKit;
    if ((dtoIn.name && dtoIn.name !== uuObject.name) || (dtoIn.desc && dtoIn.desc !== uuObject.desc)) {
      // 7.1.A.1
      const dtoInUuObcSetBasicAttributes = {
        id: uuObject.artifactId,
        name: dtoIn.name,
        desc: dtoIn.desc,
      };
      // 7.1.A.2
      try {
        // 7.1.A.2.A

        try {
          callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
        } catch (e) {
          throw new Errors.UpdateBySubjectTeacher.AppClientTokenCreateFailed({ uuAppErrorMap }, e);
        }

        artifactEnvironment = await UuBtHelper.uuObc.setBasicAttributes(
          btBaseUri,
          dtoInUuObcSetBasicAttributes,
          callOpts
        );
      } catch (e) {
        // 7.1.A.2.B
        // 7.1.A.2.B.1
        throw new Errors.UpdateBySubjectTeacher.SetBasicUuObcArtifactAttributesFailed({ uuAppErrorMap }, e);
      }
    }
    // HDS 8, 8.1
    if (dtoIn.name && dtoIn.name !== uuObject.name) {
      // 8.1.A.1.
      const dtoInUuUnitSetBasicAttributes = {
        id: artifactEnvironment.unit,
        name: dtoIn.name,
      };
      // 8.1.A.2., 8.1.A.2.A.
      try {
        await UuBtHelper.uuUnit.setBasicAttributes(btBaseUri, dtoInUuUnitSetBasicAttributes, callOpts);

        // 8.1.A.2.B
      } catch (e) {
        //8.1.A.2.B.1.
        throw new Errors.UpdateBySubjectTeacher.SetBasicUuUnitArtifactAttributesFailed({ uuAppErrorMap }, e);
      }
    }

    // HDS 9
    try {
      // 9.1, 9.1.A
      uuObject = await this.dao.update({ ...uuObject, ...dtoIn });
    } catch (e) {
      // 9.1.B, 9.1.B.1
      throw new Errors.UpdateBySubjectTeacher.SubjectUpdateDaoFailed({ uuAppErrorMap }, e);
    }
    // HDS 10
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }
  /**
   * Set state for existing subject (Closed).
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns {Promise<{uuAppErrorMap: (*|{})}>}
   */
  async setFinalState(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.SetFinalState,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("subjectSetFinalStateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.setFinalStateUnsupportedKeys.code,
      Errors.SetFinalState.InvalidDtoIn
    );

    // HDS 3
    let uuObject;
    // HDS 3.1
    if (dtoIn.id) {
      // 3.1.A.1
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      // 3.1.B.1
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4
    if (!uuObject) {
      // 4.1
      // 4.1.A.
      // 4.1.A.1
      throw new Errors.SetFinalState.SubjectNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1
      throw new Errors.SetFinalState.SubjectIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6, 6.1., 6.2., 6.2.A.
    let callOpts;
    let listByArtifactBDtoOut;
    const { btBaseUri } = uuSchoolKit;
    const dtoInListByArtifactB = { id: uuObject.artifactId };
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      listByArtifactBDtoOut = await UuBtHelper.uuArtifactIfc.listByArtifactB(btBaseUri, dtoInListByArtifactB, callOpts);
    } catch (e) {
      // 6.2.B., 6.2.B.1.
      throw new Errors.SetFinalState.CheckExistenceOfActiveRelatedArtifactsFailed({ uuAppErrorMap }, e);
    }

    // HDS 6.3., 6.3.1., 6.3.1.1.
    listByArtifactBDtoOut.itemList.forEach((artifact) => {
      // 6.3.1.1.A.
      if (artifact.artifactAState !== this.states.closed) {
        // 6.3.1.1.A.1.
        throw new Errors.SetFinalState.ExistingActiveAARBySideB({ uuAppErrorMap });
      }
    });

    // HDS 7, 7.1, 7.1.A
    if (uuObject.studentList && uuObject.studentList.length > 0) {
      // 7.1.A.1, 7.1.A.1.1
      let activeStudents = uuObject.studentList.find((item) => item.state === "active");

      if (activeStudents) {
        // 7.1.A.1.1.A.1.
        throw new Errors.SetFinalState.ExistingActiveStudents({ uuAppErrorMap, cause: "there are active students" });
      }
    }

    // HDS 8, 8.1.
    let artifactEnvironment;
    let uuObcSetStateDtoIn = {
      id: uuObject.artifactId,
      state: this.states.closed,
      desc: dtoIn.desc,
      data: dtoIn.stateData,
    };
    try {
      // 8.1.A.
      artifactEnvironment = await UuBtHelper.uuObc.setState(btBaseUri, uuObcSetStateDtoIn, callOpts);
    } catch (e) {
      // 8.2.B.
      // 8.1.B.1.
      throw new Errors.SetFinalState.UuObcSetStateFailed({ uuAppErrorMap }, e);
    }

    // HDS 9, 9.1.
    try {
      // 9.1.A
      const updateUuObjectDtoIn = { ...uuObject, state: this.states.closed };
      uuObject = await this.dao.update(updateUuObjectDtoIn);
    } catch (e) {
      // 9.1.B.
      // 9.1.B.1.
      throw new Errors.SetFinalState.SchoolYearDaoUpdateFailed({ uuAppErrorMap }, e);
    }

    // HDS 10
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  async setState(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.SetState, allowedStates, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("subjectSetStateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.setStateUnsupportedKeys.code,
      Errors.SetState.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    let uuObject;
    //   3.1.A.
    if (dtoIn.id) {
      // 3.1.A.1.
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      // 3.1.B.
      // 3.1.B.1.
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.SetState.SubjectNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.SetState.SubjectIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
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
    try {
      // 6.2
      // 6.2.A
      let callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
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
      throw new Errors.SetState.SubjectUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 8
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  /**
   * Adds a student list into the subject.
   * @param uri
   * @param dtoIn
   * @param authResult
   * @param session
   * @param uuAppErrorMap
   * @returns {Promise<{uuAppErrorMap: (*|{})}>}
   */
  async addStudents(uri, dtoIn, authResult, session, uuAppErrorMap = {}) {
    const auth = await TrustedSubAppAuthorization.checkSubApp(uri, session, authResult.getIdentityProfiles());
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.AddStudents,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2, 2.2
    let validationResult = this.validator.validate("subjectAddStudentsDtoInType", dtoIn);
    // 2.2.1, 2.3, 2.3.1
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.addStudentsUnsupportedKeys.code,
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

    // HDS 4, 4.1, 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.AddStudents.SubjectNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5, 5.1
    // 5.1.A.1
    let stateError = Errors.AddStudents.SubjectIsNotInCorrectState;
    allowedStates = Subject.NonFinalStatesWithoutPassive;
    StateChecker.ensureState(uuObject, stateError, allowedStates, uuAppErrorMap, {
      id: uuObject.id,
      state: uuObject.state,
    });

    // HDS 6
    // 6.1
    let scriptResult;
    //fixme : scriptResult removal
    let uuClass = await this.classDao.get(awid, uuObject.classId);

    // HDS 7
    // 7.1
    dtoIn.studentList = [...new Set(dtoIn.studentList)];
    const studentList = uuObject.studentList || [];
    let resetStudent = false;

    let checkedStudentList = [];
    let studentsListToAddCourse = [];
    // 7.3
    for (let studentToAddId of dtoIn.studentList) {
      // 7.3.2
      if (
        !uuClass.studentList ||
        !uuClass.studentList.find((s) => s.id === studentToAddId) ||
        uuClass.studentList.length === 0
      ) {
        // 7.3.2.A.1.
        uuAppErrorMap = this._addToWarningMap(uuAppErrorMap, "addStudentsStudentIsNotClassStudent", {
          id: studentToAddId,
        });
        // 7.3.2.A.2.
        continue;
      }

      // 7.3.3
      let isSubjectStudent = studentList.find((s) => s.id === studentToAddId);
      // 7.3.4
      // 7.3.4.1
      if (isSubjectStudent && studentList.length !== 0) {
        for (let index in studentList) {
          if (studentList[index].id === studentToAddId && studentList[index].state === StudentAbl.states.former) {
            try {
              await this.dao.reactivateStudent({ id: uuObject.id }, studentToAddId);
            } catch (e) {
              throw new Errors.RemoveStudent.SubjectDaoRemoveStudentFailed({ uuAppErrorMap }, { cause: e });
            }
            studentsListToAddCourse.push({ id: studentToAddId });
            resetStudent = true;
          } else if (
            studentList[index].id === studentToAddId &&
            studentList[index].state === StudentAbl.states.active
          ) {
            // 7.3.4.1.A.1.
            uuAppErrorMap = this._addToWarningMap(uuAppErrorMap, "addStudentsStudentIsAlreadyInSubject", {
              id: studentToAddId,
            });
          }
        }
      } else {
        // 7.3.4.1.B.1.
        // 7.3.4.1.B.1.1
        let uuStudent = await this.studentDao.get(awid, studentToAddId);
        // 7.3.4.1.B.1.2.A.
        if (!uuStudent) {
          // 7.3.4.1.B.1.2.A.1.
          uuAppErrorMap = this._addToWarningMap(uuAppErrorMap, "addStudentsStudentNotFound", {
            id: studentToAddId,
          });
        } else if (uuStudent.state === StudentAbl.states.closed) {
          // 7.3.4.1.B.1.2.B.1.
          uuAppErrorMap = this._addToWarningMap(uuAppErrorMap, "addStudentsStudentIsNotInCorrectState", {
            id: studentToAddId,
          });
        } else {
          // 7.3.4.1.B.1.2.C.1.
          let subjectStudentRelation = {
            id: studentToAddId,
            state: StudentAbl.states.active,
          };
          if (uuStudent.uuIdentity) {
            subjectStudentRelation.uuIdentity = uuStudent.uuIdentity;
          }
          studentsListToAddCourse.push(subjectStudentRelation);
          checkedStudentList.push(subjectStudentRelation);
        }
      }
    }

    if (checkedStudentList.indexOf(uuClass.former))
      if (!checkedStudentList.length && !resetStudent) {
        // 7.4
        // 7.4.A.1.
        throw new Errors.AddStudents.NoStudentToBeAdded({ uuAppErrorMap });
      }

    // TODO ak sa dokonci dizajn pridat cisla a testy(nie nutne)
    if (studentsListToAddCourse.length > 0 && uuObject.appMap && uuObject.appMap.length > 0) {
      const subjectTeacherDetailResult = await TeacherDetail.getTeacherDataFromEnvironment(
        uri,
        uuSchoolKit,
        uuObject,
        uuAppErrorMap,
        Errors.AddCourse,
        session,
        null,
        null
      );
      const { teacherApi: subjectTeacher } = subjectTeacherDetailResult.uuObject;
      uuAppErrorMap = subjectTeacherDetailResult.uuAppErrorMap;

      const classTeacherDetailResult = await TeacherDetail.getTeacherDataFromEnvironment(
        uri,
        uuSchoolKit,
        uuClass,
        uuAppErrorMap,
        Errors.AddCourse,
        session,
        null,
        null
      );
      const { teacherApi: classTeacher } = classTeacherDetailResult.uuObject;
      uuAppErrorMap = classTeacherDetailResult.uuAppErrorMap;

      const schoolYear = await this.schoolYearDao.get(awid, uuClass.schoolYearId);
      if (!schoolYear) {
        throw new Errors.AddStudents.SubjetSchoolYearNotFound({ uuAppErrorMap }, { id: uuClass.schoolYearId });
      }

      const listOfStudentsIds = studentsListToAddCourse.map((student) => student.id);
      const studentsList = await this.studentDao.listByIds(awid, listOfStudentsIds, DEFAULT_PAGE_INFO);
      let consoleUri = ConsoleUriHelper.get(uuSchoolKit);
      for (let app of uuObject.appMap) {
        if (app.type === "course") {
          const uuCKcallOpts = await AppClientTokenHelper.createToken(uri, app.uri, session);
          for (let student of studentsList.itemList) {
            const scriptDtoIn = {
              scriptUri: Config.get("uuScriptRegisterStudentToCourse"),
              consoleUri,
              scriptDtoIn: {
                classTeacher: {
                  id: classTeacher.id,
                  uuIdentity: classTeacher.uuIdentity,
                  name: classTeacher.name,
                  surname: classTeacher.surname,
                },
                subjectTeacher: {
                  id: subjectTeacher.id,
                  uuIdentity: subjectTeacher.uuIdentity,
                  name: subjectTeacher.name,
                  surname: subjectTeacher.surname,
                },
                subjectId: uuObject.id.toString(),
                uuSchoolKitBaseUri: uri.toString(),
                studentList: [student],
                uuCkBaseUri: app.uri,
                // TODO fix licenteValidTo
                licenceValidTo: "2025-01-01",
                validFrom: schoolYear.startDate,
                validTo: schoolYear.endDate,
                callOpts: uuCKcallOpts,
              },
            };

            scriptResult = ScriptEngineHelper.uuSchoolKitUpdateStudentToCourse(uuSchoolKit.scriptEngineUri, scriptDtoIn, session);
          }
        }
      }
    }

    // HDS 8
    // 8.2
    try {
      // 8.2.A.
      uuObject = await this.dao.addStudents({ awid, id: uuObject.id }, checkedStudentList);
    } catch (e) {
      // 8.2.B.
      // 8.2.B.1.
      throw new Errors.AddStudents.SubjectDaoAddStudentsFailed({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 9
    return { ...uuObject,scriptResult : scriptResult.data, uuAppErrorMap };
  }

  /**
   * Removes student from a subject.
   * @param uri
   * @param dtoIn
   * @param authResult
   * @param session
   * @param uuAppErrorMap
   * @returns {Promise<{uuAppErrorMap: (*|{})}>}
   */
  async removeStudent(uri, dtoIn, authResult, session, uuAppErrorMap = {}) {
    const auth = await TrustedSubAppAuthorization.checkSubApp(uri, session, authResult.getIdentityProfiles());
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.RemoveStudent,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2, 2.2
    let validationResult = this.validator.validate("subjectRemoveStudentDtoInType", dtoIn);
    // 2.2.1, 2.3, 2.3.1
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.removeStudentUnsupportedKeys.code,
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

    // HDS 4, 4.1, 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.RemoveStudent.SubjectNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5, 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1
      throw new Errors.RemoveStudent.SubjectIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6
    // 6.1
    let studentToRemove = uuObject.studentList && uuObject.studentList.find((s) => s.id === dtoIn.studentId);
    // 6.2.
    if (!studentToRemove) {
      // 6.2.A.1.
      ValidationHelper.addWarning(
        uuAppErrorMap,
        WARNINGS.removeStudentStudentIsNotInSubject.code,
        WARNINGS.removeStudentStudentIsNotInSubject.message,
        { id: dtoIn.studentId }
      );
      // 6.2.A.2.
      return { uuAppErrorMap };
    } else if (studentToRemove.state === StudentAbl.states.former) {
      // 6.2.B.1.
      ValidationHelper.addWarning(
        uuAppErrorMap,
        WARNINGS.removeStudentStudentIsFormerSubjectStudent.code,
        WARNINGS.removeStudentStudentIsFormerSubjectStudent.message,
        { id: studentToRemove.id }
      );
      // 6.2.B.2.
      return { uuAppErrorMap };
    } else {
      if (uuObject.appMap && uuObject.appMap.length > 0) {
        let consoleUri = ConsoleUriHelper.get(uuSchoolKit);
        for (let app of uuObject.appMap) {
          const uuCKcallOpts = await AppClientTokenHelper.createToken(uri, app.uri, session);
          if (app.type === "course") {
            const scriptDtoIn = {
              scriptUri: Config.get("uuScriptUnregisterStudentFromCourse"),
              consoleUri,
              scriptDtoIn: {
                subjectId: uuObject.id.toString(),
                uuSchoolKitBaseUri: uri.toString(),
                studentList: [studentToRemove],
                uuCkBaseUri: app.uri,
                callOpts: uuCKcallOpts,
              },
            };

            ScriptEngineHelper.uuSchoolKitUpdateStudentToCourse(uuSchoolKit.scriptEngineUri, scriptDtoIn, session);
          }
        }
      }
    }

    // HDS 7
    let index = uuObject.studentList.findIndex((student) => student.id === studentToRemove.id);
    uuObject.studentList[index].state = StudentAbl.states.former;
    try {
      // 7.1.A.
      uuObject = await this.dao.update(uuObject);
    } catch (e) {
      // 7.1.B.
      // 7.1.B.1.
      throw new Errors.RemoveStudent.SubjectDaoRemoveStudentFailed(
        { uuAppErrorMap },
        { id: dtoIn.id, studentId: dtoIn.studentId, cause: e }
      );
    }

    return { ...uuObject, uuAppErrorMap };
  }

  /**
   * List all teacher's subjects
   * @param uri
   * @param dtoIn
   * @param profileList
   * @param session
   * @param uuAppErrorMap
   * @returns {itemList}
   */
  async listByTeacher(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.ListByTeacher, uuAppErrorMap);

    // HDS 2, 2.1, 2.2, 2.2.1, 2.3.1
    let validationResult = this.validator.validate("subjectListByTeacherDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.listByTeacherUnsupportedKeys.code,
      Errors.ListByTeacher.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    let teacher = await this.teacherDao.get(awid, dtoIn.teacherId);

    // HDS 4
    // 4.1

    const userUid = session.getIdentity().getUuIdentity();
    if (
      !profileList.includes("Authorities") &&
      !profileList.includes("Executives") &&
      !profileList.includes("Auditors")
    ) {
      if (teacher && teacher.uuIdentity && teacher.uuIdentity !== userUid) {
        throw new Errors.ListByTeacher.UserNotAuthorized({ uuAppErrorMap });
      }
    }
    let itemList = [];
    // 4.2
    if (teacher && teacher.uuIdentity) {
      // 4.2.A.1
      let teacherRoles;
      const listCastsBySideBDtoIn = { code: teacher.uuIdentity };
      // 4.2.A.2
      try {
        // 4.2.A.2.A
        let callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
        teacherRoles = await UuBtHelper.uuRole.listCastsBySideB(uuSchoolKit.btBaseUri, listCastsBySideBDtoIn, callOpts);
      } catch (e) {
        // 4.2.A.2.B
        // 4.2.A.2.B.1
        throw new Errors.ListByTeacher.FailedToLoadUuRoleCasts({ uuAppErrorMap }, e);
      }
      // 4.2.A.3
      let teacherRolesIds = teacherRoles.itemList && teacherRoles.itemList.map((role) => role.id);
      // 4.2.A.4
      let subjectList = await this.dao.list(awid);
      // 4.2.A.5
      // 4.2.A.5.1
      itemList =
        teacherRolesIds &&
        teacherRolesIds.length &&
        subjectList.itemList.filter((subject) => teacherRolesIds.includes(subject.subjectTeacher));
    }

    // HDS 5
    return {
      itemList,
      uuAppErrorMap,
    };
  }

  async listByStudent(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.ListByStudent, uuAppErrorMap);

    // HDS 2, 2.1, 2.2, 2.2.1, 2.3.1
    let validationResult = this.validator.validate("subjectListByStudentDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.listByStudentUnsupportedKeys.code,
      Errors.ListByStudent.InvalidDtoIn
    );

    let student = await this.studentDao.get(awid, dtoIn.studentId);
    // 3.1.1.A
    if (!student) {
      // 3.1.1.A.1
      throw new Errors.ListByStudent.StudentNotFound({ uuAppErrorMap }, { id: dtoIn.studentId });
    }

    // HDS 4

    if (
      !profileList.includes("Authorities") &&
      !profileList.includes("Executives") &&
      !profileList.includes("Auditors")
    ) {
      // 4.1
      const userUid = session.getIdentity().getUuIdentity();

      //4.2
      // 4.2.1, 4.2.1.A
      if (userUid === student.uuIdentity) {
        profileList.push("Student");
      }

      if (student.relatedPersonList && student.relatedPersonList.find((rp) => rp.uuIdentity === userUid)) {
        profileList.push("RelatedPerson");
      }

      profileList = await IsUserTeacher.checkIfUserIsTeacher(
        uri,
        student,
        null,
        uuSchoolKit,
        null,
        session,
        profileList,
        Errors.ListByStudent,
        uuAppErrorMap
      );

      if (profileList.length === 1 && profileList[0] === "StandardUsers") {
        throw new Errors.ListByStudent.UserNotAuthorized({ uuAppErrorMap });
      }
    }

    let dtoOut = await this.dao.listByStudentId(awid, dtoIn.studentId, dtoIn.pageInfo);

    return {
      ...dtoOut,
      uuAppErrorMap,
    };
  }

  async listByClass(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.ListByClass, uuAppErrorMap);

    // HDS 2, 2.1, 2.2, 2.2.1, 2.3.1
    let validationResult = this.validator.validate("subjectListByClassDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.listByClassUnsupportedKeys.code,
      Errors.ListByClass.InvalidDtoIn
    );

    // HDS 3, 3.1
    let list = await this.dao.listByClassId(awid, dtoIn.classId, dtoIn.pageInfo || DEFAULT_PAGE_INFO);

    const callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
    for (let subject of list.itemList) {
      // HDS 4, 4.1
      try {
        const teacherDetailResult = await TeacherDetail.getTeacherDataFromEnvironment(
          uri,
          uuSchoolKit,
          subject,
          uuAppErrorMap,
          Errors.ListByClass,
          session,
          callOpts
        );
        subject = teacherDetailResult.uuObject;
        uuAppErrorMap = teacherDetailResult.uuAppErrorMap;
      } catch (e) {
        //TODO: Obalit vyjímkou? doptat se designera
        throw e;
        // throw new Errors.Load.CallVerifyMyCastExistenceFailed({ uuAppErrorMap });
      }
    }

    // HDS 5
    return {
      ...list,
      uuAppErrorMap,
    };
  }

  async get(uri, dtoIn, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.Get, uuAppErrorMap);

    // HDS 2, 2.1, 2.2, 2.2.1, 2.3.1
    let validationResult = this.validator.validate("subjectGetDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.getUnsupportedKeys.code,
      Errors.Get.InvalidDtoIn
    );

    // HDS 3
    let uuObject;
    // HDS 3.1
    if (dtoIn.id) {
      // 3.1.A.1
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      // 3.1.B.1
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4, 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.Get.SubjectNotFound({ uuAppErrorMap }, dtoIn.id ? { id: dtoIn.id } : { code: dtoIn.code });
    }

    // HDS 5
    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }

  async delete(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.Delete, allowedStates, uuAppErrorMap);

    // HDS 2, 2.1, 2.2, 2.2.1, 2.3.1
    let validationResult = this.validator.validate("subjectDeleteDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.deleteUnsupportedKeys.code,
      Errors.Delete.InvalidDtoIn
    );

    // HDS 3
    let uuObject;
    // HDS 3.1
    if (dtoIn.id) {
      // 3.1.A.1
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      // 3.1.B.1
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4, 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.Delete.SubjectNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5, 5.1
    if (uuObject.state !== Subject.States.CLOSED) {
      // 5.1.A.1
      throw new Errors.Delete.SubjectIsNotInFinalState({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 6, 6.1
    const uuObcDeleteDtoIn = { id: uuObject.artifactId };
    // HDS 6.2
    try {
      // HDS 6.2.A
      let callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      await UuBtHelper.uuObc.delete(uuSchoolKit.btBaseUri, uuObcDeleteDtoIn, callOpts);
    } catch (e) {
      // 6.2.B.1
      throw new Errors.Delete.DeleteUuObcFailed({ uuAppErrorMap }, { cause: e, id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 7
    try {
      await this.dao.delete(awid, uuObject.id);
    } catch (e) {
      // 7.1
      throw new Errors.Delete.SubjectDaoDeleteFailed({ uuAppErrorMap }, { cause: e, id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 8
    return { uuAppErrorMap };
  }

  _addToWarningMap(uuAppErrorMap, warningKey, paramMap, arrayKey = "studentList") {
    let warning = WARNINGS[warningKey];
    if (!uuAppErrorMap[warning.code]) {
      ValidationHelper.addWarning(uuAppErrorMap, warning.code, warning.message, { [arrayKey]: [] });
    }
    uuAppErrorMap[warning.code].paramMap[arrayKey].push(paramMap);
    return uuAppErrorMap;
  }

  _throwCorrespondingError(e, uuAppErrorMap) {
    let error;
    switch (e.code) {
      case "invalidHomeFolderState":
        // 7.2.B.2.A.
        // 7.2.B.2.A.1
        error = new Errors.Create.LocationIsNotInProperState({ uuAppErrorMap }, e);
        break;
      case "locationDoesNotExist":
        // 7.2.B.2.B.
        // 7.2.B.2.B.1.
        error = new Errors.Create.FolderDoesNotExist({ uuAppErrorMap }, e);
        break;
      case "userIsNotAuthorizedToAddArtifact":
        // 7.2.B.2.C.
        // 7.2.B.2.C.1
        error = new Errors.Create.UserIsNotAuthorizedToAddArtifact({ uuAppErrorMap }, e);
        break;
      default:
        // 7.2.B.2.D.
        // 7.2.B.2.D.1
        error = new Errors.Create.CallUuObcCreateFailed({ uuAppErrorMap }, e);
        break;
    }
    throw error;
  }
}

module.exports = new SubjectAbl();

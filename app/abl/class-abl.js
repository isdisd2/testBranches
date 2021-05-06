"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { UriBuilder } = require("uu_appg01_server").Uri;
const { Config } = require("uu_appg01_server").Utils;
const StudentAbl = require("./student-abl.js");
const TeacherAbl = require("./teacher-abl.js");
const AppClientTokenHelper = require("./helpers/app-client-token-helper.js");
const UuBtHelper = require("./helpers/uu-bt-helper.js");
const ScriptEngineHelper = require("./helpers/scripts-helpers");
const InstanceChecker = require("../components/instance-checker");
const StateChecker = require("../components/state-checker");
const IsUserTeacher = require("../components/isUserTeacher-checker");
const TeacherDetail = require("../components/teacher-detail");
const { Activity, TYPES: activityTypes, dateFunctions } = require("../components/activity");
const { Schemas, SchoolKit, SchoolYear, Class } = require("./common-constants");
const ConsoleUriHelper = require("../components/console-uri-helper");
const UserRoleChecker = require("../components/user-roles-checker");

const Errors = require("../api/errors/class-error.js");
const WARNINGS = {
  createUnsupportedKeys: {
    code: `${Errors.Create.UC_CODE}unsupportedKeys`,
  },
  createFailedToDeleteAfterRollback: {
    code: `${Errors.Create.UC_CODE}failedToDeleteAfterRollback`,
    message: "System failed to delete uuObject after an exception has been thrown in uuObcIfc/create use case.",
  },
  createClassNotFound: {
    code: `${Errors.Create.UC_CODE}classNotFound`,
    message: "Class not found.",
  },
  createClassUpdateDaoFailed: {
    code: `${Errors.Create.UC_CODE}classUpdateDaoFailed`,
    message: "Class update failed.",
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
  updateNumberInClassUnsupportedKeys: {
    code: `${Errors.UpdateNumberInClass.UC_CODE}unsupportedKeys`,
  },
  listBySchoolYearUnsupportedKeys: {
    code: `${Errors.ListBySchoolYear.UC_CODE}unsupportedKeys`,
  },
  listByTeacherUnsupportedKeys: {
    code: `${Errors.ListByTeacher.UC_CODE}unsupportedKeys`,
  },
  listByStudent: {
    code: `${Errors.ListByStudent.UC_CODE}unsupportedKeys`,
  },
  updateUnsupportedKeys: {
    code: `${Errors.Update.UC_CODE}unsupportedKeys`,
  },
  updatePreviousClassIdDoesntExists: {
    code: `${Errors.Create.UC_CODE}previousClassIdDoesntExists`,
    message: "Some previous class id doesn't`t exists.",
  },
  updateByClassTeacherPreviousClassIdDoesntExists: {
    code: `${Errors.UpdateByClassTeacher.UC_CODE}previousClassIdDoesntExists`,
    message: "Some previous class id doesn't`t exists.",
  },
  updateByClassTeacherUnsupportedKeys: {
    code: `${Errors.UpdateByClassTeacher.UC_CODE}unsupportedKeys`,
  },
  addStudentsUnsupportedKeys: {
    code: `${Errors.AddStudents.UC_CODE}unsupportedKeys`,
  },
  addStudentsStudentIsAlreadyInOtherClassInAcitveState: {
    code: `${Errors.AddStudents.UC_CODE}studentIsAlreadyInOtherClassInAcitveState`,
  },
  addStudentsStudentIsAlreadyInClass: {
    code: `${Errors.AddStudents.UC_CODE}studentIsAlreadyInClass`,
  },
  addStudentsNumberInClassIsAlreadyTaken: {
    code: `${Errors.AddStudents.UC_CODE}numberInClassIsAlreadyTaken`,
  },
  addStudentsStudentNotFound: {
    code: `${Errors.AddStudents.UC_CODE}studentNotFound`,
  },
  addStudentsStudentIsNotInCorrectState: {
    code: `${Errors.AddStudents.UC_CODE}studentIsNotInCorrectState`,
  },
  removeStudentUnsupportedKeys: {
    code: `${Errors.RemoveStudent.UC_CODE}unsupportedKeys`,
  },
  removeStudentStudentIsNotInClass: {
    code: `${Errors.RemoveStudent.UC_CODE}studentIsNotInClass`,
  },
  removeStudentStudentIsFormerClassStudent: {
    code: `${Errors.RemoveStudent.UC_CODE}studentIsFormerClassStudent`,
  },
  setStateUnsupportedKeys: {
    code: `${Errors.SetState.UC_CODE}unsupportedKeys`,
  },
  setFinalStateUnsupportedKeys: {
    code: `${Errors.SetFinalState.UC_CODE}unsupportedKeys`,
  },
  activeRelatedSubjectFound: {
    code: `${Errors.SetFinalState.UC_CODE}activeRelatedSubjectFound`,
    message: "Related subjects are active: ",
  },
  deleteUnsupportedKeys: {
    code: `${Errors.Delete.UC_CODE}unsupportedKeys`,
  },
  deleteClassNotFound: {
    code: `${Errors.Delete.UC_CODE}classNotFound`,
    message: "Class not found.",
  },
  teacherAlreadyExist: {
    code: `${Errors.Create.UC_CODE}teacherAlreadyExist`,
    message: "Teacher already exist.",
  },
};

const TYPE_CODE = "uu-schoolkit-schoolg01/class";
const STATES = Object.freeze({
  initial: "initial",
  active: "active",
  prepared: "prepared",
  warning: "warning",
  problem: "problem",
  passive: "passive",
  closed: "closed",
});

const ACTIVE_STATES = [STATES.initial, STATES.prepared, STATES.active, STATES.warning, STATES.problem];

const SUBJECTS_FOLDER = "Subjects";
const DEFAULT_PAGE_INFO = {
  pageIndex: 0,
  pageSize: 1000,
};

class ClassAbl {
  constructor() {
    this.validator = Validator.load();
    this.typeCode = TYPE_CODE;
    this.states = STATES;
    this.subjectsFolder = SUBJECTS_FOLDER;
    this.dao = DaoFactory.getDao(Schemas.CLASS);
    this.schoolKitDao = DaoFactory.getDao(Schemas.SCHOOLKIT);
    this.schoolYearDao = DaoFactory.getDao(Schemas.SCHOOL_YEAR);
    this.classDao = DaoFactory.getDao(Schemas.CLASS);
    this.subjectDao = DaoFactory.getDao(Schemas.SUBJECT);
    this.studentDao = DaoFactory.getDao(Schemas.STUDENT);
    this.teacherDao = DaoFactory.getDao(Schemas.TEACHER);
  }

  /**
   * Update student class number
   * @param uri
   * @param dtoIn
   * @param session
   * @param profileList
   * @param uuAppErrorMap
   * @returns {Promise<void>}
   */
  async updateNumberInClass(uri, dtoIn, session, profileList, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.UpdateNumberInClass, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("classUpdateNumberInClassDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.updateNumberInClassUnsupportedKeys.code,
      Errors.UpdateNumberInClass.InvalidDtoIn
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
      throw new Errors.UpdateNumberInClass.ClassNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5, 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1
      throw new Errors.UpdateNumberInClass.ClassIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }
    // HDS 6
    let callOpts = {};
    if (!profileList.includes("Authorities") && !profileList.includes("Executives")) {
      // 6.1
      const userUuIdentity = session.getIdentity().getUuIdentity();
      // 6.2, 6.2.1
      let roleGroupIfcList = [{ id: uuObject.classTeacher }];

      let verifyMyCastExistenceDtoOut = {};

      // 6.2.2, 6.2.2.A
      try {
        callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
        verifyMyCastExistenceDtoOut = await UuBtHelper.verifyMyCastExistence(
          uuSchoolKit.btBaseUri,
          { roleGroupIfcList: roleGroupIfcList },
          callOpts
        );
      } catch (e) {
        // 6.2.2.B
        throw new Errors.UpdateNumberInClass.CallVerifyMyCastExistenceFailed({ uuAppErrorMap });
      }

      // 6.2.3
      const isClassTeacher = verifyMyCastExistenceDtoOut.roleGroupIfcList.find(
        (uuRole) => uuRole.id === uuObject.classTeacher
      );
      // 6.2.3.A
      if (!isClassTeacher) {
        // 6.2.3.A.1
        throw new Errors.UpdateNumberInClass.UserNotAuthorized({ uuAppErrorMap }, { uuIdentity: userUuIdentity });
      } else {
        profileList.push("ClassTeacher");
      }
    }

    // HDS 7, 7.1
    let studentIsClassStudent;
    if (uuObject.studentList && uuObject.studentList.length) {
      studentIsClassStudent = uuObject.studentList.find((student) => student.id === dtoIn.studentId);
    }
    // 7.1.A
    if (!studentIsClassStudent) {
      // 7.1.A.1
      throw new Errors.UpdateNumberInClass.StudentIsNotInClass(
        { uuAppErrorMap },
        { id: dtoIn.studentId, number: dtoIn.number }
      );
    }

    // 7.1.B
    const studentsNumberList = uuObject.studentList.map((student) => student.number);
    if (studentsNumberList.includes(Number(dtoIn.number))) {
      // 7.1.B.1
      throw new Errors.UpdateNumberInClass.NumberInClassIsAlreadyTaken(
        { uuAppErrorMap },
        { id: dtoIn.studentId, number: dtoIn.number }
      );
    }

    // 7.2, 7.2.1
    const student = await this.studentDao.get(awid, dtoIn.studentId);

    // 7.2.2, 7.2.2.A
    if (!student) {
      // 7.2.2.A.1
      throw new Errors.UpdateNumberInClass.StudentNotFound({ uuAppErrorMap }, { id: dtoIn.studentId });

      // 7.2.2.B
    } else if (student.state === StudentAbl.states.closed) {
      // 7.2.2.B.1
      throw new Errors.UpdateNumberInClass.StudentIsNotInCorrectState(
        { uuAppErrorMap },
        { id: student.id, state: student.state }
      );
    }

    // HDS 8, 8.1, 8.1.A
    try {
      uuObject = await this.dao.updateStudentClassNumber(uuObject, student.id.toString(), dtoIn.number);

      // 8.1.B
    } catch (e) {
      // 8.1.B.1
      throw new Errors.UpdateNumberInClass.classDaoUpdateFailed({ uuAppErrorMap }, { cause: e });
    }

    return { ...uuObject, uuAppErrorMap };
  }

  /**
   * This cmd creates a class
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns {Promise<{...uuClass, artifactEnvironment, uuAppErrorMap}>}
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
    let validationResult = this.validator.validate("classCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.createUnsupportedKeys.code,
      Errors.Create.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    let schoolYear = await this.schoolYearDao.get(awid, dtoIn.schoolYearId);
    if (!schoolYear) {
      // 3.2
      // 3.2.1.A.1
      throw new Errors.Create.SchoolYearNotFound({ uuAppErrorMap });
    }

    // HDS 4
    // 4.1
    // 4.1.A
    // 4.1.A.1.
    let stateError = Errors.Create.SchoolYearIsNotInCorrectState;
    allowedStates = SchoolYear.NonFinalStatesWithoutPassive;
    StateChecker.ensureState(schoolYear, stateError, allowedStates, uuAppErrorMap);

    //TODO: Upravit HDS a testy. až bude zaneseno v dokumentaci
    let uuClass = await this.dao.getByCode(awid, dtoIn.code);
    // 5.1
    if (uuClass) {
      // 5.1.1.A
      // 5.1.1.A.1
      throw new Errors.Create.ClassWithCodeAlreadyExist({ uuAppErrorMap }, { code: dtoIn.code });
    }

    // HDS 6
    let callOpts = {};
    const { btBaseUri } = uuSchoolKit;
    // 6.1
    dtoIn.classTeacherId = dtoIn.classTeacherId || session.getIdentity().getUuIdentity();
    // 6.2
    let classTeacherRole;
    // 6.3, 6.3.A
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
      classTeacherRole = await UuBtHelper.uuRoleIfc.get(btBaseUri, { code: dtoIn.classTeacherId }, callOpts);
      // 6.3.B
    } catch (e) {
      throw new Errors.Create.FailedToGetClassTeacherRole({ uuAppErrorMap }, { cause: e });
    }

    // 6.4, 6.4.1

    let teacherRolesAllowedStates =
      (classTeacherRole && classTeacherRole.state && ACTIVE_STATES.includes(classTeacherRole.state)) || false;

    // 6.4.2, 6.4.2.A
    if (!teacherRolesAllowedStates) {
      // 6.4.2.A.1
      throw new Errors.Create.ClassTeacherRoleIsNotInCorrectState(
        { uuAppErrorMap },
        { state: classTeacherRole.role.state }
      );
    }

    // HDS 7
    // 7.1

    // 7.2
    let teacher = await this.teacherDao.getByUuIdentity(awid, classTeacherRole.mainUuIdentity);
    // 7.3
    if (teacher) {
      // 7.3.A.1
      ValidationHelper.addWarning(
        uuAppErrorMap,
        WARNINGS.teacherAlreadyExist.code,
        WARNINGS.teacherAlreadyExist.message,
        { uuIdentity: dtoIn.classTeacherId }
      );
    } else {
      // 7.3.B.
      let teacherCreateUri = UriBuilder.parse(uri).setUseCase(TeacherAbl.useCases.create).clearParameters().toUri();
      try {
        // 7.3.B.1.2.A
        teacher = await TeacherAbl.create(
          teacherCreateUri,
          { uuIdentity: classTeacherRole.mainUuIdentity },
          session,
          uuAppErrorMap
        );
      } catch (e) {
        // 7.3.B.1.2.B
        throw new Errors.Create.TeacherCreateDaoFailed({ uuAppErrorMap }, e);
      }
    }

    // HDS 8
    // 8.1
    // 8.2

    const uuUnitDtoIn = {
      name: dtoIn.name,
      code: dtoIn.code + "_unit",
      desc: dtoIn.desc,
      locationCode: schoolYear.code + "/classes",
      responsibleRoleCode: session.getIdentity().getUuIdentity(),
    };
    // 8.2.A
    let uuUnit;
    try {
      uuUnit = await UuBtHelper.uuUnit.create(btBaseUri, uuUnitDtoIn, callOpts);
    } catch (e) {
      // 8.2.B
      // 8.2.B.1
      throw new Errors.Create.FailedToCreateUuUnit({ uuAppErrorMap }, e);
    }

    // HDS 9
    // 9.1
    // todo: this would not work since uuUnit/create does not create roles folder. (Its created by a script)
    let uuRoleCreateDtoIn = { name: `Class Teacher ${dtoIn.name}`, locationCode: `${uuUnit.code}` };
    // let uuRoleCreateDtoIn = { name: `Teacher ${dtoIn.name}`, locationCode: `${uuUnit.code}/roles` };
    let uuRole;
    // 9.2
    // 9.2.A
    try {
      uuRole = await UuBtHelper.uuRole.create(btBaseUri, uuRoleCreateDtoIn, callOpts);
    } catch (e) {
      // 9.2.B
      // 9.2.B.1
      throw new Errors.Create.FailedToCreateUuRole({ uuAppErrorMap }, e);
    }
    // 9.3

    let uuRoleAddCastDtoIn = { id: uuRole.id, sideBCode: dtoIn.classTeacherId };
    // 9.4
    // 9.4.A
    try {
      await UuBtHelper.uuRole.addCast(btBaseUri, uuRoleAddCastDtoIn, callOpts);
    } catch (e) {
      // 9.4.B
      // 9.4.B.1
      throw new Errors.Create.FailedToAddCastUuRole({ uuAppErrorMap }, e);
    }

    // HDS 10
    // 10.1
    let uuUnitSetResponsibleRoleDtoIn = { id: uuUnit.id, responsibleRole: uuRole.id };
    try {
      // 10.2
      // 10.2.A
      await UuBtHelper.uuUnit.setResponsibleRole(btBaseUri, uuUnitSetResponsibleRoleDtoIn, callOpts);
    } catch (e) {
      // 10.2.B
      // 10.2.B.1
      throw new Errors.Create.UuUnitFailedToSetResponsibleRole({ uuAppErrorMap }, e);
    }

    // HDS 11
    // 11.1
    delete dtoIn.classTeacherId;
    let uuObject = { ...dtoIn, awid, state: this.states.initial, classTeacher: uuRole.id, nextYearClassMap: {} };
    try {
      // 11.2
      // 11.2.A
      uuObject = await this.dao.create(uuObject);
    } catch (e) {
      // 11.2.B
      if (e.code === "uu-app-objectstore/duplicateKey") {
        // 11.2.B.1.A.
        // 11.2.B.1.A.1
        throw new Errors.Create.ClassWithCodeAlreadyExist({ uuAppErrorMap }, e);
      }
      // 11.2.B.1
      throw new Errors.Create.ClassCreateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 12
    // 12.1
    let artifactEnvironment;
    const uuObUri = UriBuilder.parse(uri)
      .setUseCase("classDetail")
      .setParameters({ id: uuObject.id.toString() })
      .toUri()
      .toString();
    let uuObcCreateDtoIn = {
      typeCode: this.typeCode,
      code: dtoIn.code,
      name: dtoIn.name,
      desc: dtoIn.desc,
      location: uuUnit.id,
      uuObId: uuObject.id,
      uuObUri,
      competentRole: uuRole.id,
    };
    try {
      // 12.2
      // 12.2.A
      artifactEnvironment = await UuBtHelper.uuObc.create(btBaseUri, uuObcCreateDtoIn, callOpts);
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
          WARNINGS.createFailedToDeleteAfterRollback.code,
          WARNINGS.createFailedToDeleteAfterRollback.message,
          { cause: e }
        );
      }
      // 12.2.B.2
      this._throwCorrespondingError(e, uuAppErrorMap);
    }

    // HDS 13
    // 13.1
    let uuFolderCreateDtoIn = { name: this.subjectsFolder, code: `${dtoIn.code}/subjects`, location: uuUnit.id };
    let subjectsFolder;
    try {
      subjectsFolder = await UuBtHelper.uuFolder.create(btBaseUri, uuFolderCreateDtoIn, callOpts);
    } catch (e) {
      try {
        await this.dao.delete(awid, uuObject.id);
        await UuBtHelper.uuObc.setState(btBaseUri, { id: uuObject.artifactId, state: this.states.closed });
        await UuBtHelper.uuObc.delete(btBaseUri, { id: uuObject.artifactId });
      } catch (e) {
        // 13.2.B.1.B
        // 13.2.B.1.B.1
        ValidationHelper.addWarning(
          uuAppErrorMap,
          WARNINGS.createFailedToDeleteAfterRollback.code,
          WARNINGS.createFailedToDeleteAfterRollback.message,
          { cause: e }
        );
      }
      throw new Errors.Create.CallFolderCreateFailed({ uuAppErrorMap }, e);
    }

    // HDS 13
    // 13.1
    const previousYearClassIds = (dtoIn.previousYearClassMap && Object.keys(dtoIn.previousYearClassMap)) || [];
    let checkedPreviousYearClassMap = {};
    // 13.2
    // FIXME urrčitě nelistovat po jednom, tohle má být dělané listem
    for (let classId of previousYearClassIds) {
      // 13.2.1.
      let uuClass = await this.dao.get(awid, classId);
      // 13.2.1.1.
      if (!uuClass) {
        // 13.2.1.1.A.
        // 13.2.1.1.A.1.
        ValidationHelper.addWarning(
          uuAppErrorMap,
          WARNINGS.createClassNotFound.code,
          WARNINGS.createClassNotFound.message,
          { id: classId }
        );
      } else {
        // 13.2.1.1.B.
        // 13.2.1.1.B.1
        // Class object in previousYearClassMap is yet to be defined. We will keep it as an empty object for now.
        checkedPreviousYearClassMap[classId] = {};
      }
    }

    // HDS 14
    // 14.1
    try {
      // 14.1.A.
      uuObject = await this.dao.update({
        ...uuObject,
        artifactId: artifactEnvironment.id,
        subjectsFolderId: subjectsFolder.id,
        previousYearClassMap: checkedPreviousYearClassMap,
      });
    } catch (e) {
      // 14.1.B.
      // 14.1.B.1
      throw new Errors.Create.ClassUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 15
    // 15.3.1
    const nextYearClass = { id: uuObject.id.toString(), nextYearClass: {} };
    // TODO nelze toto řešit také s updateMany?
    for (let classId of Object.keys(checkedPreviousYearClassMap)) {
      // 15.1.1
      try {
        // 15.1.1.A.
        await this.dao.addNextYearClass({ awid, id: classId }, nextYearClass);
      } catch (e) {
        // 15.1.1.B.
        // 15.1.1.B.1
        ValidationHelper.addWarning(
          uuAppErrorMap,
          WARNINGS.createClassUpdateDaoFailed.code,
          WARNINGS.createClassUpdateDaoFailed.message,
          { id: classId }
        );
      }
    }

    // HDS 16
    let actualUuFolder, unitExecutivesId;
    try {
      actualUuFolder = await UuBtHelper.uuFolder.load(
        btBaseUri,
        { id: uuSchoolKit.btSchoolYearId, loadContext: true },
        callOpts
      );
      unitExecutivesId = actualUuFolder.data.context.unit.unitGroupMap["2"];
    } catch (e) {
      throw new Errors.Create.FailedToCallSetUnitPermissionScript({ uuAppErrorMap }, { cause: e });
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
      // TODO toto je asynchronně, bez awaitu, je to správně?
      ScriptEngineHelper.uuSchoolKitSetUnitPermissions(uuSchoolKit.scriptEngineUri, scriptDtoIn, session); //FIXME: waiting for BT fix
    } catch (e) {
      // FIXME why?
      // Protože pokud BTčko dodá fix, tak to budeme moct nechat v try/catch, te´d je tam zbytačný(uznávám),  je to script a je to bez awaitu, to je proto, abychom zbytečně nebrzdili server když se stejně nedovíme kdyby něco padlo
      throw e;
    }

    const activityDtoIn = {
      id: uuObject.artifactId,
      submitterCode: session.getIdentity().getUuIdentity(),
      solverList: [
        {
          solverCode: teacher.uuIdentity,
        },
      ],
      type: activityTypes.doIt,
      name: Activity.createLsiContent("class", "name"),
      desc: Activity.createLsiContent("class", "desc"),
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

    // HDS 17
    return {
      ...uuObject,
      activityResult,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  async setFinalState(uri, dtoIn, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();
    // HDS 1

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
      WARNINGS.setFinalStateUnsupportedKeys.code,
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
      throw new Errors.SetFinalState.ClassNotFound({ uuAppErrorMap });
    }

    // HDS 5, 5.1
    // 5.1.A
    if (uuObject.state === STATES.closed) {
      // 5.1.A.1
      throw new Errors.SetFinalState.ClassIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6
    // 6.1
    const subjectList = await this.subjectDao.listByClassId(awid, uuObject.id.toString(), DEFAULT_PAGE_INFO);

    // 6.2, 6.2.1
    // 6.2.2
    let warnings = [];
    subjectList.itemList.forEach((item) => {
      // 6.2.2.1.A
      // todo add state from subjectAbl
      if (item.state !== STATES.closed) {
        warnings.push(item.name);
      }
    });
    // 6.2.3
    // 6.2.3.A
    if (warnings.length) {
      ValidationHelper.addWarning(
        uuAppErrorMap,
        WARNINGS.activeRelatedSubjectFound.code,
        WARNINGS.activeRelatedSubjectFound.message + warnings.join(", ")
      );
      // 6.2.3.A.1
      throw new Errors.SetFinalState.ExistingActiveRelatedSubject({ uuAppErrorMap });
    }

    // HDS 7
    // 7.1
    const dtoInUuArtifactIfcAarListByArtifactB = {
      id: uuObject.artifactId,
    };

    // 7.2
    let callOpts = {};
    const { btBaseUri } = uuSchoolKit;
    let listByArtifactBDtoOut;
    // 7.2.A
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
      listByArtifactBDtoOut = await UuBtHelper.uuArtifactIfc.listByArtifactB(
        btBaseUri,
        dtoInUuArtifactIfcAarListByArtifactB,
        callOpts
      );

      // 7.2.B
    } catch (e) {
      // 7.2.B.1
      throw new Errors.SetFinalState.CheckExistenceOfActiveRelatedArtifactsFailed({ uuAppErrorMap }, e);
    }

    // 7.3, 7.3.1, 7.3.1.1
    listByArtifactBDtoOut.itemList.forEach((item) => {
      // 7.3.1.1.A.
      // todo add state from subjectAbl
      if (item.artifactAState !== STATES.closed) {
        // 7.3.1.1.A.1.
        throw new Errors.SetFinalState.ExistingActiveAARBySideB({ uuAppErrorMap });
      }
    });

    // HDS 8
    // 8.1
    const dtoInUuObcSetState = {
      id: uuObject.artifactId,
      state: STATES.closed,
      desc: dtoIn.desc,
      data: dtoIn.stateData,
    };
    let artifactEnvironment;
    // 8.2, 8.2.A
    try {
      artifactEnvironment = await UuBtHelper.uuObc.setState(btBaseUri, dtoInUuObcSetState, callOpts);

      // 8.2.B.
    } catch (e) {
      // 8.2.B.1.
      throw new Errors.SetFinalState.UuObcSetStateFailed({ uuAppErrorMap }, e);
    }
    // HDS 9
    // 9.1
    // 9.1.A.
    uuObject.state = STATES.closed;
    try {
      uuObject = await this.dao.update(uuObject);
    } catch (e) {
      // 9.1.B.
      throw new Errors.SetFinalState.ClassUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    const teacherDetailResult = await TeacherDetail.getTeacherDataFromEnvironment(
      uri,
      uuSchoolKit,
      uuObject,
      uuAppErrorMap,
      Errors.SetFinalState,
      session,
      callOpts,
      artifactEnvironment
    );
    uuObject = teacherDetailResult.uuObject;
    uuAppErrorMap = teacherDetailResult.uuAppErrorMap;

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
    let validationResult = this.validator.validate("classSetStateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.setStateUnsupportedKeys.code,
      Errors.SetState.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    // TODO tohle je na spoustě míst, na to by se hodilo mít nějakou uuAppComponentu, co
    // 1) načte podle id nebo code
    // 2) ověří existenci, případně vyhodí error
    // 3) ověří stav, případně vyhodí error - podobně jako validace uuSchoolKitu
    // tím budeš mít ve spoustě commandů třeba o 20 řádků míň
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
      throw new Errors.SetState.ClassNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.SetState.ClassIsNotInCorrectState({ uuAppErrorMap }, { id: uuObject.id, state: uuObject.state });
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
      throw new Errors.SetState.ClassDaoUpdateFailed({ uuAppErrorMap }, e);
    }

    const teacherDetailResult = await TeacherDetail.getTeacherDataFromEnvironment(
      uri,
      uuSchoolKit,
      uuObject,
      uuAppErrorMap,
      Errors.SetFinalState,
      session,
      callOpts,
      artifactEnvironment
    );
    uuObject = teacherDetailResult.uuObject;
    uuAppErrorMap = teacherDetailResult.uuAppErrorMap;

    // HDS 8
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  async update(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.Update, allowedStates, uuAppErrorMap);

    // HDS 2, 2.2
    let validationResult = this.validator.validate("classUpdateDtoInType", dtoIn);
    // 2.2.1, 2.3, 2.3.1
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.updateUnsupportedKeys.code,
      Errors.Update.InvalidDtoIn
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
      throw new Errors.Update.ClassNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5, 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1
      throw new Errors.Update.ClassIsNotInCorrectState({ uuAppErrorMap }, { id: uuObject.id, state: uuObject.state });
    }

    // HDS 6
    let callOpts = {};
    const { btBaseUri } = uuSchoolKit;
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
    } catch (e) {
      // A6
      throw new Errors.Update.AppClientTokenCreateFailed({ uuAppErrorMap }, e);
    }

    // HDS 7, 7.1, 7.1.A
    let artifactEnvironment;
    if (
      (dtoIn.name && dtoIn.name !== uuObject.name) ||
      (dtoIn.code && dtoIn.code !== uuObject.code) ||
      (dtoIn.desc && dtoIn.desc !== uuObject.desc)
    ) {
      // 7.1.A.1
      const dtoInUuObcSetBasicAttributes = {
        id: uuObject.artifactId,
        name: dtoIn.name,
        code: dtoIn.code,
        desc: dtoIn.desc,
      };
      // 7.1.A.2
      try {
        // 7.1.A.2.A.
        artifactEnvironment = await UuBtHelper.uuObc.setBasicAttributes(
          btBaseUri,
          dtoInUuObcSetBasicAttributes,
          callOpts
        );
        // 7.1.A.2.B.
      } catch (e) {
        // 7.1.A.2.B.1.
        throw new Errors.Update.SetBasicUuObcArtifactAttributesFailed({ uuAppErrorMap }, e);
      }
    }

    // HDS 8, 8.1, 8.1.A
    if ((dtoIn.name && dtoIn.name !== uuObject.name) || (dtoIn.code && dtoIn.code !== uuObject.code)) {
      // 8.1.A.1.
      const dtoInUuUnitSetBasicAttributes = {
        id: artifactEnvironment.unit,
        name: dtoIn.name,
        code: dtoIn.code + "_unit",
      };
      // 8.1.A.2., 8.1.A.2.A.
      try {
        await UuBtHelper.uuUnit.setBasicAttributes(btBaseUri, dtoInUuUnitSetBasicAttributes, callOpts);

        // 8.1.A.2.B
      } catch (e) {
        //8.1.A.2.B.1.
        throw new Errors.Update.SetBasicUuUnitArtifactAttributesFailed({ uuAppErrorMap }, e);
      }
    }

    // HDS 9, 9.1, 9.1.A
    if (dtoIn.code && dtoIn.code !== uuObject.code) {
      // 9.1.A.1.
      const dtoInUuFolderSetBasicAttributes = {
        id: uuObject.subjectsFolderId,
        code: dtoIn.code + "/subjects",
      };
      //9.1.A.2., 9.1.A.2.A.
      try {
        await UuBtHelper.uuFolder.setBasicAttributes(btBaseUri, dtoInUuFolderSetBasicAttributes, callOpts);

        // 9.1.A.2.B.
      } catch (e) {
        // 9.1.A.2.B.1.

        throw new Errors.Update.SetBasicUuFolderAttributesFailed({ uuAppErrorMap }, e);
      }
    }

    // HDS 10, 10.1, 10.1.A
    let updatedObject = {
      ...uuObject,
      ...dtoIn,
    };

    const updatePreviousYearClassesResultObject = await this._updatePreviousYearClasses(
      awid,
      dtoIn,
      updatedObject,
      WARNINGS.updatePreviousClassIdDoesntExists,
      uuAppErrorMap
    );
    updatedObject = updatePreviousYearClassesResultObject.classObject;
    uuAppErrorMap = updatePreviousYearClassesResultObject.uuAppErrorMap;

    const teacherDetailResult = await TeacherDetail.getTeacherDataFromEnvironment(
      uri,
      uuSchoolKit,
      uuObject,
      uuAppErrorMap,
      Errors.Update,
      session,
      callOpts,
      artifactEnvironment
    );
    uuObject = teacherDetailResult.uuObject;
    uuAppErrorMap = teacherDetailResult.uuAppErrorMap;

    try {
      uuObject = await this.dao.update(updatedObject);
      //10.1.B.
    } catch (e) {
      //10.1.B.1

      throw new Errors.Update.ClassUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 11
    if (uuObject.previousYearClassMap) {
      uuObject = await this._returnRelatedClassListData(uuObject);
    }
    let schoolYear = await this.schoolYearDao.get(awid, uuObject.schoolYearId);

    return {
      ...uuObject,
      schoolYear,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  /**
   * Updates class manually by class teacher.
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns {class, artifactEnvironment, uuAppErrorMap}
   */
  async updateByClassTeacher(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.UpdateByClassTeacher,
      allowedStates,
      uuAppErrorMap
    );

    //HDS 2, 2.2
    let validationResult = await this.validator.validate("classUpdateByClassTeacherDtoInType", dtoIn);
    // 2.2.1, 2.3, 2.3.1
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.updateByClassTeacherUnsupportedKeys.code,
      Errors.UpdateByClassTeacher.InvalidDtoIn
    );

    //HDS 3, 3.1
    let uuObject;
    // 3.1
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
      throw new Errors.UpdateByClassTeacher.ClassNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5, 5.1, 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1
      throw new Errors.UpdateByClassTeacher.ClassIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6, 6.1
    let callOpts = {};
    const { btBaseUri } = uuSchoolKit;
    try {
      // 6.1.A
      callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
    } catch (e) {
      // 6.1.B, 6.1.B.1
      throw new Errors.UpdateByClassTeacher.AppClientTokenCreateFailed({ uuAppErrorMap }, e);
    }

    // HDS 7, 7.1
    let roleGroupIfcList = [{ id: uuObject.classTeacher }];
    // 7.2
    let verifyMyCastExistenceDtoOut = {};
    try {
      //7.3, 7.3.A
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      verifyMyCastExistenceDtoOut = await UuBtHelper.verifyMyCastExistence(
        uuSchoolKit.btBaseUri,
        { roleGroupIfcList: roleGroupIfcList },
        callOpts
      );
    } catch (e) {
      // 7.3.B, 7.3.B.1
      throw new Errors.UpdateByClassTeacher.CallVerifyMyCastExistenceFailed({ uuAppErrorMap }, e);
    }

    // 7.4
    if (verifyMyCastExistenceDtoOut.roleGroupIfcList.length === 0) {
      throw new Errors.UpdateByClassTeacher.UserNotAuthorized({ uuAppErrorMap });
    }

    // HDS 8
    let artifactEnvironment;
    // 8.1, 8.1.A
    if (dtoIn.name && dtoIn.name != uuObject.name) {
      // 8.1.A.1
      let dtoInUuObcSetBasicAttributes = {
        id: uuObject.artifactId,
        name: dtoIn.name,
      };
      // 8.1.A.2, 8.1.A.2.A
      try {
        artifactEnvironment = await UuBtHelper.uuObc.setBasicAttributes(
          btBaseUri,
          dtoInUuObcSetBasicAttributes,
          callOpts
        );
      } catch (e) {
        // 8.1.A.2.B, 8.1.A.2.B.1
        throw new Errors.UpdateByClassTeacher.SetBasicUuObcArtifactAttributesFailed({ uuAppErrorMap }, e);
      }
    }

    // HDS 9, 9.1, 9.1.A
    if (dtoIn.name && dtoIn.name != uuObject.name) {
      // 9.1.A.1
      let dtoInUuUnitSetBasicAttributes = {
        id: artifactEnvironment.unit,
        name: dtoIn.name,
      };
      // 9.1.A.2, 9.1.A.2.A
      try {
        await UuBtHelper.uuUnit.setBasicAttributes(btBaseUri, dtoInUuUnitSetBasicAttributes, callOpts);
      } catch (e) {
        // 9.1.A.2.B, 9.1.A.2.B.1
        throw new Errors.UpdateByClassTeacher.SetBasicUuUnitArtifactAttributesFailed({ uuAppErrorMap }, e);
      }
    }

    const teacherDetailResult = await TeacherDetail.getTeacherDataFromEnvironment(
      uri,
      uuSchoolKit,
      uuObject,
      uuAppErrorMap,
      Errors.UpdateByClassTeacher,
      session,
      callOpts,
      artifactEnvironment
    );
    uuObject = teacherDetailResult.uuObject;
    uuAppErrorMap = teacherDetailResult.uuAppErrorMap;

    // HDS 10
    let updatedObject = {
      ...uuObject,
      ...dtoIn,
    };

    const updatePreviousYearClassesResultObject = await this._updatePreviousYearClasses(
      awid,
      dtoIn,
      updatedObject,
      WARNINGS.updateByClassTeacherPreviousClassIdDoesntExists,
      uuAppErrorMap
    );
    updatedObject = updatePreviousYearClassesResultObject.classObject;
    uuAppErrorMap = updatePreviousYearClassesResultObject.uuAppErrorMap;

    try {
      uuObject = await this.dao.update(updatedObject);
    } catch (e) {
      throw new Errors.UpdateByClassTeacher.ClassUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    if (uuObject.previousYearClassMap) {
      uuObject = await this._returnRelatedClassListData(uuObject);
    }
    // HDS 11
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }
  /**
   * Adds a student list into the class.
   * @param uri
   * @param dtoIn
   * @param uuAppErrorMap
   * @returns {Promise<{uuAppErrorMap: (*|{})}>}
   */
  async addStudents(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    await InstanceChecker.ensureInstanceAndState(awid, Errors.AddStudents, allowedStates, uuAppErrorMap);

    // HDS 2, 2.2
    let validationResult = this.validator.validate("classAddStudentsDtoInType", dtoIn);
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
      throw new Errors.AddStudents.ClassNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5, 5.1, 5.1.A, 5.1.A.1
    let stateError = Errors.AddStudents.ClassIsNotInCorrectState;
    allowedStates = Class.NonFinalStatesWithoutPassive;
    StateChecker.ensureState(uuObject, stateError, allowedStates, uuAppErrorMap, {
      id: uuObject.id,
      state: uuObject.state,
    });

    // HDS 6
    // 6.1
    dtoIn.studentList = this._removeDuplicates(dtoIn.studentList, "id");
    // 6.2
    const studentList = uuObject.studentList || [];
    let checkedStudentList = [];
    // 6.3
    for (let studentToAdd of dtoIn.studentList) {
      // 6.3.2
      let isActiveInOtherClasses = false;
      let studentClasses = await this.classDao.listByStudentId(awid, studentToAdd.id);
      studentClasses.itemList.forEach((studentClass) => {
        let result = studentClass.studentList.find((student) => studentToAdd.id === student.id);
        isActiveInOtherClasses = result.state !== StudentAbl.states.former;
      });

      let isClassStudent = !!studentList.find((s) => s.id === studentToAdd.id && s.state !== StudentAbl.states.former);
      // 6.3.3
      let isNumberUsed = !!studentList.find((s) => s.number === studentToAdd.number);
      // 6.3.4
      // 6.3.4.1
      if (isClassStudent) {
        // 6.3.4.1.A.1.
        uuAppErrorMap = this._addToWarningMap(uuAppErrorMap, "addStudentsStudentIsAlreadyInClass", {
          id: studentToAdd.id,
        });
      } else if (isNumberUsed) {
        // 6.3.4.1.B.1.
        uuAppErrorMap = this._addToWarningMap(uuAppErrorMap, "addStudentsNumberInClassIsAlreadyTaken", {
          id: studentToAdd.id,
          number: studentToAdd.number,
        });
      } else if (isActiveInOtherClasses) {
        uuAppErrorMap = this._addToWarningMap(uuAppErrorMap, "addStudentsStudentIsAlreadyInOtherClassInAcitveState", {
          id: studentToAdd.id,
        });
      } else {
        // 6.3.4.1.C.1.
        // 6.3.4.1.C.1.1
        let uuStudent = await this.studentDao.get(awid, studentToAdd.id);
        // 6.3.4.1.C.1.2.A.
        if (!uuStudent) {
          // 6.3.4.1.C.1.2.A.1.
          uuAppErrorMap = this._addToWarningMap(uuAppErrorMap, "addStudentsStudentNotFound", {
            id: studentToAdd.id,
          });
        } else if (uuStudent.state === "closed") {
          // 6.3.4.1.C.1.2.B.1.
          uuAppErrorMap = this._addToWarningMap(uuAppErrorMap, "addStudentsStudentIsNotInCorrectState", {
            id: studentToAdd.id,
            state: studentToAdd.state,
          });
        } else {
          // 6.3.4.1.C.1.2.C.1.
          let classStudentRelation = {
            id: studentToAdd.id,
            number: studentToAdd.number,
            state: StudentAbl.states.active,
          };
          if (uuStudent.uuIdentity) {
            classStudentRelation.uuIdentity = uuStudent.uuIdentity;
          }
          if (uuStudent.state !== StudentAbl.states.active) {
            let dtoIn = { id: uuStudent.id, state: StudentAbl.states.active };
            await StudentAbl.setState(uri, dtoIn, session, uuAppErrorMap);
          }
          checkedStudentList.push(classStudentRelation);
        }
      }
    }
    // 6.4
    if (!checkedStudentList.length) {
      // 6.4.A.1.
      throw new Errors.AddStudents.NoStudentToBeAdded({ uuAppErrorMap });
    }

    // HDS 7

    for (let student of checkedStudentList) {
      let isThereIndex = studentList.findIndex((s) => s.id === student.id);
      if (isThereIndex !== -1) {
        studentList[isThereIndex] = student;
      } else {
        studentList.push(student);
      }
    }
    const updatedClassObject = {
      ...uuObject,
      studentList: studentList,
    };
    // 7.2
    try {
      // 7.2.A.
      uuObject = await this.dao.update(updatedClassObject);
    } catch (e) {
      // 7.2.B.
      // 7.2.B.1.
      throw new Errors.AddStudents.ClassDaoAddStudentsFailed({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 8
    return { ...uuObject, uuAppErrorMap };
  }

  /**
   * Removes student from a class.
   * @param uri
   * @param dtoIn
   * @param uuAppErrorMap
   * @returns {Promise<{uuAppErrorMap: (*|{})}>}
   */
  async removeStudent(uri, dtoIn, uuAppErrorMap = {}) {
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
    let validationResult = this.validator.validate("classRemoveStudentDtoInType", dtoIn);
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
      throw new Errors.RemoveStudent.ClassNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5, 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1
      throw new Errors.RemoveStudent.ClassIsNotInCorrectState(
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
        WARNINGS.removeStudentStudentIsNotInClass.code,
        WARNINGS.removeStudentStudentIsNotInClass.message,
        { id: dtoIn.studentId }
      );
      // 6.2.A.2.
      return { uuAppErrorMap };
    } else if (studentToRemove.state === StudentAbl.states.former) {
      // 6.2.B.1.
      ValidationHelper.addWarning(
        uuAppErrorMap,
        WARNINGS.removeStudentStudentIsFormerClassStudent.code,
        WARNINGS.removeStudentStudentIsFormerClassStudent.message,
        { id: studentToRemove.id }
      );
      // 6.2.B.2.
      return { uuAppErrorMap };
    }

    // HDS 7
    try {
      // 7.1.A.
      uuObject = await this.dao.removeStudent({ awid, id: uuObject.id }, studentToRemove.id);
    } catch (e) {
      // 7.1.B.
      // 7.1.B.1.
      throw new Errors.RemoveStudent.ClassDaoRemoveStudentFailed(
        { uuAppErrorMap },
        { id: dtoIn.id, studentId: dtoIn.studentId, cause: e }
      );
    }

    return { ...uuObject, uuAppErrorMap };
  }

  /**
   * List all teacher's classes
   * @param uri
   * @param dtoIn
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
    let validationResult = this.validator.validate("classListByTeacherDtoInType", dtoIn);
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
    // 4.1
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
      let classList = await this.dao.list(awid);
      // 4.2.A.5
      // 4.2.A.5.1
      itemList =
        teacherRolesIds &&
        teacherRolesIds.length &&
        classList.itemList.filter((subject) => teacherRolesIds.includes(subject.classTeacher));
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
    let validationResult = this.validator.validate("classListByStudentDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.listByStudent.code,
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
    // HDS 4
    let dtoOut = await this.dao.listByStudentId(awid, dtoIn.studentId, dtoIn.pageInfo);
    return {
      ...dtoOut,
      profileList,
      uuAppErrorMap,
    };
  }

  async listBySchoolYear(uri, dtoIn, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.ListBySchoolYear, uuAppErrorMap);

    // HDS 2, 2.1, 2.2, 2.2.1, 2.3.1
    let validationResult = this.validator.validate("classListBySchoolYearDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.listBySchoolYearUnsupportedKeys.code,
      Errors.ListBySchoolYear.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    let list = await this.dao.listBySchoolYearId(awid, dtoIn.schoolYearId, dtoIn.pageInfo || DEFAULT_PAGE_INFO);

    // HDS 4
    // 4.1
    let schoolYear = await this.schoolYearDao.get(awid, dtoIn.schoolYearId);

    // HDS 5
    return {
      ...list,
      schoolYear,
      uuAppErrorMap,
    };
  }

  async get(uri, dtoIn, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.Get, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("classGetDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.getUnsupportedKeys.code,
      Errors.Get.InvalidDtoIn
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
      throw new Errors.Get.ClassNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5
    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }

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
    let validationResult = this.validator.validate("classLoadDtoInType", dtoIn);
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
      throw new Errors.Load.ClassNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }
    // HDS 5
    // 5.1
    // 5.2.A.
    let callOpts = {};
    if (
      !profileList.includes("Authorities") &&
      !profileList.includes("Executives") &&
      !profileList.includes("Auditors")
    ) {
      // 5.2.B.
      // 5.2.B.1.
      let roleGroupIfcList = [{ id: uuObject.classTeacher }];
      const userUuIdentity = session.getIdentity().getUuIdentity();

      const teacher = await UserRoleChecker.checkIsTeacher(awid, userUuIdentity);
      if (Object.keys(teacher).length !== 0) {
        const listClassSubjects = await this.subjectDao.listByClassId(awid, uuObject.id.toString(), DEFAULT_PAGE_INFO);
        if (listClassSubjects && listClassSubjects.itemList && listClassSubjects.itemList.length) {
          listClassSubjects.itemList.forEach((subject) => {
            roleGroupIfcList.push({ id: subject.subjectTeacher });
          });
        }
      }

      // 5.2.B.2.
      let verifyMyCastExistenceDtoOut = {};
      // 5.2.B.2.1.
      // 5.2.B.2.2.
      try {
        // 5.2.B.2.2.A.
        callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
        verifyMyCastExistenceDtoOut = await UuBtHelper.verifyMyCastExistence(
          uuSchoolKit.btBaseUri,
          { roleGroupIfcList: roleGroupIfcList },
          callOpts
        );
      } catch (e) {
        // 5.2.B.2.2.B.
        // 5.2.B.2.2.B.1.
        throw new Errors.Load.CallVerifyMyCastExistenceFailed({ uuAppErrorMap });
      }

      const isClassTeacher = verifyMyCastExistenceDtoOut.roleGroupIfcList.find(
        (uuRole) => uuRole.id === uuObject.classTeacher
      );

      let isClassStudent = false;
      let isRelatedPerson = false;
      if (!isClassTeacher || !verifyMyCastExistenceDtoOut.roleGroupIfcList.length) {
        const studentListOfId = uuObject.studentList.map((student) => student.id);
        const classStudents = await this.studentDao.listByIds(awid, studentListOfId, DEFAULT_PAGE_INFO);
        if (classStudents && classStudents.itemList) {
          classStudents.itemList.forEach((student) => {
            if (student.uuIdentity === userUuIdentity) isClassStudent = true;
            if (student.relatedPersonList.find((relatedPerson) => relatedPerson.uuIdentity === userUuIdentity))
              isRelatedPerson = true;
          });
        }
      }
      // 5.2.B.2.3.
      // 5.2.B.2.3.A.
      if (isClassTeacher) {
        profileList.push("ClassTeacher");
      }
      if (verifyMyCastExistenceDtoOut.roleGroupIfcList.length) {
        profileList.push("SubjectTeacher");
      }
      if (Object.keys(teacher).length !== 0) {
        profileList.push("Teacher");
      }
      if (isClassStudent) {
        profileList.push("Student");
      }
      if (isRelatedPerson) {
        profileList.push("RelatedPerson");
      }

      if (profileList.length === 1 && profileList[0] === "StandardUsers") {
        // 5.2.B.2.3.B.
        // 5.2.B.2.3.B.1.
        throw new Errors.Load.UserNotAuthorized({ uuAppErrorMap });
      }
    }
    // HDS 6
    // 6.1
    const loadEnvDtoIn = { id: uuObject.artifactId };
    let artifactEnvironment;
    // 6.2.
    // 6.2.A.
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      artifactEnvironment = await UuBtHelper.uuObc.loadEnvironment(uuSchoolKit.btBaseUri, loadEnvDtoIn, callOpts);
    } catch (e) {
      // 6.2.B.
      // 6.2.B.1.
      throw new Errors.Load.FailedToLoadUuObcEnvironment({ uuAppErrorMap }, e);
    }

    // HDS 7
    // 7.1
    let schoolYear = await this.schoolYearDao.get(awid, uuObject.schoolYearId);

    if (uuObject.previousYearClassMap) {
      uuObject = await this._returnRelatedClassListData(uuObject);
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

    // HDS 8
    return {
      ...uuObject,
      schoolYear,
      artifactEnvironment,
      profileList,
      uuAppErrorMap,
    };
  }

  async delete(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.Delete, allowedStates, uuAppErrorMap);

    // HDS 2
    // A3 A4
    let validationResult = this.validator.validate("classDeleteDtoInType", dtoIn);
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
      ValidationHelper.addWarning(
        uuAppErrorMap,
        WARNINGS.deleteClassNotFound.code,
        WARNINGS.deleteClassNotFound.message,
        { id: dtoIn.id, code: dtoIn.code }
      );
      return { uuAppErrorMap };
    }

    // HDS 5, 5.1
    let stateError = Errors.AddStudents.ClassIsNotInCorrectState;
    allowedStates = Class.ClosedState;
    StateChecker.ensureState(uuObject, stateError, allowedStates, uuAppErrorMap, { id: dtoIn.id, code: dtoIn.code });

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
      throw new Errors.Delete.ClassDaoDeleteFailed({ uuAppErrorMap }, { cause: e, id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 8
    return { uuAppErrorMap };
  }

  _throwCorrespondingError(e, uuAppErrorMap) {
    let error;
    switch (e.code) {
      case "invalidHomeFolderState":
        // 9.2.B.2.A.
        // 9.2.B.2.A.1
        error = new Errors.Create.LocationIsNotInProperState({ uuAppErrorMap }, e);
        break;
      case "locationDoesNotExist":
        // 9.2.B.2.B.
        // 9.2.B.2.B.1.
        error = new Errors.Create.FolderDoesNotExist({ uuAppErrorMap }, e);
        break;
      case "userIsNotAuthorizedToAddArtifact":
        // 9.2.B.2.C.
        // 9.2.B.2.C.1
        error = new Errors.Create.UserIsNotAuthorizedToAddArtifact({ uuAppErrorMap }, e);
        break;
      default:
        // 9.2.B.2.D.
        // 9.2.B.2.D.1
        error = new Errors.Create.CallUuObcCreateFailed({ uuAppErrorMap }, e);
        break;
    }
    throw error;
  }

  _removeDuplicates(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
      return arr.map((mapObj) => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  }

  _addToWarningMap(uuAppErrorMap, warningKey, paramMap, arrayKey = "studentList") {
    let warning = WARNINGS[warningKey];
    if (!uuAppErrorMap[warning.code]) {
      ValidationHelper.addWarning(uuAppErrorMap, warning.code, warning.message, { [arrayKey]: [] });
    }
    uuAppErrorMap[warning.code].paramMap[arrayKey].push(paramMap);
    return uuAppErrorMap;
  }

  async _returnRelatedClassListData(classObject) {
    if (classObject.previousYearClassMap) {
      const previousYearClassIds = Object.keys(classObject.previousYearClassMap) || [];
      let classListDetails = await this.dao.listById(classObject.awid, previousYearClassIds);
      previousYearClassIds.forEach((classIdFromClassObject) => {
        let isThere = classListDetails.itemList.find(
          (classDetail) => classDetail.id.toString() === classIdFromClassObject
        );
        if (isThere) {
          classObject.previousYearClassMap[classIdFromClassObject] = isThere;
        }
      });
    }
    return classObject;
  }

  async _updatePreviousYearClasses(awid, dtoIn, classObject, warning, uuAppErrorMap) {
    if (dtoIn.previousYearClassMap) {
      const previousYearClassIds = (dtoIn.previousYearClassMap && Object.keys(dtoIn.previousYearClassMap)) || [];

      let uuClassListFromDb = await this.dao.listById(awid, previousYearClassIds);
      let checkedPreviousClasses = {};
      let idWithWarning = [];
      previousYearClassIds.forEach((prevClass) => {
        let isThere = uuClassListFromDb.itemList.find((uuClass) => prevClass === uuClass.id.toString());
        if (isThere) {
          checkedPreviousClasses[prevClass] = {};
        } else {
          idWithWarning.push(prevClass);
        }
      });

      classObject.previousYearClassMap = checkedPreviousClasses;

      if (idWithWarning.length > 0) {
        ValidationHelper.addWarning(uuAppErrorMap, warning.code, warning.message, {
          listOfId: idWithWarning,
        });
      }
    }
    return {
      classObject,
      uuAppErrorMap,
    };
  }
}

module.exports = new ClassAbl();

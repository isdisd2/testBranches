"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { UriBuilder } = require("uu_appg01_server").Uri;

const AppClientTokenHelper = require("./helpers/app-client-token-helper.js");
const UuBtHelper = require("./helpers/uu-bt-helper.js");
const UuBemHelper = require("./helpers/uu-bem-helper.js");
const InstanceChecker = require("../components/instance-checker");
const { Schemas, SchoolKit } = require("./common-constants");
const { Activity, TYPES: activityTypes, dateFunctions } = require("../components/activity");
const UserRoleChecker = require("../components/user-roles-checker");

const Errors = require("../api/errors/teacher-error.js");

const TYPE_CODE = "uu-schoolkit-schoolg01/teacher";
const STATES = Object.freeze({
  initial: "initial",
  active: "active",
  warning: "warning",
  problem: "problem",
  passive: "passive",
  closed: "closed",
});

const USE_CASES = Object.freeze({
  create: "teacher/create",
});

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
  updateUnsupportedKeys: {
    code: `${Errors.Update.UC_CODE}unsupportedKeys`,
  },
  setStateUnsupportedKeys: {
    code: `${Errors.SetState.UC_CODE}unsupportedKeys`,
  },
  setFinalStateUnsupportedKeys: {
    code: `${Errors.SetFinalState.UC_CODE}unsupportedKeys`,
  },
  setFinalStateCheckExistenceOfActiveRelatedArtifactsFailed: {
    code: `${Errors.SetFinalState.UC_CODE}checkExistenceOfActiveRelatedArtifactsFailed`,
    message: "System failed to check existence of active related artifacts.",
  },
  setFinalStateUuArtifactIfcAarDeleteFailed: {
    code: `${Errors.SetFinalState.UC_CODE}uuArtifactIfcAarDeleteFailed`,
    message: "Delete of AAR relation failed.",
  },
  listUnsupportedKeys: {
    code: `${Errors.List.UC_CODE}unsupportedKeys`,
  },
};

class TeacherAbl {
  constructor() {
    this.validator = Validator.load();
    this.typeCode = TYPE_CODE;
    this.states = STATES;
    this.useCases = USE_CASES;
    this.dao = DaoFactory.getDao(Schemas.TEACHER);
    this.classDao = DaoFactory.getDao(Schemas.CLASS);
    this.subjectDao = DaoFactory.getDao(Schemas.SUBJECT);
    this.schoolKitDao = DaoFactory.getDao(Schemas.SCHOOLKIT);
    this.studentDao = DaoFactory.getDao(Schemas.STUDENT);
  }

  async list(awid, dtoIn, session, profileList, uuAppErrorMap = {}) {
    // HDS 1
    // 1.1 - 1.3
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.List, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("teacherListDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.listUnsupportedKeys.code,
      Errors.List.InvalidDtoIn
    );

    if (
      !profileList.includes("Authorities") &&
      !profileList.includes("Executives") &&
      !profileList.includes("Auditors")
    ) {
      const userUid = session.getIdentity().getUuIdentity();
      const profiles = await UserRoleChecker.checkIsTeacher(awid, userUid);
      if (Object.keys(profiles).length === 0) {
        throw new Errors.List.UserNotAuthorized({ uuAppErrorMap });
      }
    }
    // HDS 3
    // 3.1
    let result = await this.dao.list(awid, dtoIn.pageInfo || DEFAULT_PAGE_INFO);

    // HDS 4
    return {
      ...result,
      uuAppErrorMap,
    };
  }

  /**
   * Creates a new teacher.
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns { teacher, artifactEnvironment, uuAppErrorMap }
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
    let validationResult = this.validator.validate("teacherCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.createUnsupportedKeys.code,
      Errors.Create.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    const uuBemGetPersonDtoIn = dtoIn.personalCardId ? { id: dtoIn.personalCardId } : { uuIdentity: dtoIn.uuIdentity };
    // 3.2
    let personData;
    // 3.3
    try {
      // 3.3.A.
      personData = await UuBemHelper.person.get(uuSchoolKit.bemBaseUri, uuBemGetPersonDtoIn, session);
    } catch (e) {
      // 3.3.B.
      if (e.code === UuBemHelper.errors.notAuthorized) {
        // 3.3.B.1.A.1.
        throw new Errors.Create.UserNotAuthorized({ uuAppErrorMap }, e);
      }
      // 3.3.B.1.B.
      throw new Errors.Create.CallPersonGetFailed({ uuAppErrorMap }, e);
    }

    // HDS 4
    // 4.1, 4.2
    let uuObject = this._getUuObjectTeacher({ ...personData, ...dtoIn });
    // 4.3
    try {
      // 4.3.A
      uuObject = await this.dao.create({ ...uuObject, awid, state: this.states.initial });
    } catch (e) {
      // 4.3.B
      if (e.code === "uu-app-objectstore/duplicateKey") {
        // 4.3.B.1.A.
        // 4.3.B.1.A.1
        throw new Errors.Create.TeacherAlreadyExist({ uuAppErrorMap }, e);
      }
      // 4.3.B.2
      throw new Errors.Create.TeacherCreateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 5
    // 5.1
    const uuObId = uuObject.id;
    const uuObUri = UriBuilder.parse(uri)
      .setUseCase("teacherDetail")
      .setParameters({ id: uuObId.toString() })
      .toUri()
      .toString();
    let uuObcCreateDtoIn = {
      typeCode: this.typeCode,
      name: `${uuObject.name} ${uuObject.surname}`,
      desc: uuObject.desc,
      location: uuSchoolKit.btTeachersId,
      uuObId,
      uuObUri,
    };
    let artifactEnvironment;
    let callOpts;
    try {
      // 5.2.A
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      artifactEnvironment = await UuBtHelper.uuObc.create(uuSchoolKit.btBaseUri, uuObcCreateDtoIn, callOpts);
    } catch (e) {
      // 5.2.B
      // 5.2.B.1
      try {
        // 5.2.B.1.A
        await this.dao.delete(awid, uuObject.id);
      } catch (e) {
        // 5.2.B.1.B
        // 5.2.B.1.B.1
        ValidationHelper.addWarning(
          uuAppErrorMap,
          WARNINGS.createFailedToDeleteAfterRollback.code,
          WARNINGS.createFailedToDeleteAfterRollback.message,
          { cause: e }
        );
      }
      // 5.2.B.2
      this._throwCorrespondingError(e, uuAppErrorMap);
    }

    // HDS 6
    try {
      // 6.1.A
      uuObject = await this.dao.update({ ...uuObject, artifactId: artifactEnvironment.id });
    } catch (e) {
      // 6.1.A
      // 6.1.B.1
      throw new Errors.Create.TeacherUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 7
    // 7.1
    const personUuObcId = UriBuilder.parse(personData.artifactUri).getParameters().id;
    const aarCreateDtoIn = { id: uuObject.artifactId, artifactB: personUuObcId };
    try {
      // 7.1.A
      await UuBtHelper.uuArtifactIfc.createAar(uuSchoolKit.btBaseUri, aarCreateDtoIn, callOpts);
    } catch (e) {
      // 7.1.B
      // 7.2.B.1
      throw new Errors.Create.AarCreateFailed({ uuAppErrorMap }, e);
    }

    const activityDtoIn = {
      id: uuObject.artifactId,
      submitterCode: session.getIdentity().getUuIdentity(),
      solverList: [
        {
          solverCode: uuObject.uuIdentity,
        },
      ],
      type: activityTypes.info,
      name: Activity.createLsiContent("teacherCreate", "name"),
      desc: Activity.createLsiContent("teacherCreate", "desc"),
      endTime: dateFunctions.getNextDay(),
    };
    let activityResult;
    try {
      activityResult = await Activity.create(
        activityDtoIn,
        session,
        uuSchoolKit.btBaseUri,
        uri,
        callOpts,
        uuAppErrorMap
      );
    } catch (e) {
      ValidationHelper.addWarning(
        uuAppErrorMap,
        WARNINGS.createFailedToCreateActivity.code,
        WARNINGS.createFailedToCreateActivity.message,
        { cause: e }
      );
    }

    // HDS 8
    return {
      ...uuObject,
      activityResult,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  /**
   * Loads the teacher uuObject. Checks all profiles of logged user
   * (Authorities, Executives, Standard Users, Auditors) to provide appropriate
   * functionality for given profile.
   * @param uri
   * @param dtoIn
   * @param profileList
   * @param session
   * @param uuAppErrorMap
   * @returns { teacher, uuClass, subjectList, artifactEnvironment, uuAppErrorMap  }
   */
  async load(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();
    //  1.1
    let uuSchoolKit = await this.schoolKitDao.getByAwid(awid);
    // 1.2.A.
    if (!uuSchoolKit) {
      // 1.2.A.1.
      throw new Errors.Load.UuSchoolKitDoesNotExist({ uuAppErrorMap }, { awid });
    }

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("teacherLoadDtoInType", dtoIn);
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
      uuObject = await this.dao.getByPersonalCardId(awid, dtoIn.personalCardId);
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.Load.TeacherNotFound({ uuAppErrorMap }, { id: dtoIn.id, personalCardId: dtoIn.personalCardId });
    }

    // HDS 5
    // 5.1
    const uuObcLoadEnvDtoIn = { id: uuObject.artifactId };
    let artifactEnvironment;
    // 5.2.
    // 5.2.A.
    let callOpts;
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      artifactEnvironment = await UuBtHelper.uuObc.loadEnvironment(uuSchoolKit.btBaseUri, uuObcLoadEnvDtoIn, callOpts);
    } catch (e) {
      // 5.2.B.
      // 5.2.B.1.
      throw new Errors.Load.FailedToLoadUuObcEnvironment({ uuAppErrorMap }, e);
    }

    let teacherRoles;
    let teacherClasses = [];
    let teacherSubjects = [];
    try {
      teacherRoles = await UuBtHelper.uuArtifactIfc.listMyRoles(
        uuSchoolKit.btBaseUri,
        { code: uuObject.uuIdentity },
        callOpts
      );
    } catch (e) {
      // 5.2.B.
      // 5.2.B.1.
      throw new Errors.Load.FailedToLoadTeacherRoles({ uuAppErrorMap }, e);
    }

    if (teacherRoles && teacherRoles.itemList) {
      const listOfIds = teacherRoles.itemList.map((role) => role.id);
      teacherClasses = await this.classDao.getTeacherClassesList(awid, listOfIds);
      teacherSubjects = await this.subjectDao.getTeacherSubjectsList(awid, listOfIds);
    }

    if (
      !profileList.includes("Authorities") &&
      !profileList.includes("Executives") &&
      !profileList.includes("Auditors")
    ) {
      let loggedUserIsOneOfRelatedPersons = false;
      let loggedUserIsTeacherStudent = false;

      const listOfStudentsId = [];
      if (teacherClasses && teacherClasses.itemList) {
        teacherClasses.itemList.forEach((uuClass) => {
          if (uuClass.studentList) {
            uuClass.studentList.forEach((student) => {
              listOfStudentsId.push(student.id);
            });
          }
        });
      }

      const userUuIdentity = session.getIdentity().getUuIdentity();

      const teacherStudents = await this.studentDao.listByIds(awid, listOfStudentsId, { pageIndex: 0, pageSize: 5000 });

      if (teacherStudents && teacherStudents.itemList) {
        teacherStudents.itemList.forEach((student) => {
          if (student.uuIdentity === userUuIdentity) {
            loggedUserIsTeacherStudent = true;
          }
          if (student.relatedPersonList.find((relatedPerson) => relatedPerson.uuIdentity === userUuIdentity)) {
            loggedUserIsOneOfRelatedPersons = true;
          }
        });
      }

      const teacher = await UserRoleChecker.checkIsTeacher(awid, userUuIdentity);
      if (Object.keys(teacher).length !== 0) {
        profileList.push("Teacher");
      }

      if (loggedUserIsOneOfRelatedPersons) {
        profileList.push("RelatedPerson");
      }

      if (loggedUserIsTeacherStudent) {
        profileList.push("TeacherStudent");
      }

      const student = await UserRoleChecker.checkIsStudent(awid, userUuIdentity);
      if (Object.keys(student).length !== 0) {
        profileList.push("Student");
      }

      if (
        !profileList.includes("Teacher") &&
        !profileList.includes("TeacherStudent") &&
        !profileList.includes("Student") &&
        !profileList.includes("RelatedPerson")
      ) {
        throw new Errors.Load.UserIsNotAuthorized({ uuAppErrorMap });
      }
    }

    // HDS 6
    // 6.1
    // fixme: fix documentation
    //

    // HDS 7
    // 7.1
    // fixme: fix documentation

    // HDS 8
    return {
      ...uuObject,
      teacherClasses,
      profileList,
      teacherSubjects,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  /**
   * Gets a teacher uuObject. Checks all profiles of logged user
   * (Authorities, Executives, Standard Users, Auditors) to provide appropriate
   * functionality for given profile.
   * @param uri
   * @param dtoIn
   * @param uuAppErrorMap
   * @returns { teacher, uuAppErrorMap  }
   */
  async get(uri, dtoIn, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();
    // HDS 1.1
    let uuSchoolKit = await this.schoolKitDao.getByAwid(awid);
    // HDS 1.2
    if (!uuSchoolKit) {
      // 1.2.A.1
      throw new Errors.Get.UuSchoolKitDoesNotExist({ uuAppErrorMap }, awid);
    }

    // HDS 2, 2.1, 2.2, 2.2.1, 2.3.1
    let validationResult = this.validator.validate("teacherGetDtoInType", dtoIn);
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
      uuObject = await this.dao.getByPersonalCardId(awid, dtoIn.personalCardId);
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.Get.TeacherNotFound({ uuAppErrorMap }, { id: dtoIn.id, personalCardId: dtoIn.personalCardId });
    }

    // HDS 5
    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }

  /**
   * Updates teacher manually by authorities or executives.
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns { teacher, artifactEnvironment, uuAppErrorMap  }
   */
  async update(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.Update, allowedStates, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("teacherUpdateDtoInType", dtoIn);
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
      uuObject = await this.dao.getByPersonalCardId(awid, dtoIn.personalCardId);
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.Update.TeacherNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.personalCardId });
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.Update.TeacherIsNotInProperState({ uuAppErrorMap }, { id: uuObject.id, state: uuObject.state });
    }

    // HDS 6
    let artifactEnvironment;
    // 6.1.A
    if (
      (dtoIn.name && dtoIn.name !== uuObject.name) ||
      (dtoIn.surname && dtoIn.surname !== uuObject.surname) ||
      (dtoIn.desc && dtoIn.desc !== uuObject.desc)
    ) {
      // 6.1.A.1
      const uuObcName = `${dtoIn.name || uuObject.name} ${dtoIn.surname || uuObject.surname}`;
      const uuObcSetBasicAttrsDtoIn = {
        id: uuObject.artifactId,
        personalCardId: dtoIn.personalCardId,
        name: uuObcName,
        desc: dtoIn.desc,
      };
      try {
        // 6.1.A.2.A.
        let callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
        artifactEnvironment = await UuBtHelper.uuObc.setBasicAttributes(
          uuSchoolKit.btBaseUri,
          uuObcSetBasicAttrsDtoIn,
          callOpts
        );
      } catch (e) {
        // 6.1.A.2.B
        // 6.1.A.2.B.1.
        throw new Errors.Update.SetBasicUuObcArtifactAttributesFailed({ uuAppErrorMap }, e);
      }
    }

    // HDS 7
    try {
      // 7.1.A.
      uuObject = await this.dao.update({
        ...uuObject,
        ...dtoIn,
        contactInfo: { ...uuObject.contactInfo, ...dtoIn.contactInfo },
      });
    } catch (e) {
      // 7.1.B.
      // 7.1.B.1
      throw new Errors.Update.TeacherUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 8
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  /**
   * Sets state for existing teacher (Active).
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns { teacher, artifactEnvironment, uuAppErrorMap }
   */
  async setState(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.SetState, allowedStates, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("teacherSetStateDtoInType", dtoIn);
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
      uuObject = await this.dao.getByPersonalCardId(awid, dtoIn.personalCardId);
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.SetState.TeacherNotFound(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.SetState.TeacherIsNotInCorrectState(
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
      throw new Errors.SetState.TeacherUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 8
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  /**
   * Sets state for existed teacher (Closed).
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns { teacher, artifactEnvironment, uuAppErrorMap }
   */
  async setFinalState(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // 1.1 - 1.3
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
    let validationResult = this.validator.validate("teacherSetFinalStateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.setFinalStateUnsupportedKeys.code,
      Errors.SetFinalState.InvalidDtoIn
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
      uuObject = await this.dao.getByPersonalCardId(awid, dtoIn.personalCardId);
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.SetFinalState.TeacherNotFound(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.SetFinalState.TeacherIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6, 6.1.
    let callOpts;
    let listByArtifactADtoOut;
    let teacherRoles;
    const listCastsBySideBDtoIn = {
      code: uuObject.uuIdentity,
    };
    const { btBaseUri } = uuSchoolKit;

    // 6.2, 6.2.A
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      teacherRoles = await UuBtHelper.uuRole.listCastsBySideB(uuSchoolKit.btBaseUri, listCastsBySideBDtoIn, callOpts);
    } catch (e) {
      // 6.2.B.1
      throw new Errors.SetFinalState.CheckExistenceOfActiveRelatedArtifactsFailed({ uuAppErrorMap }, e);
    }

    // 6.3
    let teacherList =
      teacherRoles.itemList &&
      teacherRoles.itemList.filter((teacherRole) => teacherRole.mainUuIdentity === uuObject.uuIdentity);

    // 6.3.1
    if (teacherList && teacherList.length !== 0) {
      // 6.3.1.1
      throw new Errors.SetFinalState.TeacherHasActiveRoles({ uuAppErrorMap });
    }

    // 7
    // 7.1
    const dtoInListByArtifactA = { id: uuObject.artifactId };

    // 7.2.A
    try {
      listByArtifactADtoOut = await UuBtHelper.uuArtifactIfc.listByArtifactA(btBaseUri, dtoInListByArtifactA, callOpts);
    } catch (e) {
      // 7.2.B, 7.2.B.1
      ValidationHelper.addWarning(
        uuAppErrorMap,
        WARNINGS.setFinalStateCheckExistenceOfActiveRelatedArtifactsFailed.code,
        WARNINGS.setFinalStateCheckExistenceOfActiveRelatedArtifactsFailed.message,
        { cause: e }
      );
    }

    // 7.3, 7.3.1
    if (listByArtifactADtoOut && listByArtifactADtoOut.itemList) {
      const listOfPromises = listByArtifactADtoOut.itemList.map(async (artifact) => {
        await UuBtHelper.uuArtifactIfc.deleteAar(
          btBaseUri,
          { id: uuObject.artifactId, relationCode: artifact.relationCode, artifactB: artifact.artifactB },
          callOpts
        );
      });

      // 7.3.2.A
      try {
        await Promise.all(listOfPromises);
      } catch (e) {
        // 7.3.2.B.
        // 7.3.2.B.1.

        ValidationHelper.addWarning(
          uuAppErrorMap,
          WARNINGS.setFinalStateUuArtifactIfcAarDeleteFailed.code,
          WARNINGS.setFinalStateUuArtifactIfcAarDeleteFailed.message,
          { cause: e }
        );
      }
    }

    // HDS 8
    // 8.1
    const uuObcSetStateDtoIn = {
      id: uuObject.artifactId,
      state: this.states.closed,
      desc: dtoIn.desc,
      data: dtoIn.stateData,
    };
    let artifactEnvironment;
    try {
      // 8.2
      // 8.2.A
      artifactEnvironment = await UuBtHelper.uuObc.setState(uuSchoolKit.btBaseUri, uuObcSetStateDtoIn, callOpts);
    } catch (e) {
      // 8.2.B
      // 8.2.B.1
      throw new Errors.SetFinalState.UuObcSetStateFailed(
        { uuAppErrorMap },
        { listA: listByArtifactADtoOut, teacherRoles: teacherRoles, teacherList: teacherList, e: e }
      );
    }

    // HDS 9
    try {
      // 9.1
      // 9.1.A
      uuObject = await this.dao.update({ ...uuObject, state: this.states.closed });
    } catch (e) {
      // 9.1.B
      // 9.1.B.1
      throw new Errors.SetFinalState.TeacherUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 10
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  _getUuObjectTeacher(personData) {
    // todo: check if it;s OK to take only first address/phone.
    const personAddress = (personData.addressList && personData.addressList.length && personData.addressList[0]) || {};
    const personPhoneMap = (personData.phoneList && personData.phoneList.length && personData.phoneList[0]) || {};

    let uuTeacher = {
      uuIdentity: personData.uuIdentity,
      personalCardId: personData.id,
      room: personData.room,
      name: personData.name,
      surname: personData.surname,
      desc: personData.desc,
      address: {
        address1: personAddress.addressLine1,
        address2: personAddress.addressLine2,
        city: personAddress.addressLine4,
        zipCode: personAddress.zip,
      },
      contactInfo: {
        email: personData.email,
        phone: personPhoneMap.phone,
      },
    };

    return uuTeacher;
  }

  _throwCorrespondingError(e, uuAppErrorMap) {
    let error;
    switch (e.code) {
      case "invalidHomeFolderState":
        // 5.2.B.2.A.
        // 5.2.B.2.A.1
        error = new Errors.Create.LocationIsNotInProperState({ uuAppErrorMap }, e);
        break;
      case "locationDoesNotExist":
        // 5.2.B.2.B.
        // 5.2.B.2.B.1.
        error = new Errors.Create.FolderDoesNotExist({ uuAppErrorMap }, e);
        break;
      case "userIsNotAuthorizedToAddArtifact":
        // 5.2.B.2.C.
        // 5.2.B.2.C.1
        error = new Errors.Create.UserIsNotAuthorizedToAddArtifact({ uuAppErrorMap }, e);
        break;
      default:
        // 5.2.B.2.D.
        // 5.2.B.2.D.1
        error = new Errors.Create.CallUuObcCreateFailed({ uuAppErrorMap }, e);
        break;
    }
    throw error;
  }
}

module.exports = new TeacherAbl();

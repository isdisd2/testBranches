"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { UriBuilder } = require("uu_appg01_server").Uri;

const AppClientTokenHelper = require("./helpers/app-client-token-helper.js");
const UuBtHelper = require("./helpers/uu-bt-helper.js");
const UuBemHelper = require("./helpers/uu-bem-helper.js");
const InstanceChecker = require("../components/instance-checker");
const StateChecker = require("../components/state-checker");
const UserRoleChecker = require("../components/user-roles-checker");
const IsUserTeacher = require("../components/isUserTeacher-checker");
const { Schemas, SchoolKit, RelatedPerson } = require("./common-constants");
const { Activity, TYPES: activityTypes, dateFunctions } = require("../components/activity");

const Errors = require("../api/errors/related-person-error.js");

const TYPE_CODE = "uu-schoolkit-schoolg01/relatedPerson";

const STATES = Object.freeze({
  initial: "initial",
  active: "active",
  warning: "warning",
  problem: "problem",
  passive: "passive",
  closed: "closed",
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
  listUnsupportedKeys: {
    code: `${Errors.List.UC_CODE}unsupportedKeys`,
  },
  loadUnsupportedKeys: {
    code: `${Errors.Load.UC_CODE}unsupportedKeys`,
  },
  updateUnsupportedKeys: {
    code: `${Errors.Update.UC_CODE}unsupportedKeys`,
  },
  updateByRelatedPersonUnsupportedKeys: {
    code: `${Errors.UpdateByRelatedPerson.UC_CODE}unsupportedKeys`,
  },
  setStateUnsupportedKeys: {
    code: `${Errors.SetState.UC_CODE}unsupportedKeys`,
  },
  setFinalStateUnsupportedKeys: {
    code: `${Errors.SetFinalState.UC_CODE}unsupportedKeys`,
  },
  setFinalStateUuArtifactIfcAarDeleteFailed: {
    code: `${Errors.SetFinalState.UC_CODE}uuArtifactIfcAarDeleteFailed`,
    message: "Delete of AAR relation failed.",
  },
  checkExistenceOfActiveRelatedArtifactsFailed: {
    code: `${Errors.SetFinalState.UC_CODE}checkExistenceOfActiveRelatedArtifactsFailed`,
    message: "System failed to check existence of active related artifacts.",
  },
};

class RelatedPersonAbl {
  constructor() {
    this.validator = Validator.load();
    this.typeCode = TYPE_CODE;
    this.states = STATES;
    this.dao = DaoFactory.getDao(Schemas.RELATED_PERSON);
    this.schoolKitDao = DaoFactory.getDao(Schemas.SCHOOLKIT);
    this.studentDao = DaoFactory.getDao(Schemas.STUDENT);
  }

  /**
   * set state to relatedPerson
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns {relatedPerson, uuAppErrorMap}
   */
  async setState(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.SetState, allowedStates, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("relatedPersonSetStateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.setStateUnsupportedKeys.code,
      Errors.SetState.InvalidDtoIn
    );

    // HDS 3, 3.1, 3.1.A
    let uuObject;
    if (dtoIn.id) {
      // 3.1.A1
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      // 3.1.B, 3.1.B.1
      uuObject = await this.dao.getByPersonalCardId(awid, dtoIn.personalCardId);
    }

    // HDS 4, 4.1, 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.SetState.RelatedPersonNotFound(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5, 5.1, 5.1.A
    let stateError = Errors.SetState.RelatedPersonIsNotInCorrectState;
    allowedStates = RelatedPerson.NonFinalStatesWithPassive;
    StateChecker.ensureState(uuObject, stateError, allowedStates, uuAppErrorMap, {
      id: uuObject.id,
      state: uuObject.state,
    });

    // HDS 6, 6.1
    const uuObcSetStateDtoIn = {
      id: uuObject.artifactId,
      state: dtoIn.state,
      desc: dtoIn.setStateReason,
      data: dtoIn.stateData,
    };

    // 6.2, 6.2.A
    let callOpts;
    let artifactEnvironment;
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      artifactEnvironment = await UuBtHelper.uuObc.setState(uuSchoolKit.btBaseUri, uuObcSetStateDtoIn, callOpts);
    } catch (e) {
      // 6.2.B., 6.2.B.1
      throw new Errors.SetState.UuObcSetStateFailed({ uuAppErrorMap }, e);
    }

    // HDS 7, 7.1, .1.A.
    if (dtoIn.setStateReason !== undefined) {
      const setStateReason = uuObject.setStateReason || [];
      setStateReason.push(dtoIn.setStateReason);
      uuObject.setStateReason = setStateReason;
    }
    try {
      uuObject = this.dao.update({ ...uuObject, state: dtoIn.state });
    } catch (e) {
      // 7.1.B., 7.1.B.1
      throw new Errors.SetState.RelatedPersonUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 8
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  /**
   * return list of related persons
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns {relatedPersonsList, uuAppErrorMap}
   */
  async list(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.List, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("relatedPersonListDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.listUnsupportedKeys.code,
      Errors.List.InvalidDtoIn
    );

    // HDS 3, 3.1
    const relatedPersonsList = await this.dao.list(awid, dtoIn.pageInfo || DEFAULT_PAGE_INFO);

    // HDS 4
    return {
      ...relatedPersonsList,
      uuAppErrorMap,
    };
  }

  /**
   * Creates a new related person.
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns { relatedPerson, artifactEnvironment, uuAppErrorMap }
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
    let validationResult = this.validator.validate("relatedPersonCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.createUnsupportedKeys.code,
      Errors.Create.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    const uuBemGetPersonDtoIn = { id: dtoIn.personalCardId };
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
    let uuObject = this._getUuObjectRelatedPerson({ ...personData, ...dtoIn });
    // 4.3
    try {
      // 4.3.A
      uuObject = await this.dao.create({ ...uuObject, awid, state: this.states.active });
    } catch (e) {
      // 4.3.B
      if (e.code === "uu-app-objectstore/duplicateKey") {
        // 4.3.B.1.A.
        // 4.3.B.1.A.1
        throw new Errors.Create.RelatedPersonAlreadyExist({ uuAppErrorMap }, e);
      }
      // 4.3.B.2
      throw new Errors.Create.RelatedPersonCreateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 5
    // 5.1
    const uuObId = uuObject.id;
    const uuObUri = UriBuilder.parse(uri)
      .setUseCase("relatedPersonDetail")
      .setParameters({ id: uuObId.toString() })
      .toUri()
      .toString();
    let uuObcCreateDtoIn = {
      typeCode: this.typeCode,
      name: `${uuObject.name} ${uuObject.surname}`,
      desc: uuObject.desc,
      // FIXME: inconsistent folder naming. We should use plural. btRelatedPersonsId not btRelatedPersonId
      location: uuSchoolKit.btRelatedPersonId,
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
      throw new Errors.Create.RelatedPersonUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 7
    // 7.1
    const personUuObcId = personData.artifactId
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
      name: Activity.createLsiContent("relatedPersonCreated", "name"),
      desc: Activity.createLsiContent("relatedPersonCreated", "desc"),
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
   * Get general information about related person.
   * @param uri
   * @param dtoIn
   * @param uuAppErrorMap
   * @returns { relatedPerson, uuAppErrorMap  }
   */
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
    let validationResult = this.validator.validate("relatedPersonGetDtoInType", dtoIn);
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
      throw new Errors.Get.RelatedPersonNotFound(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5
    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }

  /**
   * Loads a relatedPerson uuObject. Checks all profiles of logged user
   * (Authorities, Executives, Standard Users, Auditors) to provide appropriate
   * functionality for given profile.
   * @param uri
   * @param dtoIn
   * @param session
   * @param profileList
   * @param uuAppErrorMap
   * @returns { relatedPerson, artifactEnvironment, uuAppErrorMap  }
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
    let validationResult = this.validator.validate("relatedPersonLoadDtoInType", dtoIn);
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
      throw new Errors.Load.RelatedPersonNotFound(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5
    // 5.1
    // 5.2.
    // 5.2.A.
    // 5.2.A.1.
    if (
      !profileList.includes("Authorities") &&
      !profileList.includes("Executives") &&
      !profileList.includes("Auditors")
    ) {
      // 5.2.A.1.1.
      const userUid = session.getIdentity().getUuIdentity();

      let userIsRelatedPersonStudent = false;
      const relatedPersonStudentList = await this.studentDao.listByRelatedPerson(awid, uuObject.id.toString());
      if (relatedPersonStudentList && relatedPersonStudentList.itemList && relatedPersonStudentList.itemList.length) {
        for (let student of relatedPersonStudentList.itemList) {
          if (student.uuIdentity === userUid) userIsRelatedPersonStudent = true;
          profileList = await IsUserTeacher.checkIfUserIsTeacher(
            uri,
            student,
            null,
            uuSchoolKit,
            null,
            session,
            profileList,
            Errors.Load,
            uuAppErrorMap
          );
        }
      }

      const profileListSet = new Set(profileList);
      profileList = [...profileListSet];

      if (userIsRelatedPersonStudent) {
        profileList.push("Student");
      }

      // 5.2.A.1.2.
      if (userUid === uuObject.uuIdentity) {
        // 5.2.A.1.2.A.
        // 5.2.A.1.2.A.1.
        profileList.push("RelatedPerson");
      }

      if (
        !profileList.includes("Student") &&
        !profileList.includes("RelatedPerson") &&
        !profileList.includes("ClassTeacher") &&
        !profileList.includes("SubjectTeacher")
      ) {
        // 5.2.A.1.2.B.
        // 5.2.A.1.2.B.1.
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
      let callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      artifactEnvironment = await UuBtHelper.uuObc.loadEnvironment(uuSchoolKit.btBaseUri, uuObcLoadEnvDtoIn, callOpts);
    } catch (e) {
      // 6.2.B.
      // 6.2.B.1.
      throw new Errors.Load.FailedToLoadUuObcEnvironment({ uuAppErrorMap }, e);
    }

    // HDS 7
    return {
      ...uuObject,
      artifactEnvironment,
      profileList,
      uuAppErrorMap,
    };
  }

  /**
   * Updates related person manually by authorities, executives or by a related person.
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns { relatedPerson, artifactEnvironment, uuAppErrorMap  }
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
    let validationResult = this.validator.validate("relatedPersonUpdateDtoInType", dtoIn);
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
      throw new Errors.Update.RelatedPersonNotFound(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5
    // 5.1
    // 5.1.A
    let stateError = Errors.Update.RelatedPersonIsNotInProperState;
    allowedStates = RelatedPerson.NonFinalStatesWithPassive;
    StateChecker.ensureState(uuObject, stateError, allowedStates, uuAppErrorMap, {
      id: uuObject.id,
      state: uuObject.state,
    });

    // HDS 6
    let artifactEnvironment;
    // 6.1.A
    try {
      // 6.1.A.2.A.
      let callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      artifactEnvironment = await UuBtHelper.uuObc.loadEnvironment(
        uuSchoolKit.btBaseUri,
        { id: uuObject.artifactId },
        callOpts
      );
    } catch (e) {
      // 6.1.A.2.B
      // 6.1.A.2.B.1.
      throw new Errors.Update.FailedToLoadUuObcEnvironment({ uuAppErrorMap }, e);
    }

    // HDS 7
    try {
      // 7.1.A.
      uuObject = await this.dao.update({
        ...uuObject,
        ...dtoIn,
        address: { ...uuObject.address, ...dtoIn.address },
        contactInfo: { ...uuObject.contactInfo, ...dtoIn.contactInfo },
      });
    } catch (e) {
      // 7.1.B.
      // 7.1.B.1
      throw new Errors.Update.RelatedPersonUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 8
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  /**
   * Updates related person by a related person.
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns { relatedPerson, uuAppErrorMap  }
   */
  async updateByRelatedPerson(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.UpdateByRelatedPerson,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("relatedPersonUpdateByRelatedPersonDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.updateByRelatedPersonUnsupportedKeys.code,
      Errors.UpdateByRelatedPerson.InvalidDtoIn
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
      throw new Errors.UpdateByRelatedPerson.RelatedPersonNotFound(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5
    // 5.1
    // 5.1.A
    let stateError = Errors.UpdateByRelatedPerson.RelatedPersonIsNotInProperState;
    allowedStates = RelatedPerson.NonFinalStatesWithPassive;
    StateChecker.ensureState(uuObject, stateError, allowedStates, uuAppErrorMap, {
      id: uuObject.id,
      state: uuObject.state,
    });

    // HDS 6
    // 6.1
    const userUid = session.getIdentity().getUuIdentity();
    // 6.2
    if (uuObject.uuIdentity !== userUid) {
      // 6.2.A.1
      throw new Errors.UpdateByRelatedPerson.UserNotAuthorized({ uuAppErrorMap });
    }

    // HDS 7
    try {
      // 7.1.A.
      uuObject = await this.dao.update({
        ...uuObject,
        ...dtoIn,
        address: { ...uuObject.address, ...dtoIn.address },
        contactInfo: { ...uuObject.contactInfo, ...dtoIn.contactInfo },
      });
    } catch (e) {
      // 7.1.B.
      // 7.1.B.1
      throw new Errors.UpdateByRelatedPerson.RelatedPersonUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 8
    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }

  /**
   * Set state for existed relatedPerson (Closed).
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns {Promise<{uuAppErrorMap: (*|{}), artifactEnvironment: *}>}
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
    let validationResult = this.validator.validate("relatedPersonSetFinalStateDtoInType", dtoIn);
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
      throw new Errors.SetFinalState.RelatedPersonNotFound(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5
    // 5.1
    // 5.1.A
    let stateError = Errors.SetFinalState.RelatedPersonIsNotInCorrectState;
    allowedStates = RelatedPerson.NonFinalStatesWithPassive;
    StateChecker.ensureState(uuObject, stateError, allowedStates, uuAppErrorMap, {
      id: uuObject.id,
      state: uuObject.state,
    });

    // HDS 6, 6.1
    const studentRelatedPersonList = await this.studentDao.listByRelatedPerson(awid, uuObject.id.toString());
    // 6.1.1.A
    if (studentRelatedPersonList.itemList.length) {
      // 6.1.1.A.1
      throw new Errors.SetFinalState.ExistingStudentRelatedPersonRelation({ uuAppErrorMap }, { id: uuObject.id });
    }

    // HDS 7, 7.1., 7.2., 7.2.A.
    let callOpts;
    let listByArtifactADtoOut;
    const { btBaseUri } = uuSchoolKit;
    const dtoInListByArtifactB = { id: uuObject.artifactId };
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      listByArtifactADtoOut = await UuBtHelper.uuArtifactIfc.listByArtifactA(btBaseUri, dtoInListByArtifactB, callOpts);
    } catch (e) {
      // 7.2.B., 7.2.B.1.
      ValidationHelper.addWarning(
        uuAppErrorMap,
        WARNINGS.checkExistenceOfActiveRelatedArtifactsFailed.code,
        WARNINGS.checkExistenceOfActiveRelatedArtifactsFailed.message,
        { cause: e }
      );
    }

    // 7.3.2.A.
    if (listByArtifactADtoOut) {
      const listOfPromises = listByArtifactADtoOut.itemList.map(async (artifact) => {
        await UuBtHelper.uuArtifactIfc.deleteAar(
          btBaseUri,
          { id: uuObject.artifactId, relationCode: artifact.relationCode, artifactB: artifact.artifactB },
          callOpts
        );
      });

      try {
        await Promise.all(listOfPromises);
        // 7.3.2.B.
      } catch (e) {
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
      throw new Errors.SetFinalState.UuObcSetStateFailed({ uuAppErrorMap }, e);
    }

    // HDS 9
    try {
      // 9.1
      // 9.1.A
      uuObject = await this.dao.update({ ...uuObject, state: STATES.closed });
    } catch (e) {
      // 9.1.B
      // 9.1.B.1
      throw new Errors.SetFinalState.RelatedPersonUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 10
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  _getUuObjectRelatedPerson(personData) {
    // todo: check if it;s OK to take only first address/phone.
    const personAddress = (personData.addressList && personData.addressList.length && personData.addressList[0]) || {};
    const personPhoneMap = (personData.phoneList && personData.phoneList.length && personData.phoneList[0]) || {};

    let uuRelatedPerson = {
      personalCardId: personData.personalCardId,
      name: personData.name,
      surname: personData.surname,
      nickname: personData.nickname,
      birthDate: personData.birthDate,
      desc: personData.desc,
      note: personData.note,
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
    if (personData.uuIdentity) uuRelatedPerson.uuIdentity = personData.uuIdentity;

    return uuRelatedPerson;
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

module.exports = new RelatedPersonAbl();

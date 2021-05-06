"use strict";
const Path = require("path");
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { UriBuilder } = require("uu_appg01_server").Uri;
const { Config } = require("uu_appg01_server").Utils;
const Errors = require("../api/errors/student-error.js");
const RelatedPersonAbl = require("./related-person-abl");
const crypto = require("crypto");
const AppClientTokenHelper = require("./helpers/app-client-token-helper.js");
const UuBtHelper = require("./helpers/uu-bt-helper.js");
const UuBemHelper = require("./helpers/uu-bem-helper.js");
const InstanceChecker = require("../components/instance-checker");
const StateChecker = require("../components/state-checker");
const UserRoleChecker = require("../components/user-roles-checker");
const { Schemas, SchoolKit, Student, RelatedPerson } = require("./common-constants");
const { Activity, TYPES: activityTypes, dateFunctions } = require("../components/activity");
const TrustedSubAppAuthorization = require("../components/trusted-sub-app-authorization");
const ConsoleUriHelper = require("../components/console-uri-helper");
const ScriptEngineHelper = require("./helpers/scripts-helpers");
const IsUserTeacher = require("../components/isUserTeacher-checker");

const STATES = Object.freeze({
  initial: "initial",
  active: "active",
  prepared: "prepared",
  warning: "warning",
  problem: "problem",
  passive: "passive",
  closed: "closed",
  former: "former",
});
const DEFAULT_PAGE_INFO = {
  pageIndex: 0,
  pageSize: 1000,
};
const WARNINGS = {
  createUnsupportedKeys: {
    code: `${Errors.Create.UC_CODE}unsupportedKeys`,
  },
  createFailedToCreateActivity: {
    code: `${Errors.Create.UC_CODE}failedToCreateActivity`,
    message: "System failed to create new activity.",
  },
  relatedPersonNotFound: {
    code: `${Errors.Create.UC_CODE}relatedPersonNotFound`,
    message: "Related person not found.",
  },
  relatedPersonIsNotInCorrectState: {
    code: `${Errors.Create.UC_CODE}relatedPersonIsNotInCorrectState`,
    message: "Related person is not in correct state.",
  },
  failedToCreateRelatedPerson: {
    code: `${Errors.Create.UC_CODE}failedToCreateRelatedPerson`,
    message: "Failed to create related person.",
  },
  failedToDeleteAfterRollback: {
    code: `${Errors.Create.UC_CODE}failedToDeleteAfterRollback`,
    message: "System failed to delete uuObject after an exception has been thrown in uuObcIfc/create use case.",
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
  setEvaluationUnsupportedKeys: {
    code: `${Errors.SetEvaluation.UC_CODE}unsupportedKeys`,
  },
  setNicknameUnsupportedKeys: {
    code: `${Errors.SetNickname.UC_CODE}unsupportedKeys`,
  },
  getUnsupportedKeys: {
    code: `${Errors.Get.UC_CODE}unsupportedKeys`,
  },
  listUnsupportedKeys: {
    code: `${Errors.List.UC_CODE}unsupportedKeys`,
  },
  listByRelatedPersonUnsupportedKeys: {
    code: `${Errors.ListByRelatedPerson.UC_CODE}unsupportedKeys`,
  },
  setStateUnsupportedKeys: {
    code: `${Errors.SetState.UC_CODE}unsupportedKeys`,
  },
  setFinalStateUnsupportedKeys: {
    code: `${Errors.SetFinalState.UC_CODE}unsupportedKeys`,
  },
  addRelatedPersonsUnsupportedKeys: {
    code: `${Errors.AddRelatedPersons.UC_CODE}unsupportedKeys`,
  },
  RemoveRelatedPerson: {
    code: `${Errors.RemoveRelatedPerson.UC_CODE}unsupportedKeys`,
  },
  addRelatedPersonsRelatedPersonIsAlreadyRelated: {
    code: `${Errors.AddRelatedPersons.UC_CODE}relatedPersonIsAlreadyRelated`,
    message: "Related person is already related to this student.",
  },
  addRelatedPersonFailedToCreateRelatedPerson: {
    code: `${Errors.AddRelatedPersons.UC_CODE}failedToCreateRelatedPerson`,
    message: "Failed to create related person.",
  },
  addRelatedPersonsRelatedPersonIsNotInCorrectState: {
    code: `${Errors.AddRelatedPersons.UC_CODE}relatedPersonIsNotInCorrectState`,
    message: "Related person is not in the correct state.",
  },
  relatedPersonIsNotRelatedToStudent: {
    code: `${Errors.RemoveRelatedPerson.UC_CODE}relatedPersonIsNotRelatedToStudent`,
    message: "The entered related person is not related to the student.",
  },
  updateRelationTypeUnsupportedKeys: {
    code: `${Errors.UpdateRelationType.UC_CODE}unsupportedKeys`,
  },
  updateNoteUnsupportedKeys: {
    code: `${Errors.UpdateNote.UC_CODE}unsupportedKeys`,
  },
  setFinalStateUuArtifactIfcAarDeleteFailed: {
    code: `${Errors.SetFinalState.UC_CODE}uuArtifactIfcAarDeleteFailed`,
    message: "Delete of AAR relation failed.",
  },
  checkExistenceOfActiveRelatedArtifactsFailed: {
    code: `${Errors.SetFinalState.UC_CODE}checkExistenceOfActiveRelatedArtifactsFailed`,
    message: "System failed to check existence of active related artifacts.",
  },
  setFinalStateRelatedPersonIsRelatedToOtherStudent: {
    code: `${Errors.SetFinalState.UC_CODE}setFinalStateRelatedPersonIsRelatedToOtherStudent`,
    message: "Student related person is related to other student too.",
  },
  setFinalStateRelatedPersonFailed: {
    code: `${Errors.SetFinalState.UC_CODE}setFinalStateRelatedPersonFailed`,
    message: "System failed to set state of related person.",
  },
  setRelatedPersonUnsupportedKeys: {
    code: `${Errors.SetRelatedPerson.UC_CODE}unsupportedKeys`,
  },
};
const UUOBCTYPECODE = "uu-schoolkit-schoolg01/student";

class StudentAbl {
  constructor() {
    this.validator = new Validator(Path.join(__dirname, "..", "api", "validation_types", "student-types.js"));
    this.states = STATES;
    this.dao = DaoFactory.getDao(Schemas.STUDENT);
    this.schoolKitDao = DaoFactory.getDao(Schemas.SCHOOLKIT);
    this.classDao = DaoFactory.getDao(Schemas.CLASS);
    this.subjectDao = DaoFactory.getDao(Schemas.SUBJECT);
    this.relatedPersonDao = DaoFactory.getDao(Schemas.RELATED_PERSON);
  }

  async setRelatedPerson(awid, dtoIn, authResult, session, uuAppErrorMap = {}) {
    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.SetRelatedPerson,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("studentSetRelatedPersonDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.setRelatedPersonUnsupportedKeys.code,
      Errors.SetRelatedPerson.InvalidDtoIn
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
      uuObject = await this.dao.getByPersonalCardId(awid, dtoIn.personalCardId);
    }

    // HDS 4
    // 4.1, 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.SetRelatedPerson.StudentDoesNotExist(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5, 5.1, 5.1.A
    let stateError = Errors.SetRelatedPerson.StudentIsNotInCorrectState;
    allowedStates = Student.NonFinalStatesWithPassive;
    StateChecker.ensureState(uuObject, stateError, allowedStates, uuAppErrorMap, {
      id: uuObject.id,
      personalCardId: dtoIn.personalCardId,
      state: uuObject.state,
    });

    // HDS 6, 6.1
    let profileList = authResult.getIdentityProfiles();
    let hasHigherRights = profileList.includes("Authorities") || profileList.includes("Executives");
    if (!hasHigherRights) {
      // 6.1
      const userUuId = session.getIdentity().getUuIdentity();
      // 6.2
      let isUserAllowedToSetRelatedPerson = false;
      // 6.3
      for (let relatedPerson of uuObject.relatedPersonList) {
        // 6.3.1.A
        if (relatedPerson.uuIdentity === userUuId && relatedPerson.isLegalGuardian === true) {
          // 6.3.1.A.1
          isUserAllowedToSetRelatedPerson = true;
        }
      }
      // 6.4 , 6.4.A.1
      if (!isUserAllowedToSetRelatedPerson) {
        throw new Errors.SetRelatedPerson.UserIsNotAuthorized({ uuAppErrorMap }, { uuIdentity: userUuId });
      }
    }

    // HDS 7, 7.1, 7.1.1
    let uuRelatedPerson = await this.relatedPersonDao.getByPersonalCardId(awid, dtoIn.relatedPerson.personalCardId);

    // 7.1.2, 7.1.2.A
    if (!uuRelatedPerson) {
      throw new Errors.SetRelatedPerson.RelatedPersonNotFound(
        { uuAppErrorMap },
        { personalCardId: dtoIn.relatedPerson.personalCardId }
      );
    }
    // 7.1.2.A, 7.1.2.A.1
    let relatedPersonStateError = Errors.SetRelatedPerson.RelatedPersonIsNotInCorrectState;
    allowedStates = RelatedPerson.NonFinalStatesWithPassive;
    StateChecker.ensureState(uuRelatedPerson, relatedPersonStateError, allowedStates, uuAppErrorMap, {
      id: uuRelatedPerson.id,
      state: uuRelatedPerson.state,
    });

    // HDS 8, 8.1, 8.1.1

    let isRelated = uuObject.relatedPersonList.find((rp) => rp.personalCardId === uuRelatedPerson.personalCardId);

    // 8.1.2
    if (!isRelated) {
      throw new Errors.SetRelatedPerson.RelatedPersonIsNotRelatedToStudent(
        { uuAppErrorMap },
        {
          relatedPerson: dtoIn.relatedPerson.personalCardId,
        }
      );
    } else {
      if (isRelated.isLegalGuardian === dtoIn.relatedPerson.isLegalGuardian) {
        throw new Errors.SetRelatedPerson.RelatedPersonHasAlreadyRequestedStatus({ uuAppErrorMap });
      }
      const currentLegalGuardiansCount = uuObject.relatedPersonList.filter((rp) => rp.isLegalGuardian).length;
      if (dtoIn.relatedPerson.isLegalGuardian && currentLegalGuardiansCount + 1 > 2) {
        throw new Errors.SetRelatedPerson.MaximumOfLegalGuardiansExceeded({ uuAppErrorMap });
      }
      if (!dtoIn.relatedPerson.isLegalGuardian && currentLegalGuardiansCount === 1) {
        throw new Errors.SetRelatedPerson.StudentHasOnlyOneLegalGuardian({ uuAppErrorMap });
      }
    }

    // HDS 9, 9.1
    uuObject.relatedPersonList.forEach((rp) => {
      if (rp.personalCardId === dtoIn.relatedPerson.personalCardId) {
        rp.isLegalGuardian = dtoIn.relatedPerson.isLegalGuardian;
      }
      return rp;
    });

    // 9.1.A
    try {
      uuObject = await this.dao.update(uuObject);
    } catch (e) {
      // 9.1.B, 9.1.B.1
      throw new Errors.SetRelatedPerson.StudentUpdateDaoFailed({ uuAppErrorMap }, { cause: e });
    }

    // HDS 10
    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }

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
    let validationResult = this.validator.validate("studentCreateDtoInType", dtoIn);
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

    // HDS 4, 4.1
    let legalGuardians = dtoIn.relatedPersonList.filter((person) => person.isLegalGuardian === true);
    // 4.1.1, 4.1.1.A.1
    if (legalGuardians.length > 2) {
      // 4.1.1.A.1.
      throw new Errors.Create.MaximumOfLegalGuardiansExceeded({ uuAppErrorMap });
    }
    //4.1.1.B.
    if (legalGuardians.length === 0) {
      // 4.1.1.B.1.
      throw new Errors.Create.MissingLegalGuardian({ uuAppErrorMap });
    }

    // HDS 5, 5.1
    let studentRelatedPersonList = [];
    let uuRelatedPerson;
    for (const item of dtoIn.relatedPersonList) {
      // 5.2, 5.2.1, 5.2.1.1
      uuRelatedPerson = null;
      uuRelatedPerson = await this.relatedPersonDao.getByPersonalCardId(awid, item.personalCardId);
      // 5.2.1.2.A.2., 5.2.1.2.A.2.1, 5.2.1.2.A.2.1,
      if (!uuRelatedPerson) {
        //5.2.1.2.A.2.2. , 5.2.1.2.A.2.2.A.
        try {
          uuRelatedPerson = await RelatedPersonAbl.create(uri, { personalCardId: item.personalCardId }, session);
          //5.2.1.2.A.2.2.B.
        } catch (e) {
          // 5.2.1.2.A.2.2.B.1.
          ValidationHelper.addWarning(
            uuAppErrorMap,
            WARNINGS.failedToCreateRelatedPerson.code,
            WARNINGS.failedToCreateRelatedPerson.message,
            { personalCardId: item.personalCardId, cause: e }
          );
        }
      }
      //5.2.1.3
      if (uuRelatedPerson) {
        // 5.2.1.3.A.
        if (uuRelatedPerson.state === this.states.closed) {
          // 5.2.1.2.B.1.
          ValidationHelper.addWarning(
            uuAppErrorMap,
            WARNINGS.relatedPersonIsNotInCorrectState.code,
            WARNINGS.relatedPersonIsNotInCorrectState.message,
            {
              id: uuRelatedPerson.id,
              state: uuRelatedPerson.state,
            }
          );
          // 5.2.1.3.B.
        } else {
          // 5.2.1.3.A.1.
          studentRelatedPersonList.push({
            id: uuRelatedPerson.id.toString(),
            relationType: item.relationType,
            isLegalGuardian: item.isLegalGuardian,
            uuIdentity: uuRelatedPerson.uuIdentity,
            personalCardId: item.personalCardId,
            name: uuRelatedPerson.name,
            surname: uuRelatedPerson.surname,
          });
        }
      }
    }
    // 5.3
    legalGuardians = studentRelatedPersonList.filter((person) => person.isLegalGuardian === true);
    //  5.3.1, 5.3.1.A
    if (!legalGuardians.length) {
      // 5.3.1.A.1.
      throw new Errors.Create.MissingLegalGuardian({ uuAppErrorMap });
    }

    // HDS 6, 6.1
    const studentCode = crypto.randomBytes(16).toString("hex");
    // 6.2

    const personAddress = (personData.addressList && personData.addressList.length && personData.addressList[0]) || {};
    const personPhoneMap = (personData.phoneList && personData.phoneList.length && personData.phoneList[0]) || {};

    // 6.3

    let contactInfo = {
      email: personData.email,
      phone: personPhoneMap.phone,
    };
    if (dtoIn.contactInfo && dtoIn.contactInfo.email) contactInfo.email = dtoIn.contactInfo.email;
    if (dtoIn.contactInfo && dtoIn.contactInfo.phone) contactInfo.phone = dtoIn.contactInfo.phone;

    let address = {
      address1: personAddress.addressLine1,
      address2: personAddress.addressLine2,
      city: personAddress.addressLine4,
      zipCode: personAddress.zip,
    };
    if (dtoIn.address && dtoIn.address.address1) address.address1 = dtoIn.address.address1;
    if (dtoIn.address && dtoIn.address.address2) address.address2 = dtoIn.address.address2;
    if (dtoIn.address && dtoIn.address.city) address.city = dtoIn.address.city;
    if (dtoIn.address && dtoIn.address.zipCode) address.zipCode = dtoIn.address.zipCode;

    const studentDtoInDao = {
      awid: awid,
      uuIdentity: personData.uuIdentity,
      personalCardId: dtoIn.personalCardId,
      code: studentCode,
      state: this.states.initial,
      name: personData.name,
      surname: personData.surname,
      healthConditions: dtoIn.healthConditions,
      address: address,
      contactInfo: contactInfo,
      relatedPersonList: studentRelatedPersonList,
    };

    // 6.4, 6.4.A
    let uuObject;
    try {
      uuObject = await this.dao.create(studentDtoInDao);
      // 6.4.B
    } catch (e) {
      // 6.4.B.1, 6.4.B.1.A
      if (e.code === "uu-app-objectstore/duplicateKey") {
        // 6.4.B.1.A.1.
        throw new Errors.Create.StudentAlreadyExists(
          { uuAppErrorMap },
          {
            cause: studentDtoInDao.uuIdentity,
          }
        );
      }
      throw new Errors.Create.StudentCreateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 7, 7.1
    const uuObUri = UriBuilder.parse(uri)
      .setUseCase("studentDetail")
      .setParameters({ id: uuObject.id.toString() })
      .toUri()
      .toString();

    const dtoInUuObc = {
      typeCode: UUOBCTYPECODE,
      name: uuObject.name + " " + uuObject.surname,
      desc: uuObject.desc,
      location: uuSchoolKit.btStudentsId,
      uuObId: uuObject.id,
      uuObUri: uuObUri,
    };
    // 7.2, 7.2.A
    let artifactEnvironment;
    let callOpts;
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      artifactEnvironment = await UuBtHelper.uuObc.create(uuSchoolKit.btBaseUri, dtoInUuObc, callOpts);

      // 7.2.B.
    } catch (e) {
      // 7.2.B.1. , 7.2.B.1.A.
      try {
        await this.dao.delete(awid, uuObject.id);

        // 7.2.B.1.B.
      } catch (e) {
        //7.2.B.1.B.1.
        ValidationHelper.addWarning(
          uuAppErrorMap,
          WARNINGS.failedToDeleteAfterRollback.code,
          WARNINGS.failedToDeleteAfterRollback.message,
          {
            e,
          }
        );
      }
      // 7.2.B.2.
      this._throwCorrespondingError(e, uuAppErrorMap);
    }

    //HDS 8, 8.1, 8.1.A
    try {
      uuObject = await this.dao.update({ awid, id: uuObject.id, artifactId: artifactEnvironment.id });

      //8.1.B.
    } catch (e) {
      // 8.1.B.1.
      throw new Errors.Create.StudentUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 9, 9.1
    const personUuObcId = personData.artifactId;
    const aarCreateDtoIn = { id: uuObject.artifactId, artifactB: personUuObcId };

    // 9.2, 9.2.A
    try {
      await UuBtHelper.uuArtifactIfc.createAar(uuSchoolKit.btBaseUri, aarCreateDtoIn, callOpts);

      //9.2.B.
    } catch (e) {
      // 9.2.B.1.
      throw new Errors.Create.AarCreateFailed({ uuAppErrorMap }, e);
    }
    let solverList = studentRelatedPersonList.map((rp) => {
      return {
        solverCode: rp.uuIdentity,
      };
    });

    const activityDtoIn = {
      id: uuObject.artifactId,
      submitterCode: session.getIdentity().getUuIdentity(),
      solverList: [{ solverCode: uuObject.uuIdentity }],
      type: activityTypes.doIt,
      name: Activity.createLsiContent("student", "name"),
      desc: Activity.createLsiContent("student", "desc"),
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

    const activityDtoInRelatedPerson = {
      id: uuObject.artifactId,
      submitterCode: uuObject.uuIdentity,
      solverList: solverList,
      type: activityTypes.doIt,
      name: Activity.createLsiContent("studentAddRelatedPerson", "name"),
      desc: Activity.createLsiContent("studentAddRelatedPerson", "desc"),
      endTime: dateFunctions.getNextDay(),
    };
    let activityResultRelatedPerson;
    try {
      activityResultRelatedPerson = await Activity.create(
        activityDtoInRelatedPerson,
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

    //HDS 10
    return {
      ...uuObject,
      activityResult,
      activityResultRelatedPerson,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  async load(uri, dtoIn, authResult, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.Load, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("studentLoadDtoInType", dtoIn);
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
      throw new Errors.Load.StudentNotFound({ uuAppErrorMap }, { id: dtoIn.id, personalCardId: dtoIn.personalCardId });
    }

    // HDS 5
    // 5.1
    const uuObcLoadEnvDtoIn = { id: uuObject.artifactId };
    let artifactEnvironment;
    let callOpts;
    // 5.2.
    // 5.2.A.
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      artifactEnvironment = await UuBtHelper.uuObc.loadEnvironment(uuSchoolKit.btBaseUri, uuObcLoadEnvDtoIn, callOpts);
    } catch (e) {
      // 5.2.B.
      // 5.2.B.1.
      throw new Errors.Load.FailedToLoadUuObcEnvironment({ uuAppErrorMap }, e);
    }

    // HDS 6
    // 6.1
    // fixme: we do not have a way to ensure that student is only active in one class
    let uuClass = await this.classDao.getStudentCurrentClass(awid, uuObject.id.toString());

    // HDS 7
    // 7.1
    let profileList = authResult.getIdentityProfiles();
    // 7.2
    // 7.2.A
    if (profileList.includes("Authorities") || profileList.includes("Executives") || profileList.includes("Auditors")) {
      // 7.2.A.1
      return {
        ...uuObject,
        uuClass,
        profileList,
        artifactEnvironment,
        uuAppErrorMap,
      };
    } else {
      // 7.2.B
      // 7.2.B.1
      // 7.2.B.1.1
      const userUid = session.getIdentity().getUuIdentity();
      // 7.2.B.1.2.A
      if (uuObject.uuIdentity === userUid) {
        // 7.2.B.1.2.A.1
        // delete uuObject.evaluation;
        // 7.2.B.1.2.A.2
        profileList.push("Student");
      }
      if (uuObject.relatedPersonList && uuObject.relatedPersonList.find((rp) => rp.uuIdentity === userUid)) {
        // 7.2.B.1.2.B
        // 7.2.B.1.2.B.1
        // delete uuObject.evaluation;
        // 7.2.B.1.2.B.1
        profileList.push("RelatedPerson");
      }

      // 7.2.B.1.2.C.1.
      let roleGroupIfcList = [];
      uuClass && roleGroupIfcList.push({ id: uuClass.classTeacher });
      // 7.2.B.1.2.C.2.
      let uuSubjectList = await this.subjectDao.listByStudentId(awid, uuObject.id.toString());
      // 7.2.B.1.2.C.3.1.A.
      uuSubjectList.itemList.forEach((subject) => {
        if (subject.studentList.find((student) => student.state !== this.states.closed)) {
          // 7.2.B.1.2.C.3.1.A.1.
          roleGroupIfcList.push({ id: subject.subjectTeacher });
        }
      });
      // 7.2.B.1.2.C.5.
      let verifyMyCastExistenceDtoOut;
      if (roleGroupIfcList.length) {
        try {
          // 7.2.B.1.2.C.5.A.
          verifyMyCastExistenceDtoOut = await UuBtHelper.verifyMyCastExistence(
            uuSchoolKit.btBaseUri,
            { roleGroupIfcList },
            callOpts
          );
        } catch (e) {
          // 7.2.B.1.2.C.5.B.
          // 7.2.B.1.2.C.5.B.1
          throw new Errors.Load.CallVerifyMyCastExistenceFailed({ uuAppErrorMap }, e);
        }
      }
      // 7.2.B.1.2.C.6
      if (
        verifyMyCastExistenceDtoOut &&
        verifyMyCastExistenceDtoOut.roleGroupIfcList.find((uuRole) => uuRole.id === uuClass.classTeacher)
      ) {
        // 7.2.B.1.2.C.6.A.1
        profileList.push("ClassTeacher");
      } else if (verifyMyCastExistenceDtoOut && verifyMyCastExistenceDtoOut.roleGroupIfcList.length) {
        // 7.2.B.1.2.C.6.B.1
        profileList.push("SubjectTeacher");
      } else {
        // 7.2.B.1.2.C.6.C.1
        const userIsTeacherAtAll = await UserRoleChecker.checkIsTeacher(awid, userUid);

        if (Object.keys(userIsTeacherAtAll).length !== 0) {
          profileList.push("Teacher");
        }
        if (profileList.length === 1 && profileList[0] === "StandardUsers") {
          throw new Errors.Load.UserNotAuthorized({ uuAppErrorMap });
        }
      }
    }

    let profilesWithOutEvaluation = ["Student", "RelatedPerson", "Teacher"];
    if (profileList.every((elem) => profilesWithOutEvaluation.includes(elem))) {
      delete uuObject.evaluation;
    }

    // HDS 8
    return {
      ...uuObject,
      uuClass,
      profileList,
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

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("studentUpdateDtoInType", dtoIn);
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
      throw new Errors.Update.StudentNotFound(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.Update.StudentIsNotInProperState({ uuAppErrorMap }, { id: uuObject.id, state: uuObject.state });
    }

    // HDS 6
    // 6.1
    const previousUid = uuObject.uuIdentity;
    try {
      // 6.1.A.
      uuObject = await this.dao.update({
        ...uuObject,
        ...dtoIn,
        address: { ...uuObject.address, ...dtoIn.address },
        contactInfo: { ...uuObject.contactInfo, ...dtoIn.contactInfo },
      });
    } catch (e) {
      // 6.1.B.
      // 6.1.B.1
      throw new Errors.Update.StudentUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 7, 7.1, 7.1.A
    if (dtoIn.uuIdentity && dtoIn.uuIdentity !== previousUid) {
      // 7.1.A.1. 7.1.A.1.A
      try {
        // 7.1.A.1.A.1
        await this.classDao.updateStudentRelation(uuObject.id.toString(), { uuIdentity: dtoIn.uuIdentity });
        // 7.1.A.1.A.2.
        await this.subjectDao.updateStudentRelation(uuObject.id.toString(), { uuIdentity: dtoIn.uuIdentity });
      } catch (e) {
        // 7.1.A.1.B.
        // 7.1.A.1.B.1
        throw new Errors.Update.StudentDaoUpdateRelationsFailed({ uuAppErrorMap }, e);
      }
    }

    // HDS 8
    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }

  /**
   * Updates student by related person.
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns {Promise<{uuAppErrorMap: (*|{})}>}
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
    let validationResult = this.validator.validate("studentUpdateByRelatedPersonDtoInType", dtoIn);
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
      throw new Errors.UpdateByRelatedPerson.StudentNotFound(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5
    // 5.1
    // 5.1.A
    let stateError = Errors.UpdateByRelatedPerson.StudentIsNotInProperState;
    allowedStates = Student.NonFinalStatesWithPassive;
    StateChecker.ensureState(uuObject, stateError, allowedStates, uuAppErrorMap, {
      id: uuObject.id,
      state: uuObject.state,
    });

    // HDS 6
    // 6.1
    const userUid = session.getIdentity().getUuIdentity();
    // 6.2
    const isRelatedPerson =
      uuObject.relatedPersonList && uuObject.relatedPersonList.find((rp) => rp.uuIdentity === userUid);
    //6.2.A.
    if (!isRelatedPerson) {
      // 6.2.A.1
      throw new Errors.UpdateByRelatedPerson.UserIsNotAuthorized({ uuAppErrorMap });
    }

    // HDS 7
    // 7.1
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
      throw new Errors.UpdateByRelatedPerson.StudentUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 8
    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }

  /**
   * Sets student's evaluation.
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns {Promise<{uuAppErrorMap: (*|{})}>}
   */
  async setEvaluation(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.SetEvaluation,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("studentSetEvaluationDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.setEvaluationUnsupportedKeys.code,
      Errors.SetEvaluation.InvalidDtoIn
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
      throw new Errors.SetEvaluation.StudentNotFound(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.SetEvaluation.StudentIsNotInProperState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6
    // 6.1
    let uuClass = await this.classDao.getStudentCurrentClass(awid, uuObject.id.toString());
    // 6.2
    let isAuthorized = false;
    // 6.3
    // 6.3.A
    if (uuClass) {
      // 6.3.A.1.
      let roleGroupIfcList = [{ id: uuClass.classTeacher }];
      let verifyMyCastExistenceDtoOut;
      // 6.3.A.3
      try {
        // 6.3.A.3.A
        let callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
        verifyMyCastExistenceDtoOut = await UuBtHelper.verifyMyCastExistence(
          uuSchoolKit.btBaseUri,
          { roleGroupIfcList },
          callOpts
        );
      } catch (e) {
        // 6.3.A.3.B.
        // 6.3.A.3.B.1
        throw new Errors.SetEvaluation.CallVerifyMyCastExistenceFailed({ uuAppErrorMap }, e);
      }
      // 6.3.A.4
      isAuthorized = verifyMyCastExistenceDtoOut.roleGroupIfcList.length;
    }

    if (!isAuthorized) {
      throw new Errors.SetEvaluation.UserNotAuthorized({ uuAppErrorMap });
    }

    // HDS 7
    // 7.1
    try {
      // 7.1.A.
      uuObject = await this.dao.update({ ...uuObject, ...dtoIn });
    } catch (e) {
      // 7.1.B.
      // 7.1.B.1
      throw new Errors.SetEvaluation.StudentUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 8
    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }

  /**
   * Sets student's nickname.
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns {Promise<{uuAppErrorMap: (*|{})}>}
   */
  async setNickname(uri, dtoIn, authResult, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.SetNickname,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("studentSetNicknameDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.setNicknameUnsupportedKeys.code,
      Errors.SetNickname.InvalidDtoIn
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
      throw new Errors.SetNickname.StudentNotFound(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.SetNickname.StudentIsNotInProperState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6
    // 6.1
    let profileList = authResult.getIdentityProfiles();
    const userUid = session.getIdentity().getUuIdentity();
    const isAllowed = profileList.includes("Authorities") || profileList.includes("Executives");
    // 6.2

    if (!isAllowed && userUid !== uuObject.uuIdentity) {
      // 6.2.A.1.
      throw new Errors.SetNickname.UserIsNotAuthorized({ uuAppErrorMap });
    }

    // HDS 7
    // 7.1
    try {
      // 7.1.A.
      uuObject = await this.dao.update({ ...uuObject, ...dtoIn });
    } catch (e) {
      // 7.1.B.
      // 7.1.B.1
      throw new Errors.SetNickname.StudentUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 8
    // 8.1
    // fixme: we do not have a way to ensure that student is only active in one class
    let uuClass = await this.classDao.getStudentCurrentClass(awid, uuObject.id.toString());

    // HDS 9
    return {
      ...uuObject,
      uuClass,
      uuAppErrorMap,
    };
  }

  async get(uri, dtoIn, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.Get, uuAppErrorMap);

    // HDS 2, 2.1, 2.2, 2.2.1, 2.3.1
    let validationResult = this.validator.validate("studentGetDtoInType", dtoIn);
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
      throw new Errors.Get.StudentNotFound({ uuAppErrorMap }, { id: dtoIn.id, personalCardId: dtoIn.personalCardId });
    }

    // HDS 5
    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }

  async setState(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();
    // 1.1

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.SetState, allowedStates, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("studentSetStateDtoInType", dtoIn);
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
      throw new Errors.SetState.StudentNotFound(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === STATES.closed) {
      // 5.1.A.1.
      throw new Errors.SetState.StudentIsNotInCorrectState(
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

  async list(awid, dtoIn, session, profileList, uuAppErrorMap = {}) {
    // HDS 1

    // HDS 1.1 - 1.3
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.List, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("studentListDtoInType", dtoIn);
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
    let result;
    if (dtoIn.filterMap) {
      let studentList = [];
      if (dtoIn.filterMap.classId) {
        const uuClass = await this.classDao.get(awid, dtoIn.filterMap.classId);
        if (uuClass && uuClass.studentList) studentList = uuClass.studentList;
      } else if (dtoIn.filterMap.subjectId) {
        const subject = await this.subjectDao.get(awid, dtoIn.filterMap.subjectId);
        if (subject && subject.studentList) studentList = subject.studentList;
      }
      const studentsListOfIds = studentList.map((student) => student.id);
      result = await this.dao.listByIds(awid, studentsListOfIds, DEFAULT_PAGE_INFO);
    } else {
      result = await this.dao.listStudentsWithClass(awid, dtoIn.pageInfo || DEFAULT_PAGE_INFO);
      if (Array.isArray(result)) result = { ...result[0], pageInfo: result[0].pageInfo[0] };
    }
    if (result && result.itemList) {
      let legalGuardianListOfUuIdentity = [];
      let legalGuardianList;
      result.itemList.forEach((item) => {
        if (item.relatedPersonList) {
          item.relatedPersonList.forEach((rp) => {
            if (rp.isLegalGuardian === true) {
              legalGuardianListOfUuIdentity.push(rp.uuIdentity);
            }
          });
        }
      });
      if (legalGuardianListOfUuIdentity.length) {
        legalGuardianList = await this.relatedPersonDao.listByUuIdentity({
          awid,
          arrayOfUuIdentity: legalGuardianListOfUuIdentity,
        });
      }
      if (legalGuardianList && legalGuardianList.itemList) {
        result.itemList.forEach((item) => {
          if (item.relatedPersonList) {
            item.relatedPersonList.forEach((rp) => {
              legalGuardianList.itemList.forEach((list) => {
                if (list.uuIdentity === rp.uuIdentity) {
                  rp.name = list.name;
                  rp.surname = list.surname;
                }
              });
            });
          }
        });
      }
    }

    // HDS 4
    return {
      ...result,
      uuAppErrorMap,
    };
  }

  async listByRelatedPerson(uri, dtoIn, profileList, session, uuAppErrorMap = {}) {
    const awid = uri.getAwid();
    // HDS 1

    // HDS 1.1 - 1.3
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.ListByRelatedPerson, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("studentListByRelatedPersonDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.listByRelatedPersonUnsupportedKeys.code,
      Errors.ListByRelatedPerson.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    let result = await this.dao.listByRelatedPerson(awid, dtoIn.relatedPersonId, dtoIn.pageInfo);

    if (
      !profileList.includes("Authorities") &&
      !profileList.includes("Executives") &&
      !profileList.includes("Auditors")
    ) {
      // 5.2.A.1.1.
      const userUid = session.getIdentity().getUuIdentity();
      let userIsRelatedPersonStudent = false;
      if (result && result.itemList && result.itemList.length) {
        for (let student of result.itemList) {
          profileList = await IsUserTeacher.checkIfUserIsTeacher(
            uri,
            student,
            null,
            uuSchoolKit,
            null,
            session,
            profileList,
            Errors.ListByRelatedPerson,
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
      const relatedPersonData = await this.relatedPersonDao.get(awid, dtoIn.relatedPersonId);
      if (relatedPersonData && relatedPersonData.uuIdentity && relatedPersonData.uuIdentity === userUid) {
        profileList.push("RelatedPerson");
      }
      // 5.2.A.1.2.A.
      // 5.2.A.1.2.A.1.

      if (
        !profileList.includes("Student") &&
        !profileList.includes("RelatedPerson") &&
        !profileList.includes("ClassTeacher")
      ) {
        // 5.2.A.1.2.B.
        // 5.2.A.1.2.B.1.
        throw new Errors.Load.UserNotAuthorized({ uuAppErrorMap });
      }
    }

    // HDS 4
    return {
      ...result,
      profileList,
      uuAppErrorMap,
    };
  }

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
    let validationResult = this.validator.validate("studentSetFinalStateDtoInType", dtoIn);
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
      throw new Errors.SetFinalState.StudentNotFound(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.SetFinalState.StudentIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6, 6.1
    const uuClass = await this.classDao.getStudentCurrentClass(awid, uuObject.id.toString());
    // 6.2 , 6.2.A
    if (uuClass) {
      // 6.2.A.1
      throw new Errors.SetFinalState.StudentIsActiveClassStudent(
        { uuAppErrorMap },
        { id: uuObject.id, classId: uuClass.id }
      );
    }

    // HDS 7, 7.1
    const currentSubjectList = await this.subjectDao.listByStudentId(awid, uuObject.id.toString());
    let isActiveSubjectStudent = currentSubjectList.itemList.find((subject) =>
      subject.studentList.find((student) => student.state !== this.states.closed)
    );
    // 7.2, 7.2.A
    if (isActiveSubjectStudent) {
      // 7.2.A.1
      throw new Errors.SetFinalState.StudentIsActiveSubjectStudent({ uuAppErrorMap }, { id: uuObject.id });
    }

    // HDS 8, 8.1., 8.2., 8.2.A.
    let callOpts;
    let listByArtifactADtoOut;
    const { btBaseUri } = uuSchoolKit;
    const dtoInListByArtifactB = { id: uuObject.artifactId };
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      listByArtifactADtoOut = await UuBtHelper.uuArtifactIfc.listByArtifactA(btBaseUri, dtoInListByArtifactB, callOpts);
    } catch (e) {
      // 8.2.B., 8.2.B.1.
      ValidationHelper.addWarning(
        uuAppErrorMap,
        WARNINGS.checkExistenceOfActiveRelatedArtifactsFailed.code,
        WARNINGS.checkExistenceOfActiveRelatedArtifactsFailed.message,
        { cause: e }
      );
    }

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

    // HDS 9
    // 9.1
    const uuObcSetStateDtoIn = {
      id: uuObject.artifactId,
      state: STATES.closed,
      desc: dtoIn.desc,
      data: dtoIn.stateData,
    };
    let artifactEnvironment;
    try {
      // 9.2
      // 9.2.A
      artifactEnvironment = await UuBtHelper.uuObc.setState(uuSchoolKit.btBaseUri, uuObcSetStateDtoIn, callOpts);
    } catch (e) {
      // 9.2.B
      // 9.2.B.1
      throw new Errors.SetFinalState.UuObcSetStateFailed({ uuAppErrorMap }, e);
    }

    // HDS 10
    const studentRelatedPersonList = uuObject.relatedPersonList;
    try {
      // 10.1
      // 10.1.A
      uuObject = await this.dao.update({ ...uuObject, state: STATES.closed, relatedPersonList: [] });
    } catch (e) {
      // 10.1.B
      // 10.1.B.1
      throw new Errors.SetFinalState.StudentUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 11
    //  11.1
    let studentRelatedPersonListId = studentRelatedPersonList.map((relatedPerson) => relatedPerson.id);
    let relatedPersonList;

    relatedPersonList = await this.relatedPersonDao.listById(awid, studentRelatedPersonListId);

    let relatedPersonsNotClosedList = relatedPersonList.itemList.map((relatedPerson) => {
      if (relatedPerson && relatedPerson.state !== this.states.closed) {
        return relatedPerson;
      }
    });

    for await (let relatedPerson of relatedPersonsNotClosedList) {
      let students = await this.dao.listByRelatedPerson(awid, relatedPerson.id.toString(), 1000);
      if (students.itemList.length) {
        ValidationHelper.addWarning(
          uuAppErrorMap,
          WARNINGS.setFinalStateRelatedPersonIsRelatedToOtherStudent.code,
          WARNINGS.setFinalStateRelatedPersonIsRelatedToOtherStudent.message,
          {
            id: relatedPerson.id,
            studentsId: students.itemList.map((student) => student.id),
          }
        );
      } else {
        try {
          await RelatedPersonAbl.setFinalState(uri, { id: relatedPerson.id }, session);
        } catch (e) {
          ValidationHelper.addWarning(
            uuAppErrorMap,
            WARNINGS.setFinalStateRelatedPersonFailed.code,
            WARNINGS.setFinalStateRelatedPersonFailed.message,
            {
              id: relatedPerson.id,
            }
          );
        }
      }
    }

    // HDS 11
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  async addRelatedPersons(uri, dtoIn, authResult, session, uuAppErrorMap = {}) {
    const auth = await TrustedSubAppAuthorization.checkSubApp(uri, session, authResult.getIdentityProfiles());
    const awid = uri.getAwid();
    // HDS 1

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.AddRelatedPersons,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2
    // 2.1.
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("studentAddRelatedPersonsDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.addRelatedPersonsUnsupportedKeys.code,
      Errors.AddRelatedPersons.InvalidDtoIn
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
      throw new Errors.AddRelatedPersons.StudentDoesNotExist(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.AddRelatedPersons.StudentIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6
    let profileList = authResult.getIdentityProfiles();
    let hasHigherRights = profileList.includes("Authorities") || profileList.includes("Executives");
    if (!hasHigherRights) {
      // 6.1
      const userUuId = session.getIdentity().getUuIdentity();
      // 6.2
      let isUserAllowedToAddRelatedPerson = false;
      // 6.3
      for (let relatedPerson of uuObject.relatedPersonList) {
        // 6.3.1.A
        if (relatedPerson.uuIdentity === userUuId && relatedPerson.isLegalGuardian === true) {
          // 6.3.1.A.1
          isUserAllowedToAddRelatedPerson = true;
          break;
        }
      }
      // 6.4 , 6.4.A.1
      if (!isUserAllowedToAddRelatedPerson) {
        throw new Errors.AddRelatedPersons.UserIsNotAuthorized({ uuAppErrorMap }, { uuIdentity: userUuId });
      }
    }
    // HDS 7
    // 7.1
    let checkedRelatedPersonList = [];
    dtoIn.relatedPersonList = this._removeDuplicates(dtoIn.relatedPersonList, "personalCardId");
    // 7.2.
    // 7.2.1.
    // 7.2.1.1.
    for (let relatedPersonToAdd of dtoIn.relatedPersonList) {
      // 7.2.1.2.
      let isRelated = false;
      if (uuObject.relatedPersonList) {
        isRelated = !!uuObject.relatedPersonList.find((rp) => rp.personalCardId === relatedPersonToAdd.personalCardId);
      }
      // 7.2.1.3.A
      if (isRelated) {
        // 7.2.1.3.A.1
        ValidationHelper.addWarning(
          uuAppErrorMap,
          WARNINGS.addRelatedPersonsRelatedPersonIsAlreadyRelated.code,
          WARNINGS.addRelatedPersonsRelatedPersonIsAlreadyRelated.message,
          { id: relatedPersonToAdd.id }
        );
      } else {
        // 7.2.1.3.B.
        checkedRelatedPersonList.push(relatedPersonToAdd);
      }
    }

    // 7.2.2.
    // 7.2.2.A.
    // 7.2.2.A.1
    if (checkedRelatedPersonList.length === 0) {
      throw new Errors.AddRelatedPersons.NoRelatedPersonsToAdd({ uuAppErrorMap });
    }

    // 7.3.
    // 7.3.1
    const currentLegalGuardiansCount =
      (uuObject.relatedPersonList && uuObject.relatedPersonList.filter((rp) => rp.isLegalGuardian).length) || 0;
    const legalGuardiansToAddCount = checkedRelatedPersonList.filter((rp) => rp.isLegalGuardian).length;

    // 7.3.1.1
    // 7.3.1.1.A.
    // 7.3.1.1.A.1.
    if (currentLegalGuardiansCount + legalGuardiansToAddCount > 2) {
      throw new Errors.AddRelatedPersons.MaximumOfLegalGuardiansExceeded({ uuAppErrorMap });
    }

    // HDS 8
    // 8.1
    let studentRelatedPersonList = [];

    // 8.2
    for (let checkedRelatedPerson of checkedRelatedPersonList) {
      // 8.2.1.
      // 8.2.1.1.
      let uuRelatedPerson = await this.relatedPersonDao.getByPersonalCardId(awid, checkedRelatedPerson.personalCardId);

      // 8.2.1.2.
      // 8.2.1.2.A.
      // 8.2.1.2.A.1
      if (!uuRelatedPerson) {
        if (!hasHigherRights) {
          throw new Errors.AddRelatedPersons.UserIsNotAuthorized({ uuAppErrorMap });
        }
        // 8.2.1.2.A.1.2.
        try {
          uuRelatedPerson = await RelatedPersonAbl.create(
            uri,
            { personalCardId: checkedRelatedPerson.personalCardId },
            session
          );
          //8.2.1.2.A.1.2.B.
        } catch (e) {
          // 8.2.1.2.A.1.2.B.1.
          ValidationHelper.addWarning(
            uuAppErrorMap,
            WARNINGS.addRelatedPersonFailedToCreateRelatedPerson.code,
            WARNINGS.addRelatedPersonFailedToCreateRelatedPerson.message,
            { id: checkedRelatedPerson.id, cause: e }
          );
        }
      }

      // 8.2.1.2.B.
      // 8.2.1.2.B.1
      if (uuRelatedPerson) {
        if (uuRelatedPerson.state === this.states.closed) {
          ValidationHelper.addWarning(
            uuAppErrorMap,
            WARNINGS.addRelatedPersonsRelatedPersonIsNotInCorrectState.code,
            WARNINGS.addRelatedPersonsRelatedPersonIsNotInCorrectState.message,
            { id: checkedRelatedPerson.id }
          );
        }
        // 8.2.1.2.C.
        // 8.2.1.2.C.1.
        else {
          studentRelatedPersonList.push({
            id: uuRelatedPerson.id.toString(),
            uuIdentity: uuRelatedPerson.uuIdentity,
            relationType: checkedRelatedPerson.relationType,
            note: checkedRelatedPerson.note,
            isLegalGuardian: checkedRelatedPerson.isLegalGuardian,
            name: uuRelatedPerson.name,
            surname: uuRelatedPerson.surname,
            personalCardId: uuRelatedPerson.personalCardId,
          });
        }
      }
    }

    // 8.3
    // 8.3.A.
    // 8.3.A.1.
    if (studentRelatedPersonList.length === 0) {
      throw new Errors.AddRelatedPersons.NoRelatedPersonsToAdd({ uuAppErrorMap });
    }

    // HDS 9
    // 9.1
    let daoDtoIn = {
      filter: {
        id: uuObject.id,
        awid: awid,
      },
      relatedPersonsToAdd: studentRelatedPersonList,
    };

    // 9.2.
    // 9.2.A.
    let dtoOut = {};
    try {
      dtoOut = await this.dao.addRelatedPersons(daoDtoIn);
      // 9.2.B.
    } catch (e) {
      // 9.2.B.1.
      // throw new Errors.AddRelatedPersons.StudentDaoAddRelatedPersons({ uuAppErrorMap }, e);
    }

    let studentCourses = [];
    const listOfRelatedPersons = studentRelatedPersonList.filter((student) => student.isLegalGuardian === true);
    if (listOfRelatedPersons.length) {
      const studentSubjects = await this.subjectDao.listByStudentId(awid, uuObject.id.toString(), DEFAULT_PAGE_INFO);

      if (studentSubjects && studentSubjects.itemList.length) {
        for (let subject of studentSubjects.itemList) {
          if (subject.appMap && subject.appMap.length) {
            for (let course of subject.appMap) {
              if (course.type === "course" && !studentCourses.find((item) => item.uri === course.uri)) {
                const callOpts = await AppClientTokenHelper.createToken(uri, course.uri, session);
                studentCourses.push({ uri: course.uri, subjectId: subject.id, callOpts });
              }
            }
          }
        }

        const studentPartDtoIn = {
          uuIdentity: uuObject.uuIdentity,
          relatedPersonList: listOfRelatedPersons,
        };

        //TODO : in case of many courses, we need to parse dtoIn into smaller parts
        if (studentCourses.length) {
          let consoleUri = ConsoleUriHelper.get(uuSchoolKit);
          const addRelatedPersonScriptDtoIn = {
            scriptUri: Config.get("uuScriptUpdateRelatedPersonInCourse"),
            consoleUri,
            scriptDtoIn: {
              studentList: [studentPartDtoIn],
              courseList: studentCourses,
              action: "addRelatedPersonToStudent",
            },
          };

          ScriptEngineHelper.uuSchoolKitUpdateStudentToCourse(
            uuSchoolKit.scriptEngineUri,
            addRelatedPersonScriptDtoIn,
            session
          );
        }
      }
    }
    const solverList = studentRelatedPersonList.map((rp) => {
      return {
        solverCode: rp.uuIdentity,
      };
    });

    const activityDtoIn = {
      id: uuObject.artifactId,
      submitterCode: session.getIdentity().getUuIdentity(),
      solverList: solverList,
      type: activityTypes.doIt,
      name: Activity.createLsiContent("studentAddRelatedPerson", "name"),
      desc: Activity.createLsiContent("studentAddRelatedPerson", "desc"),
      endTime: dateFunctions.getNextDay(),
    };
    let activityResult;
    try {
      activityResult = await Activity.create(activityDtoIn, session, uuSchoolKit.btBaseUri, uri, null, uuAppErrorMap);
    } catch (e) {
      ValidationHelper.addWarning(
        uuAppErrorMap,
        WARNINGS.createFailedToCreateActivity.code,
        WARNINGS.createFailedToCreateActivity.message,
        { cause: e }
      );
    }

    // HDS 10
    return {
      ...dtoOut,
      uuObject,
      activityResult,
      uuAppErrorMap,
    };
  }

  async removeRelatedPerson(uri, dtoIn, authResult, session, uuAppErrorMap = {}) {
    const auth = await TrustedSubAppAuthorization.checkSubApp(uri, session, authResult.getIdentityProfiles());
    // HDS 1
    const awid = uri.getAwid();
    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.RemoveRelatedPerson,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2
    // 2.1.
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("studentRemoveRelatedPersonDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.RemoveRelatedPerson.code,
      Errors.RemoveRelatedPerson.InvalidDtoIn
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
      throw new Errors.RemoveRelatedPerson.StudentDoesNotExist(
        { uuAppErrorMap },
        { id: dtoIn.id, personalCardId: dtoIn.personalCardId }
      );
    }

    // HDS 5
    // 5.1.A.
    // 5.1.A.1.
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.RemoveRelatedPerson.StudentIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6
    let profileList = authResult.getIdentityProfiles();
    let hasHigherRights = profileList.includes("Authorities") || profileList.includes("Executives");
    if (!hasHigherRights) {
      // 6.1
      const userUuId = session.getIdentity().getUuIdentity();
      // 6.2
      let isUserAllowedToAddRelatedPerson = false;
      // 6.3
      for (let relatedPerson of uuObject.relatedPersonList) {
        // 6.3.1.A
        if (relatedPerson.uuIdentity === userUuId && relatedPerson.isLegalGuardian === true) {
          // 6.3.1.A.1
          isUserAllowedToAddRelatedPerson = true;
        }
      }
      // 6.4 , 6.4.A.1
      if (!isUserAllowedToAddRelatedPerson) {
        throw new Errors.RemoveRelatedPerson.UserIsNotAuthorized({ uuAppErrorMap }, { uuIdentity: userUuId });
      }
    }

    // HDS 7
    // 7.1.
    const relatedPersonToRemove = uuObject.relatedPersonList.find((rp) => rp.id.toString() === dtoIn.relatedPersonId);

    const listOfRelatedGuardian = uuObject.relatedPersonList.filter((rp) => rp.isLegalGuardian === true);
    // 7.2.
    // 7.2.A.
    // 7.2.A.1.
    if (!relatedPersonToRemove) {
      ValidationHelper.addWarning(
        uuAppErrorMap,
        WARNINGS.relatedPersonIsNotRelatedToStudent.code,
        WARNINGS.relatedPersonIsNotRelatedToStudent.message,
        { id: dtoIn.relatedPersonId }
      );
      return { uuAppErrorMap };
      // 7.2.B
    } else {
      // 7.2.B.1, 7.2.B.1.A
      if (relatedPersonToRemove.isLegalGuardian && listOfRelatedGuardian && listOfRelatedGuardian.length <= 1) {
        // 7.2.B.1.A.1
        throw new Errors.RemoveRelatedPerson.StudentCantHaveAnyRelatedPerson({ uuAppErrorMap }, { id: uuObject.id });
      }
    }

    // HDS 8
    // 8.1
    let daoDtoIn;
    if (dtoIn.id) {
      daoDtoIn = {
        filter: {
          awid,
          id: dtoIn.id,
        },
      };
    } else {
      daoDtoIn = {
        filter: {
          awid,
          personalCardId: dtoIn.personalCardId,
        },
      };
    }
    daoDtoIn.relatedPerson = dtoIn.relatedPersonId;
    // 8.2
    let result = {};
    try {
      result = await this.dao.removeRelatedPerson(daoDtoIn);
    } catch (e) {
      throw new Errors.RemoveRelatedPerson.RemoveRelatedPersonDaoFailed({ uuAppErrorMap }, e);
    }

    let studentCourses = [];
    if (relatedPersonToRemove) {
      const studentSubjects = await this.subjectDao.listByStudentId(awid, uuObject.id.toString(), DEFAULT_PAGE_INFO);

      if (studentSubjects && studentSubjects.itemList.length) {
        for (let subject of studentSubjects.itemList) {
          if (subject.appMap && subject.appMap.length) {
            for (let course of subject.appMap) {
              if (course.type === "course" && !studentCourses.find((item) => item.uri === course.uri)) {
                const callOpts = await AppClientTokenHelper.createToken(uri, course.uri, session);
                studentCourses.push({ uri: course.uri, subjectId: subject.id, callOpts });
              }
            }
          }
        }
        const studentPartDtoIn = {
          uuIdentity: uuObject.uuIdentity,
          relatedPersonList: [relatedPersonToRemove],
        };
        if (studentCourses.length) {
          let consoleUri = ConsoleUriHelper.get(uuSchoolKit);
          const addRelatedPersonScriptDtoIn = {
            scriptUri: Config.get("uuScriptUpdateRelatedPersonInCourse"),
            consoleUri,
            scriptDtoIn: {
              studentList: [studentPartDtoIn],
              courseList: studentCourses,
              action: "removeRelatedPersonFromStudent",
            },
          };

          ScriptEngineHelper.uuSchoolKitUpdateStudentToCourse(
            uuSchoolKit.scriptEngineUri,
            addRelatedPersonScriptDtoIn,
            session
          );
        }
      }
    }

    // HDS 9
    return {
      ...result,
      uuAppErrorMap,
    };
  }

  async updateNote(awid, dtoIn, authResult, session, uuAppErrorMap = {}) {
    // HDS 1

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.UpdateNote,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("studentUpdateNoteDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.updateNoteUnsupportedKeys.code,
      Errors.UpdateNote.InvalidDtoIn
    );

    // HDS 3, 3.1
    let uuObject = await this.dao.get(awid, dtoIn.id);

    //HDS 4, 4.1, 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.UpdateNote.StudentNotFound({ uuAppErrorMap, id: dtoIn.id });
    }

    // HDS 5, 5.1,, 5.1.A
    if (uuObject.state === "closed") {
      // 5.1.A.1
      throw new Errors.UpdateNote.StudentIsNotInCorrectState(
        {
          uuAppErrorMap,
        },
        {
          id: dtoIn.id,
          state: uuObject.state,
        }
      );
    }

    // HDS 6, 6.1
    let relatedPerson = await this.relatedPersonDao.get(awid, dtoIn.relatedPersonId);

    // HDS 7, 7.1, 7.1.A
    if (!relatedPerson) {
      // 7.1.A.1
      throw new Errors.UpdateNote.RelatedPersonNotFound({ uuAppErrorMap }, { id: dtoIn.relatedPersonId });
    }

    // HDS 8, 8.1, 8.1.A
    if (relatedPerson.state === "closed") {
      // 8.1.A.1
      throw new Errors.UpdateNote.RelatedPersonIsNotInCorrectState({
        uuAppErrorMap,
        id: dtoIn.relatedPersonId,
        state: relatedPerson.state,
      });
    }

    let profileList = authResult.getIdentityProfiles();
    let hasHigherRights = profileList.includes("Authorities") || profileList.includes("Executives");
    if (!hasHigherRights) {
      // 9.1
      const userUuId = session.getIdentity().getUuIdentity();
      // 9.2
      let isUserAllowedToAddRelatedPerson = false;
      // 9.3
      for (let relatedPerson of uuObject.relatedPersonList) {
        // 9.3.1.A
        if (relatedPerson.uuIdentity === userUuId && relatedPerson.isLegalGuardian === true) {
          // 9.3.1.A.1
          isUserAllowedToAddRelatedPerson = true;
        }
      }
      // 9.4 , 9.4.A.1
      if (!isUserAllowedToAddRelatedPerson) {
        throw new Errors.UpdateNote.UserIsNotAuthorized({ uuAppErrorMap }, { uuIdentity: userUuId });
      }
    }

    // HDS 10

    // 10.1
    let updatedRelatedPersonList = uuObject.relatedPersonList.map((relatedPerson) => {
      if (relatedPerson.id === dtoIn.relatedPersonId) {
        relatedPerson.note = dtoIn.note;
      }
      return relatedPerson;
    });

    // 10.1.A
    const object = {
      ...uuObject,
      relatedPersonList: updatedRelatedPersonList,
    };
    try {
      uuObject = await this.dao.update(object);
    } catch (e) {
      // 10.1.B, 10.1.B.1
      throw new Errors.UpdateNote.StudentDaoUpdateFailed({ uuAppErrorMap }, { id: dtoIn.id, cause: e });
    }

    // HDS 11
    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }

  async updateRelationType(awid, dtoIn, authResult, session, uuAppErrorMap = {}) {
    // HDS 1

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(
      awid,
      Errors.UpdateRelationType,
      allowedStates,
      uuAppErrorMap
    );

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("studentUpdateRelationTypeDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.updateRelationTypeUnsupportedKeys.code,
      Errors.UpdateRelationType.InvalidDtoIn
    );

    // HDS 3, 3.1
    let uuObject = await this.dao.get(awid, dtoIn.id);

    //HDS 4, 4.1, 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.UpdateRelationType.StudentNotFound({ uuAppErrorMap, id: dtoIn.id });
    }

    // HDS 5, 5.1,, 5.1.A
    if (uuObject.state === "closed") {
      // 5.1.A.1
      throw new Errors.UpdateRelationType.StudentIsNotInCorrectState(
        {
          uuAppErrorMap,
        },
        {
          id: dtoIn.id,
          state: uuObject.state,
        }
      );
    }

    // HDS 6, 6.1
    let relatedPerson = await this.relatedPersonDao.get(awid, dtoIn.relatedPersonId);

    // HDS 7, 7.1, 7.1.A
    if (!relatedPerson) {
      // 7.1.A.1
      throw new Errors.UpdateRelationType.RelatedPersonNotFound({ uuAppErrorMap }, { id: dtoIn.relatedPersonId });
    }

    // HDS 8, 8.1, 8.1.A
    if (relatedPerson.state === "closed") {
      // 8.1.A.1
      throw new Errors.UpdateRelationType.RelatedPersonIsNotInCorrectState({
        uuAppErrorMap,
        id: dtoIn.relatedPersonId,
        state: relatedPerson.state,
      });
    }

    // HDS 9

    let profileList = authResult.getIdentityProfiles();
    let hasHigherRights = profileList.includes("Authorities") || profileList.includes("Executives");
    if (!hasHigherRights) {
      // 9.1
      const userUuId = session.getIdentity().getUuIdentity();
      // 9.2
      let isUserAllowedToAddRelatedPerson = false;
      // 9.3
      for (let relatedPerson of uuObject.relatedPersonList) {
        // 9.3.1.A
        if (relatedPerson.uuIdentity === userUuId && relatedPerson.isLegalGuardian === true) {
          // 9.3.1.A.1
          isUserAllowedToAddRelatedPerson = true;
        }
      }
      // 9.4 , 9.4.A.1
      if (!isUserAllowedToAddRelatedPerson) {
        throw new Errors.UpdateRelationType.UserIsNotAuthorized({ uuAppErrorMap }, { uuIdentity: userUuId });
      }
    }

    // HDS 10

    // 10.1
    let updatedRelatedPersonList = uuObject.relatedPersonList.map((relatedPerson) => {
      if (relatedPerson.id === dtoIn.relatedPersonId) {
        relatedPerson.relationType = dtoIn.relationType;
      }
      return relatedPerson;
    });

    const object = {
      ...uuObject,
      relatedPersonList: updatedRelatedPersonList,
    };
    // 10.1.A
    try {
      uuObject = await this.dao.update(object);
      // 10.1.B.1
    } catch (e) {
      // 10.1.B.1
      throw new Errors.UpdateRelationType.StudentDaoUpdateFailed({ uuAppErrorMap }, { id: dtoIn.id, cause: e });
    }

    // HDS 11
    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }

  _removeDuplicates(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
      return arr.map((mapObj) => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
  }

  _throwCorrespondingError(e, uuAppErrorMap) {
    let error;
    switch (e.code) {
      case "invalidHomeFolderState":
        // 7.2.B.2.A.
        // 7.2.B.2.A.1.
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

module.exports = new StudentAbl();

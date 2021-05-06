"use strict";
const Path = require("path");
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { UriBuilder } = require("uu_appg01_server").Uri;
const Errors = require("../api/errors/student-error.js");
const SchoolkitMainAbl = require("./schoolkit-main-abl.js");
const RelatedPersonAbl = require("./related-person-abl");
const crypto = require("crypto");
const AppClientTokenHelper = require("./helpers/app-client-token-helper.js");
const UuBtHelper = require("./helpers/uu-bt-helper.js");
const UuBemHelper = require("./helpers/uu-bem-helper.js");

const STATES = Object.freeze({
  initial: "initial",
  active: "active",
  closed: "closed",
  former: "former"
});
const DEFAULT_PAGE_INFO = {
  pageIndex: 0,
  pageSize: 1000
};
const WARNINGS = {
  createUnsupportedKeys: {
    code: `${Errors.Create.UC_CODE}unsupportedKeys`
  },
  relatedPersonNotFound: {
    code: `${Errors.Create.UC_CODE}relatedPersonNotFound`,
    message: "Related person not found."
  },
  relatedPersonIsNotInCorrectState: {
    code: `${Errors.Create.UC_CODE}relatedPersonIsNotInCorrectState`,
    message: "Related person is not in correct state."
  },
  failedToCreateRelatedPerson: {
    code: `${Errors.Create.UC_CODE}failedToCreateRelatedPerson`,
    message: "Failed to create related person."
  },
  failedToDeleteAfterRollback: {
    code: `${Errors.Create.UC_CODE}failedToDeleteAfterRollback`,
    message: "System failed to delete uuObject after an exception has been thrown in uuObcIfc/create use case."
  },
  loadUnsupportedKeys: {
    code: `${Errors.Load.UC_CODE}unsupportedKeys`
  },
  updateUnsupportedKeys: {
    code: `${Errors.Update.UC_CODE}unsupportedKeys`
  },
  updateByRelatedPersonUnsupportedKeys: {
    code: `${Errors.UpdateByRelatedPerson.UC_CODE}unsupportedKeys`
  },
  setEvaluationUnsupportedKeys: {
    code: `${Errors.SetEvaluation.UC_CODE}unsupportedKeys`
  },
  setNicknameUnsupportedKeys: {
    code: `${Errors.SetNickname.UC_CODE}unsupportedKeys`
  },
  getUnsupportedKeys: {
    code: `${Errors.Get.UC_CODE}unsupportedKeys`
  },
  listUnsupportedKeys: {
    code: `${Errors.List.UC_CODE}unsupportedKeys`
  },
  listByRelatedPersonUnsupportedKeys: {
    code: `${Errors.ListByRelatedPerson.UC_CODE}unsupportedKeys`
  },
  setStateUnsupportedKeys: {
    code: `${Errors.SetState.UC_CODE}unsupportedKeys`
  },
  setFinalStateUnsupportedKeys: {
    code: `${Errors.SetFinalState.UC_CODE}unsupportedKeys`
  },
  addRelatedPersonsUnsupportedKeys: {
    code: `${Errors.AddRelatedPersons.UC_CODE}unsupportedKeys`
  },
  RemoveRelatedPerson: {
    code: `${Errors.RemoveRelatedPerson.UC_CODE}unsupportedKeys`
  },
  addRelatedPersonsRelatedPersonIsAlreadyRelated: {
    code: `${Errors.AddRelatedPersons.UC_CODE}relatedPersonIsAlreadyRelated`,
    message: "Related person is already related to this student."
  },
  addRelatedPersonFailedToCreateRelatedPerson: {
    code: `${Errors.AddRelatedPersons.UC_CODE}failedToCreateRelatedPerson`,
    message: "Failed to create related person."
  },
  addRelatedPersonsRelatedPersonIsNotInCorrectState: {
    code: `${Errors.AddRelatedPersons.UC_CODE}relatedPersonIsNotInCorrectState`,
    message: "Related person is not in the correct state."
  },
  relatedPersonIsNotRelatedToStudent: {
    code: `${Errors.RemoveRelatedPerson.UC_CODE}relatedPersonIsNotRelatedToStudent`,
    message: "The entered related person is not related to the student."
  },
  updateRelationTypeUnsupportedKeys: {
    code: `${Errors.UpdateRelationType.UC_CODE}unsupportedKeys`
  },
  updateNoteUnsupportedKeys: {
    code: `${Errors.UpdateNote.UC_CODE}unsupportedKeys`
  }
};
const UUOBCTYPECODE = "uu-schoolkit-schoolg01/student";

class StudentAbl {
  constructor() {
    this.validator = new Validator(Path.join(__dirname, "..", "api", "validation_types", "student-types.js"));
    this.states = STATES;
    this.dao = DaoFactory.getDao(SchoolkitMainAbl.schemas.student);
    this.schoolKitDao = DaoFactory.getDao(SchoolkitMainAbl.schemas.schoolKit);
    this.classDao = DaoFactory.getDao(SchoolkitMainAbl.schemas.class);
    this.subjectDao = DaoFactory.getDao(SchoolkitMainAbl.schemas.subject);
    this.relatedPersonDao = DaoFactory.getDao(SchoolkitMainAbl.schemas.relatedPerson);
  }

  async create(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();
    // 1.1
    let uuSchoolKit = await this.schoolKitDao.getByAwid(awid);
    // 1.2.
    if (!uuSchoolKit) {
      // 1.2.A.
      // 1.2.A.1.
      throw new Errors.Create.UuSchoolkitDoesNotExist({ uuAppErrorMap }, { awid });
    }
    // 1.3
    // 1.3.A.
    if (uuSchoolKit.state !== SchoolkitMainAbl.states.active) {
      // 1.3.A.1
      throw new Errors.Create.UuSchoolKitIsNotInCorrectState(
        { uuAppErrorMap },
        { awid, state: uuSchoolKit.state, expectedState: SchoolkitMainAbl.states.active }
      );
    }

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
    let legalGuardians = dtoIn.relatedPersonList.filter(person => person.isLegalGuardian === true);
    // 4.1.1, 4.1.1.A.1
    // FIXME magická konstanta 2 - to je nutné mít někde mimo metodu, nahoře v konstantách. Naprosto ideálně v
    // nějaké jiné změnitelné konfiguraci
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
      uuRelatedPerson = await this.relatedPersonDao.getByUuIdentity(awid, item.uuIdentity);
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
              state: uuRelatedPerson.state
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
            mame: uuRelatedPerson.name,
            surmame: uuRelatedPerson.surname
          });
        }
      }
    }
    // 5.3
    legalGuardians = studentRelatedPersonList.filter(person => person.isLegalGuardian === true);
    //  5.3.1, 5.3.1.A
    if (!legalGuardians.length) {
      // 5.3.1.A.1.
      throw new Errors.Create.MissingLegalGuardian({ uuAppErrorMap });
    }

    // HDS 6, 6.1
    // TODO uuAppComponent
    const studentCode = crypto.randomBytes(16).toString("hex");
    // 6.2

    const personAddress = (personData.addressList && personData.addressList.length && personData.addressList[0]) || {};
    const personPhoneMap = (personData.phoneList && personData.phoneList.length && personData.phoneList[0]) || {};

    // 6.3

    let contactInfo = {
      email: personData.email,
      phone: personPhoneMap.phone
    };
    if (dtoIn.contactInfo && dtoIn.contactInfo.email) contactInfo.email = dtoIn.contactInfo.email;
    if (dtoIn.contactInfo && dtoIn.contactInfo.phone) contactInfo.phone = dtoIn.contactInfo.phone;

    let address = {
      address1: personAddress.addressLine1,
      address2: personAddress.addressLine2,
      city: personAddress.addressLine4,
      zipCode: personAddress.zip
    };
    // FIXME tohle jde udělat jednoduše přes Object.assign(address, dtoIn.address);
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
      relatedPersonList: studentRelatedPersonList
    };

    if (!personData.uuIdentity) {
      // since there is { unique:1, sparse:1 } index in dao we have to delete null values
      delete studentDtoInDao.uuIdentity;
    }

    // 6.4, 6.4.A
    let uuObject;
    try {
      uuObject = await this.dao.create(studentDtoInDao);
      // 6.4.B
    } catch (e) {
      // 6.4.B.1, 6.4.B.1.A
      // FIXME magic konstanta - je možné referencovat přímo takto, if (e instanceof DuplicateKeyError) nebo tak nějak
      if (e.code === "uu-app-objectstore/duplicateKey") {
        // 6.4.B.1.A.1.
        throw new Errors.Create.StudentAlreadyExists(
          { uuAppErrorMap },
          {
            cause: studentDtoInDao.uuIdentity
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
      code: uuObject.code,
      name: uuObject.name + " " + uuObject.surname,
      desc: uuObject.desc,
      location: uuSchoolKit.btStudentsId,
      uuObId: uuObject.id,
      uuObUri: uuObUri
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
            e
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
    const personUuObcId = personData.artifactId
    const aarCreateDtoIn = { id: uuObject.artifactId, artifactB: personUuObcId };

    // 9.2, 9.2.A
    try {
      await UuBtHelper.uuArtifactIfc.createAar(uuSchoolKit.btBaseUri, aarCreateDtoIn, callOpts);

      //9.2.B.
    } catch (e) {
      // 9.2.B.1.
      throw new Errors.Create.AarCreateFailed({ uuAppErrorMap }, e);
    }

    //HDS 10
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap
    };
  }

  async load(uri, dtoIn, authResult, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();
    //  1.1
    let uuSchoolKit = await this.schoolKitDao.getByAwid(awid);
    // 1.2.A.
    if (!uuSchoolKit) {
      // 1.2.A.1.
      throw new Errors.Load.UuSchoolkitDoesNotExist({ uuAppErrorMap }, { awid });
    }

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
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.Load.StudentNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
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
        uuAppErrorMap
      };
    } else {
      // 7.2.B
      // 7.2.B.1
      // 7.2.B.1.1
      const userUid = session.getIdentity().getUuIdentity();
      // 7.2.B.1.2.A
      if (uuObject.uuIdentity === userUid) {
        // 7.2.B.1.2.A.1
        delete uuObject.evaluation;
        // 7.2.B.1.2.A.2
        profileList.push("Student");
      } else if (uuObject.relatedPersonList && uuObject.relatedPersonList.find(rp => rp.uuIdentity === userUid)) {
        // 7.2.B.1.2.B
        // 7.2.B.1.2.B.1
        delete uuObject.evaluation;
        // 7.2.B.1.2.B.1
        profileList.push("RelatedPerson");
      } else {
        // 7.2.B.1.2.C.1.
        let roleGroupIfcList = [];
        uuClass && roleGroupIfcList.push({ id: uuClass.classTeacher });
        // 7.2.B.1.2.C.2.
        let uuSubjectList = await this.subjectDao.listByStudentId(awid, uuObject.id.toString());
        // 7.2.B.1.2.C.3.1.A.
        uuSubjectList.itemList.forEach(subject => {
          if (subject.studentList.find(student => student.state === this.states.active)) {
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
          verifyMyCastExistenceDtoOut.roleGroupIfcList.find(uuRole => uuRole.id === uuClass.classTeacher)
        ) {
          // 7.2.B.1.2.C.6.A.1
          profileList.push("ClassTeacher");
        } else if (verifyMyCastExistenceDtoOut && verifyMyCastExistenceDtoOut.roleGroupIfcList.length) {
          // 7.2.B.1.2.C.6.B.1
          profileList.push("SubjectTeacher");
        } else {
          // 7.2.B.1.2.C.6.C.1
          throw new Errors.Load.UserNotAuthorized({ uuAppErrorMap });
        }
      }
    }

    // HDS 8
    return {
      ...uuObject,
      uuClass,
      profileList,
      artifactEnvironment,
      uuAppErrorMap
    };
  }

  async update(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();
    // 1.1
    let uuSchoolKit = await this.schoolKitDao.getByAwid(awid);
    // 1.2.
    if (!uuSchoolKit) {
      // 1.2.A.
      // 1.2.A.1.
      throw new Errors.Update.UuSchoolkitDoesNotExist({ uuAppErrorMap }, { awid });
    }
    // 1.3
    // 1.3.A.
    if (uuSchoolKit.state !== SchoolkitMainAbl.states.active) {
      // 1.3.A.1
      throw new Errors.Update.UuSchoolKitIsNotInCorrectState(
        { uuAppErrorMap },
        { awid: awid, state: uuSchoolKit.state, expectedState: SchoolkitMainAbl.states.active }
      );
    }

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
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.Update.StudentNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.Update.StudentIsNotInProperState({ uuAppErrorMap }, { id: uuObject.id, state: uuObject.state });
    }

    // HDS 6
    let artifactEnvironment;
    // 6.1.A
    if (
      (dtoIn.name && dtoIn.name !== uuObject.name) ||
      (dtoIn.surname && dtoIn.surname !== uuObject.surname) ||
      (dtoIn.code && dtoIn.code !== uuObject.code)
    ) {
      // 6.1.A.1
      const uuObcName = `${dtoIn.name || uuObject.name} ${dtoIn.surname || uuObject.surname}`;
      const uuObcSetBasicAttrsDtoIn = {
        id: uuObject.artifactId,
        code: dtoIn.code,
        name: uuObcName
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
    // 7.1
    const previousUid = uuObject.uuIdentity;
    try {
      // 7.1.A.
      uuObject = await this.dao.update({
        ...uuObject,
        ...dtoIn,
        address: { ...uuObject.address, ...dtoIn.address },
        contactInfo: { ...uuObject.contactInfo, ...dtoIn.contactInfo }
      });
    } catch (e) {
      // 7.1.B.
      // 7.1.B.1
      throw new Errors.Update.StudentUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 8, 8.1, 8.1.A
    if (dtoIn.uuIdentity && dtoIn.uuIdentity !== previousUid) {
      // 8.1.A.1. 8.1.A.1.A
      try {
        // 8.1.A.1.A.1
        await this.classDao.updateStudentRelation(uuObject.id.toString(), { uuIdentity: dtoIn.uuIdentity });
        // 8.1.A.1.A.2.
        await this.subjectDao.updateStudentRelation(uuObject.id.toString(), { uuIdentity: dtoIn.uuIdentity });
      } catch (e) {
        // 8.1.A.1.B.
        // 8.1.A.1.B.1
        throw new Errors.Update.StudentDaoUpdateRelationsFailed({ uuAppErrorMap }, e);
      }
    }

    // HDS 9
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap
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
    // 1.1
    let uuSchoolKit = await this.schoolKitDao.getByAwid(awid);
    // 1.2.
    if (!uuSchoolKit) {
      // 1.2.A.
      // 1.2.A.1.
      throw new Errors.UpdateByRelatedPerson.UuSchoolkitDoesNotExist({ uuAppErrorMap }, { awid });
    }
    // 1.3
    // 1.3.A.
    if (uuSchoolKit.state !== SchoolkitMainAbl.states.active) {
      // 1.3.A.1
      throw new Errors.UpdateByRelatedPerson.UuSchoolKitIsNotInCorrectState(
        { uuAppErrorMap },
        { awid: awid, state: uuSchoolKit.state, expectedState: SchoolkitMainAbl.states.active }
      );
    }

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
    if (dtoIn.code) {
      // 3.1.A.1.
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    } else {
      // 3.1.B.
      // 3.1.B.1.
      uuObject = await this.dao.get(awid, dtoIn.id);
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (!uuObject) {
      // 4.1.A.1
      throw new Errors.UpdateByRelatedPerson.StudentNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.UpdateByRelatedPerson.StudentIsNotInProperState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6
    // 6.1
    const userUid = session.getIdentity().getUuIdentity();
    // 6.2
    const isRelatedPerson =
      uuObject.relatedPersonList && uuObject.relatedPersonList.find(rp => rp.uuIdentity === userUid);
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
        contactInfo: { ...uuObject.contactInfo, ...dtoIn.contactInfo }
      });
    } catch (e) {
      // 7.1.B.
      // 7.1.B.1
      throw new Errors.UpdateByRelatedPerson.StudentUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 8
    return {
      ...uuObject,
      uuAppErrorMap
    };
  }
}

module.exports = new StudentAbl();

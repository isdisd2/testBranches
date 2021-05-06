"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { UriBuilder } = require("uu_appg01_server").Uri;
const { Config } = require("uu_appg01_server").Utils;
const AppClientTokenHelper = require("./helpers/app-client-token-helper.js");
const UuBtHelper = require("./helpers/uu-bt-helper.js");
const ScriptEngineHelper = require("./helpers/scripts-helpers");
const InstanceChecker = require("../components/instance-checker");
const { Schemas, SchoolKit } = require("./common-constants");
const { Activity, TYPES: activityTypes, dateFunctions } = require("../components/activity");
const crypto = require("crypto");
const ConsoleUriHelper = require("../components/console-uri-helper");

const Errors = require("../api/errors/school-year-error.js");
const WARNINGS = {
  createUnsupportedKeys: {
    code: `${Errors.Create.UC_CODE}unsupportedKeys`,
  },
  createFailedToCreateActivity: {
    code: `${Errors.Create.UC_CODE}failedToCreateActivity`,
    message: "System failed to create new activity.",
  },
  failedToDeleteAfterRollback: {
    code: `${Errors.Create.UC_CODE}failedToDeleteAfterRollback`,
  },
  getUnsupportedKeys: {
    code: `${Errors.Get.UC_CODE}unsupportedKeys`,
  },
  loadUnsupportedKeys: {
    code: `${Errors.Load.UC_CODE}unsupportedKeys`,
  },
  listUnsupportedKeys: {
    code: `${Errors.List.UC_CODE}unsupportedKeys`,
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
  deleteUnsupportedKeys: {
    code: `${Errors.Delete.UC_CODE}unsupportedKeys`,
  },
  deleteSchoolYearNotFound: {
    code: `${Errors.Delete.UC_CODE}schoolYearNotFound`,
    message: "School year not found.",
  },
};

const TYPE_CODE = "uu-schoolkit-schoolg01/schoolYear";
const CLASS_FOLDER = "Classes";
const DEFAULT_PAGE_INFO = {
  pageIndex: 0,
  pageSize: 1000,
};
const STATES = Object.freeze({
  initial: "initial",
  active: "active",
  warning: "warning",
  problem: "problem",
  passive: "passive",
  closed: "closed",
});

class SchoolYearAbl {
  constructor() {
    this.validator = Validator.load();
    this.states = STATES;
    this.typeCode = TYPE_CODE;
    this.dao = DaoFactory.getDao(Schemas.SCHOOL_YEAR);
    this.schoolKitDao = DaoFactory.getDao(Schemas.SCHOOLKIT);
    this.classDao = DaoFactory.getDao(Schemas.CLASS);
  }

  /**
   * Creates the new school year manually.
   * @param uri
   * @param dtoIn
   * @param session
   * @param uuAppErrorMap
   * @returns {relatedPerson, artifactEnvironment, uuAppErrorMap }
   */
  async create(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithoutPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.Create, allowedStates, uuAppErrorMap);

    // HDS 2
    // 2.1, 2.2, 2.3, 2.3.1
    let validationResult = this.validator.validate("schoolYearCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.createUnsupportedKeys.code,
      Errors.Create.InvalidDtoIn
    );

    // HDS 3, 3.1, 3.1.A
    if (dtoIn.startDate > dtoIn.endDate)
      // 3.1.A.1
      throw new Errors.Create.StartDateIsHigherThanEndDate({ uuAppErrorMap });

    // HDS 4, 4.1.A
    if (dtoIn.previousSchoolYearId) {
      // 4.1.A.1, 4.1.A.1.1
      const previousSchoolYear = await this.dao.get(awid, dtoIn.previousSchoolYearId);
      // 4.1.A.1.2, 4.1.A.1.2.1, 4.1.A.1.2.1.A
      if (!previousSchoolYear) {
        // 4.1.A.1.2.1.A.1
        throw new Errors.Create.PreviousSchoolYearNotFound({ uuAppErrorMap }, { id: dtoIn.previousSchoolYearId });
      }
      // 4.1.A.2.
      if (dtoIn.endDate < previousSchoolYear.endDate)
        // 4.1.A.2.1
        throw new Errors.Create.PreviousSchoolYearEndDateIsHigherThenCurrentEndDate({ uuAppErrorMap });
    }
    // HDS 5
    let schoolYear;
    // 5.1
    const uuObject = { awid, state: this.states.initial, ...dtoIn };
    // 5.2
    // 5.2.A
    if (!uuObject.code) {
      // 5.2.A.1
      uuObject.code = crypto.randomBytes(16).toString("hex");
    }
    // 5.3
    // 5.3.A
    try {
      schoolYear = await this.dao.create(uuObject);
      // 5.3.B
    } catch (e) {
      // 5.3.B.1
      throw new Errors.Create.SchoolYearCreateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 6
    // 6.1
    const uuUnitDtoIn = {
      name: schoolYear.name,
      desc: schoolYear.desc,
      code: schoolYear.code + "_unit",
      location: uuSchoolKit.btSchoolYearId,
      responsibleRoleCode: session.getIdentity().getUuIdentity(),
    };

    // 6.2
    let callOpts = {};
    let uuUnit;
    const { btBaseUri } = uuSchoolKit;
    let error;
    // 6.2.A
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
      uuUnit = await UuBtHelper.uuUnit.create(btBaseUri, uuUnitDtoIn, callOpts);
    } catch (err) {
      // 6.2.B
      // 6.2.B.1

      // 6.2.B.1.A
      try {
        await this.dao.delete(schoolYear);
        // 6.2.B.1.B.
      } catch (e) {
        // 6.2.B.1.B.1.
        ValidationHelper.addWarning(
          uuAppErrorMap,
          WARNINGS.failedToDeleteAfterRollback.code,
          "System failed to delete uuObject after an exception has been thrown in uuObcIfc/create use case.",
          Errors.Create.failedToDeleteAfterRollback
        );
      }
      // 6.2.B.2
      switch (err.code) {
        // 6.2.B.2.A.
        case "invalidHomeFolderState":
          // 6.2.B.2.A.1
          error = new Errors.Create.LocationIsNotInProperState({ uuAppErrorMap });
          //6.2.B.2.B.
          break;
        // 6.2.B.2.A.1
        case "locationDoesNotExist":
          // 6.2.B.2.B.1.
          error = new Errors.Create.FolderDoesNotExist({ uuAppErrorMap });
          break;
        //  6.2.B.2.C.
        case "userIsNotAuthorizedToAddArtifact":
          error = new Errors.Create.UserIsNotAuthorizedToAddArtifact({ uuAppErrorMap });
          break;
        // 6.2.B.2.D.
        default:
          //6.2.B.2.D.1.
          error = new Errors.Create.CallUuUnitCreateFailed({ uuAppErrorMap }, { cause: err });
          break;
      }
      throw error;
    }

    // HDS 7
    // 7.1
    const uuObUri = UriBuilder.parse(uri)
      .setUseCase("schoolYearDetail")
      .setParameters({ id: schoolYear.id.toString() })
      .toUri()
      .toString();
    const uuObcDtoIn = {
      typeCode: this.typeCode,
      name: dtoIn.name,
      code: schoolYear.code,
      desc: schoolYear.desc,
      uuObId: schoolYear.id.toString(),
      uuObUri,
      location: uuUnit.id,
    };

    // 7.2
    let uuObc;
    // 7.2.A.
    try {
      uuObc = await UuBtHelper.uuObc.create(btBaseUri, uuObcDtoIn, callOpts);
    } catch (err) {
      // 7.2.B.
      // 7.2.B.1.A.
      try {
        await this.dao.delete(awid, schoolYear);
      } catch (e) {
        // 7.2.B.1.B.
        //7.2.B.1.B.1.
        ValidationHelper.addWarning(
          uuAppErrorMap,
          WARNINGS.failedToDeleteAfterRollback.code,
          "System failed to delete uuObject after an exception has been thrown in uuObc/create use case.",
          Errors.Create.FailedToDeleteAfterRollback
        );
      }
      let returnError;
      // 7.2.B.2.
      switch (err.code) {
        //7.2.B.2.A.
        case "invalidHomeFolderState":
          // 7.2.B.2.A.1.
          returnError = new Errors.Create.LocationIsNotInProperState({ uuAppErrorMap });
          break;
        // 7.2.B.2.B.
        case "locationDoesNotExist":
          // 7.2.B.2.B.1.
          returnError = new Errors.Create.FolderDoesNotExist({ uuAppErrorMap });
          break;
        // 7.2.B.2.C.
        case "userIsNotAuthorizedToAddArtifact":
          returnError = new Errors.Create.UserIsNotAuthorizedToAddArtifact({ uuAppErrorMap });
          break;
        // 7.2.B.2.D
        default:
          // 7.2.B.2.D.1.
          returnError = new Errors.Create.CallUuObcCreateFailed({ uuAppErrorMap }, { cause: err });
          break;
      }
      throw returnError;
    }

    // HDS 8
    // 8.1.
    let uuFolder;
    let folderCode = schoolYear.code + "/classes";
    const createFolderDtoIn = {
      name: CLASS_FOLDER,
      code: folderCode,
      location: uuUnit.id,
    };
    // 8.1.A.
    try {
      // 8.1.A.1.
      uuFolder = await UuBtHelper.uuFolder.create(btBaseUri, createFolderDtoIn, callOpts);
      // 8.1.B.
    } catch (err) {
      // 8.1.B.1.
      // 8.1.B.1.A.
      try {
        // 8.1.B.1.A.1.
        await this.dao.delete(awid, schoolYear);
        // 8.1.B.1.A.2
        await UuBtHelper.uuObc.setState(btBaseUri, { id: uuObc.id, state: "closed" }, callOpts);
        // 8.1.B.1.A.3.
        await UuBtHelper.uuObc.delete(btBaseUri, { id: uuObc.id }, callOpts);
      } catch (e) {
        // 8.1.B.1.B.1.
        ValidationHelper.addWarning(
          uuAppErrorMap,
          WARNINGS.failedToDeleteAfterRollback.code,
          "System failed to delete uuObject after an exception has been thrown in uuObc/create use case.",
          { cause: e }
        );
      }
      // 8.1.B.2.
      throw new Errors.Create.CallFolderCreateFailed({ uuAppErrorMap }, { cause: err });
    }

    // HDS 9
    const { code: artifactCode, id: artifactId } = uuObc;
    // 9.1.
    try {
      // 9.1.A.
      schoolYear = await this.dao.updateByCode({
        ...schoolYear,
        artifactCode,
        artifactId,
        classesFolderId: uuFolder.id,
      });
      // 9.1.B.
    } catch (e) {
      // 9.1.B.1.
      throw new Errors.Create.SchoolYearUpdateDaoFailed({ uuAppErrorMap }, { cause: e });
    }

    // HDS 10
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
        code: schoolYear.code + "_unit/executives",
        sideB: unitExecutivesId,
        uuBtBaseUri: uuSchoolKit.btBaseUri,
      },
    };
    try {
      ScriptEngineHelper.uuSchoolKitSetUnitPermissions(uuSchoolKit.scriptEngineUri, scriptDtoIn, session); //FIXME: waiting for BT fix
    } catch (e) {
      throw e;
    }

    let principal = (uuSchoolKit.principal && uuSchoolKit.principal.code) || null;

    const activityDtoIn = {
      id: schoolYear.artifactId,
      submitterCode: session.getIdentity().getUuIdentity(),
      solverList: [
        {
          solverCode: session.getIdentity().getUuIdentity(),
        },
      ],
      type: activityTypes.info,
      name: Activity.createLsiContent("schoolYear", "name"),
      desc: Activity.createLsiContent("schoolYear", "desc"),
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

    // HDS 11
    return {
      ...schoolYear,
      activityResult,
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
    let validationResult = this.validator.validate("schoolYearGetDtoInType", dtoIn);
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
      throw new Errors.Get.SchoolYearNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5
    return {
      ...uuObject,
      uuAppErrorMap,
    };
  }

  async load(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.Load, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("schoolYearLoadDtoInType", dtoIn);
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
      throw new Errors.Load.SchoolYearNotFound({ uuAppErrorMap }, { id: dtoIn.id });
    }

    // HDS 5
    // 5.1
    let artifactEnvironment;
    const loadEnvDtoIn = { id: uuObject.artifactId };
    // 5.2
    try {
      // 5.2.A
      let callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      artifactEnvironment = await UuBtHelper.uuObc.loadEnvironment(uuSchoolKit.btBaseUri, loadEnvDtoIn, callOpts);
    } catch (e) {
      // 5.2.B
      // 5.2.B.1
      throw new Errors.Load.FailedToLoadUuObcEnvironment({ uuAppErrorMap }, e);
    }

    // HDS 6
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  async list(awid, dtoIn, uuAppErrorMap = {}) {
    // HDS 1

    // HDS 1.1 - 1.3
    let uuSchoolKit = await InstanceChecker.ensureInstance(awid, Errors.List, uuAppErrorMap);

    // HDS 2
    // 2.2.
    // 2.2.1.
    // 2.3.
    // 2.3.1.
    let validationResult = this.validator.validate("schoolYearListDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.listUnsupportedKeys.code,
      Errors.List.InvalidDtoIn
    );

    // HDS 3
    // 3.1
    let result = await this.dao.list(awid, dtoIn.pageInfo || DEFAULT_PAGE_INFO);

    // HDS 4
    return {
      ...result,
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
    let validationResult = this.validator.validate("schoolYearUpdateDtoInType", dtoIn);
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

    // 3.2
    // 3.2.1
    // 3.2.1.A
    if (!uuObject) {
      // 3.2.1.A.1
      throw new Errors.Update.SchoolYearNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 4
    // 4.1
    // 4.1.A
    if (uuObject.state === this.states.closed) {
      // 4.1.A.1.
      throw new Errors.Update.SchoolYearIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 5, 5.1
    let callOpts;
    try {
      // 5.1.1
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
    } catch (e) {
      // 5.1.1.A
      throw new Errors.Update.AppClientTokenCreateFailed({ uuAppErrorMap }, e);
    }

    // HDS 6
    let artifactEnvironment;
    // 6.1, 6.1.A
    if (
      (dtoIn.name && dtoIn.name !== uuObject.name) ||
      (dtoIn.code && dtoIn.code !== uuObject.code) ||
      (dtoIn.desc && dtoIn.desc !== uuObject.desc)
    ) {
      // 6.1.A.1.
      const uuObcSetBasicAttrsDtoIn = {
        id: uuObject.artifactId,
        code: dtoIn.code,
        name: dtoIn.name,
        desc: dtoIn.desc,
      };

      // 6.1.A.2.
      // 6.1.A.2.A.
      try {
        artifactEnvironment = await UuBtHelper.uuObc.setBasicAttributes(
          uuSchoolKit.btBaseUri,
          uuObcSetBasicAttrsDtoIn,
          callOpts
        );
        // 6.1.A.2.B.
      } catch (e) {
        // 6.1.A.2.B.1.
        throw new Errors.Update.SetBasicUuObcArtifactAttributesFailed({ uuAppErrorMap }, e);
      }
    }

    // HDS 7
    // 7.1, 7.1.A.
    if ((dtoIn.name && dtoIn.name !== uuObject.name) || (dtoIn.code && dtoIn.code !== uuObject.code)) {
      // 7.1.A.1.
      const uuUnitSetBasicAttrsDtoIn = {
        id: artifactEnvironment.unit,
        name: dtoIn.name,
        code: dtoIn.code + "_unit",
      };

      // 7.1.A.2.
      try {
        // 7.1.A.2.A.
        await UuBtHelper.uuUnit.setBasicAttributes(uuSchoolKit.btBaseUri, uuUnitSetBasicAttrsDtoIn, callOpts);
        //  7.1.A.2.B.
      } catch (e) {
        // 7.1.A.2.B.1.
        throw new Errors.Update.SetBasicUuUnitArtifactAttributesFailed({ uuAppErrorMap }, { cause: e });
      }
    }

    // HDS 8, 8.1
    // 8.1.A
    if (dtoIn.code && dtoIn.code !== uuObject.code) {
      // 8.1.A.1.
      const uuFolderSetBasicAttrsDtoIn = {
        id: uuObject.classesFolderId,
        code: dtoIn.code + "/classes",
      };

      // 8.1.A.2.
      // 8.1.A.2.A.
      try {
        await UuBtHelper.uuFolder.setBasicAttributes(uuSchoolKit.btBaseUri, uuFolderSetBasicAttrsDtoIn, callOpts);
        //8.1.A.2.B
      } catch (e) {
        // 8.1.A.2.B.1.
        throw new Errors.Update.SetBasicUuFolderAttributesFailed({ uuAppErrorMap }, e);
      }
    }

    // HDS 9
    try {
      const updatedSchoolYear = { ...uuObject, ...dtoIn };
      // 9.1
      // 9.1.A
      uuObject = await this.dao.update(updatedSchoolYear);
    } catch (e) {
      // 9.1.B
      // 9.1.B.1
      throw new Errors.Update.SchoolYearUpdateDaoFailed({ uuAppErrorMap }, e);
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
    let validationResult = this.validator.validate("schoolYearSetStateDtoInType", dtoIn);
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
      throw new Errors.SetState.SchoolYearNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5
    // 5.1
    // 5.1.A
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.SetState.SchoolYearIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6
    // 6.1
    let callOpts;
    const setStateDtoIn = {
      id: uuObject.artifactId,
      state: dtoIn.state,
      desc: dtoIn.setStateReason,
      data: dtoIn.stateData,
    };
    // 6.2
    try {
      // 6.2.A
      callOpts = await AppClientTokenHelper.createToken(uri, uuSchoolKit.btBaseUri, session);
      await UuBtHelper.uuObc.setState(uuSchoolKit.btBaseUri, setStateDtoIn, callOpts);
    } catch (e) {
      // 6.2.B
      // 6.2.B.1
      throw new Errors.SetState.UuObcSetStateFailed({ uuAppErrorMap }, e);
    }

    // HDS 7
    // 7.1
    if (dtoIn.setStateReason !== undefined) {
      const setStateReason = uuObject.setStateReason || [];
      setStateReason.push(dtoIn.setStateReason);
      uuObject.setStateReason = setStateReason;
    }
    try {
      const updatedSchoolYear = { ...uuObject, state: dtoIn.state };
      // 7.1.A
      uuObject = await this.dao.update(updatedSchoolYear);
    } catch (e) {
      // 7.1.B
      // 7.1.B.1
      throw new Errors.SetState.SchoolYearUpdateDaoFailed({ uuAppErrorMap }, e);
    }

    // HDS 8
    // 8.1
    let artifactEnvironment;
    const syncAttrsDtoIn = {
      id: uuObject.artifactId,
      stateData: {
        ...dtoIn.stateData,
        name: uuObject.name,
        code: uuObject.code,
      },
    };
    // 8.2
    try {
      // 8.2.A
      artifactEnvironment = await UuBtHelper.uuObc.synchronize(uuSchoolKit.btBaseUri, syncAttrsDtoIn, callOpts);
    } catch (e) {
      // 8.2.B
      // 8.2.B.1
      throw new Errors.SetState.SynchronizeArtifactAttributesFailed({ uuAppErrorMap }, e);
    }

    // HDS 9
    return {
      ...uuObject,
      artifactEnvironment,
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

    // HDS 2, 2.1., 2.2.1., 2.3., 2.3.1.
    let validationResult = this.validator.validate("schoolYearSetFinalStateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.setFinalStateUnsupportedKeys.code,
      Errors.SetFinalState.InvalidDtoIn
    );

    // HDS 3
    // HDS 3.1.
    let uuObject;
    // HDS 3.1.A.
    if (dtoIn.id) {
      //3.1.A.1.
      uuObject = await this.dao.get(awid, dtoIn.id);
    } else {
      // HDS 3.1.B., 3.1.B.1.
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4, 4.1., 4.1.A.
    if (!uuObject) {
      // 4.1.A.1.
      throw new Errors.SetFinalState.SchoolYearNotFound({ uuAppErrorMap }, { id: dtoIn.id, code: dtoIn.code });
    }

    // HDS 5, 5.1., 5.1.A.
    if (uuObject.state === this.states.closed) {
      // 5.1.A.1.
      throw new Errors.SetFinalState.SchoolYearIsNotInCorrectState(
        { uuAppErrorMap },
        { id: uuObject.id, state: uuObject.state }
      );
    }

    // HDS 6, 6.1.
    let classList = await this.classDao.listBySchoolYearId(awid, uuObject.id.toString());

    // 6.2.
    // 6.2.1.
    classList.itemList.forEach((uuClass) => {
      // 6.2.1.1.A.
      if (uuClass.state !== this.states.closed) {
        // 6.2.1.1.A.1.
        throw new Errors.SetFinalState.ExistingActiveRelatedClass({ uuAppErrorMap });
      }
    });

    // HDS 7, 7.1.
    // HDS 7.2., 7.2.A.
    let callOpts = {};
    const { btBaseUri } = uuSchoolKit;
    const dtoInListByArtifactB = { id: uuObject.artifactId };
    let listByArtifactBDtoOut;
    try {
      callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
      listByArtifactBDtoOut = await UuBtHelper.uuArtifactIfc.listByArtifactB(btBaseUri, dtoInListByArtifactB, callOpts);
    } catch (e) {
      // 7.2.B., 7.2.B.1.
      throw new Errors.SetFinalState.CheckExistenceOfActiveRelatedArtifactsFailed({ uuAppErrorMap }, e);
    }

    // HDS 7.3., 7.3.1., 7.3.1.1.
    listByArtifactBDtoOut.itemList.forEach((artifact) => {
      // 7.3.1.1.A.
      if (artifact.artifactAState !== this.states.closed) {
        // 7.3.1.1.A.1.
        throw new Errors.SetFinalState.ExistingActiveAARBySideB({ uuAppErrorMap });
      }
    });

    // HDS 8, 8.1., 8.1.A.
    let artifactEnvironment;
    let uuObcSetStateDtoIn = {
      id: uuObject.artifactId,
      state: this.states.closed,
      desc: dtoIn.desc,
      data: dtoIn.stateData,
    };
    try {
      artifactEnvironment = await UuBtHelper.uuObc.setState(btBaseUri, uuObcSetStateDtoIn, callOpts);
      // HDS 8.1.B.
    } catch (e) {
      // HDS 8.1.B.1.
      throw new Errors.SetFinalState.UuObcSetStateFailed({ uuAppErrorMap }, e);
    }

    // HDS 9, 9.1., 9.2., 9.2.A.
    try {
      const updatedSchoolYear = { ...uuObject, state: this.states.closed };
      uuObject = await this.dao.updateByCode(updatedSchoolYear);

      // HDS 9.2.B.
    } catch (e) {
      // 9.2.B.1.
      throw new Errors.SetFinalState.SchoolYearDaoUpdateFailed({ uuAppErrorMap }, e);
    }

    // HDS 10
    return {
      ...uuObject,
      artifactEnvironment,
      uuAppErrorMap,
    };
  }

  async delete(uri, dtoIn, session, uuAppErrorMap = {}) {
    // HDS 1
    const awid = uri.getAwid();

    // HDS 1.1 - 1.3
    let allowedStates = SchoolKit.NonFinalStatesWithPassive;
    let uuSchoolKit = await InstanceChecker.ensureInstanceAndState(awid, Errors.Delete, allowedStates, uuAppErrorMap);

    // HDS 2, 2.1., 2.2., 2.2.1., 2.3, 2.3.1
    let validationResult = this.validator.validate("schoolYearDeleteDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.deleteUnsupportedKeys.code,
      Errors.Delete.InvalidDtoIn
    );

    // HDS 3
    // HDS 3.1.
    let uuObject;
    // HDS 3.1.A.
    if (dtoIn.id) {
      // HDS 3.1.A.1.
      uuObject = await this.dao.get(awid, dtoIn.id);
      // HDS 3.1.B.
    } else {
      // HDS 3.1.B.1.
      uuObject = await this.dao.getByCode(awid, dtoIn.code);
    }

    // HDS 4, 4.1., 4.1.A., 4.1.A.1
    if (!uuObject) {
      ValidationHelper.addWarning(
        uuAppErrorMap,
        WARNINGS.deleteSchoolYearNotFound.code,
        WARNINGS.deleteSchoolYearNotFound.message,
        { id: dtoIn.id, code: dtoIn.code }
      );

      return { uuAppErrorMap };
    }

    // HDS 5, 5.1., 5.1.A
    if (uuObject.state !== this.states.closed) {
      // 5.1.A.1.
      throw new Errors.Delete.SchoolYearIsNotInFinalState({ uuAppErrorMap });
    }

    // HDS 6, 6.1.
    const deleteDtoIn = { id: uuObject.artifactId };
    const { btBaseUri } = uuSchoolKit;
    // HDS 6.2., 6.2.A.
    try {
      let callOpts = await AppClientTokenHelper.createToken(uri, btBaseUri, session);
      await UuBtHelper.uuObc.delete(btBaseUri, deleteDtoIn, callOpts);
      // 6.2.B
    } catch (e) {
      // 6.2.B.1
      throw new Errors.Delete.deleteUuObcFailed({ uuAppErrorMap }, { cause: e, code: dtoIn.code });
    }

    // HDS 7
    try {
      await this.dao.delete(uuObject);
    } catch (e) {
      // 7.1.
      throw new Errors.Delete.SchoolYearDaoDeleteFailed({ uuAppErrorMap }, e);
    }

    // HDS 8
    return { uuAppErrorMap };
  }
}

module.exports = new SchoolYearAbl();
